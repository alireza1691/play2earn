// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {Town, TownBase, TownWar} from "../../src/new/Town.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {LandsProxy} from "../../src/new/LandsProxy.sol";

/// @dev Stands in for Lands: Town asks it who owns a parcel and what type it is.
contract MockLands {
    mapping(uint256 => address) private owners;
    mapping(uint256 => uint8) private types;

    function setOwner(uint256 tokenId, address newOwner) external { owners[tokenId] = newOwner; }
    function setType(uint256 tokenId, uint8 t) external { types[tokenId] = t; }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = owners[tokenId];
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }
    function ownerOfOrZero(uint256 tokenId) external view returns (address) { return owners[tokenId]; }
    function landType(uint256 tokenId) external view returns (uint8) { return types[tokenId]; }
}

/// @notice Wild parcels: nobody owns them, they refill on their own clock, and
///         raiding one is an ordinary battle against a garrison that grew back.
contract WildLandsTest is Test {
    Town town;
    MockLands lands;
    PLOT plot;

    uint256 constant HOME = 101101;
    uint256 constant WILD = 140140;
    uint256 constant SPEARMAN = 1;
    // Barracks level 2 only unlocks the first two warrior types.
    uint256 constant MACEMAN = 0;

    uint256 constant WILD_GOODS = 2000 ether;
    uint256 constant REGEN_PERIOD = 7 days;

    function setUp() public {
        vm.warp(1_000_000);
        lands = new MockLands();
        plot = new PLOT(address(this));

        Town implementation = new Town();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(plot), address(lands), true, address(this))
            )
        );
        town = Town(address(proxy));
        town.setWarModule(address(new TownWar()));

        lands.setOwner(HOME, address(this));
        lands.setType(WILD, 1); // Jungle, and deliberately left unowned

        uint256[2] memory plotSide = [uint256(25_000_000 ether), 25_000_000 ether];
        uint256[2] memory goodsSide = [uint256(50_000_000 ether), 50_000_000 ether];
        plot.approve(address(town), 50_000_000 ether);
        town.seedPool(plotSide, goodsSide);
    }

    function _army(uint256 landId, uint256 warriorType) internal view returns (uint256) {
        return town.getArmy(landId)[warriorType];
    }

    function _goods(uint256 landId) internal view returns (uint256, uint256) {
        uint256[2] memory g = town.getLandIdData(landId).goodsBalance;
        return (g[0], g[1]);
    }

    /// Recruits macemen at home and marches them at the wild parcel.
    function _raid(uint256 macemen) internal {
        uint256[6] memory order;
        order[MACEMAN] = macemen;
        TownWar(address(town)).recruit(HOME, order);

        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = macemen;
        TownWar(address(town)).dispatchArmy(sent, HOME, WILD);
        skip(6 hours); // long enough to arrive anywhere on the map
        TownWar(address(town)).war(HOME, 0);
    }

    /// Stands the garrison down so the next raid has room to recruit again.
    function _clearGarrison() internal {
        uint256[6] memory standing;
        standing[MACEMAN] = _army(HOME, MACEMAN);
        if (standing[MACEMAN] > 0) {
            TownWar(address(town)).disbandArmy(HOME, standing);
        }
    }

    /// The survivors still have to march back before they can be absorbed.
    function _comeHome() internal {
        skip(6 hours);
        TownWar(address(town)).joinDispatchedArmy(HOME, 0);
    }

    // ---------------------------------------------------------------- existence

    /// A wild parcel is attackable before anyone mints it. That is the whole point:
    /// no 1,000 NFTs have to be minted up front.
    function test_unmintedWildLandCanBeAttacked() public {
        assertEq(lands.ownerOfOrZero(WILD), address(0), "nobody owns it");
        assertTrue(TownWar(address(town)).isWildLand(WILD), "but it is wild");
        _raid(40); // must not revert with InvalidLand
    }

    /// An unminted parcel that is not wild is still off limits.
    function test_unmintedTownLandIsStillInvalid() public {
        uint256 emptyTown = 145145; // type defaults to 0 = Town, unowned
        uint256[6] memory order;
        order[MACEMAN] = 10;
        TownWar(address(town)).recruit(HOME, order);

        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = 10;
        vm.expectRevert(TownBase.InvalidLand.selector);
        TownWar(address(town)).dispatchArmy(sent, HOME, emptyTown);
    }

    // ---------------------------------------------------------------- garrison

    /// An untouched parcel stands at full strength, so the first raid meets the
    /// whole garrison rather than an empty field.
    function test_firstRaidMeetsAFullGarrison() public {
        assertEq(_army(WILD, SPEARMAN), 0, "nothing written yet");
        _raid(40);
        // The garrison was materialised on the way in and then took losses.
        assertGt(_army(WILD, SPEARMAN), 0, "defenders existed");
        assertLt(_army(WILD, SPEARMAN), 30, "and they lost some");
    }

    function test_raidTakesLoot() public {
        (uint256 foodBefore,) = _goods(HOME);
        _raid(40);
        _comeHome();
        (uint256 foodAfter,) = _goods(HOME);
        assertGt(foodAfter, foodBefore, "the raiders came home with something");
    }

    /// Too small a force loses, exactly as against a player.
    function test_anUnderstrengthRaidLoses() public {
        uint256[6] memory order;
        order[MACEMAN] = 15;
        TownWar(address(town)).recruit(HOME, order);
        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = 15;
        TownWar(address(town)).dispatchArmy(sent, HOME, WILD);
        skip(6 hours);
        (bool success,,) = TownWar(address(town)).war(HOME, 0);
        assertFalse(success, "fifteen macemen do not take a camp");
    }

    // ---------------------------------------------------------------- regrowth

    /// Goods and defenders come back on a seven-day clock, with no keeper and no
    /// scheduled transaction — the refill is computed on the way into the battle.
    function test_wildLandRefillsOverTime() public {
        _raid(90);
        _comeHome();
        _clearGarrison();

        (uint256 strippedFood,) = _goods(WILD);
        assertLt(strippedFood, WILD_GOODS, "the first raid stripped it");

        // A full period later the parcel pays out again. Comparing its balance
        // would prove nothing, since the second raid strips it too — so measure
        // what actually comes home, net of raising the army.
        skip(REGEN_PERIOD);
        (uint256 homeBefore,) = _goods(HOME);
        _raid(90);
        _comeHome();
        (uint256 homeAfter,) = _goods(HOME);

        assertGt(homeAfter, homeBefore, "the jungle grew back and paid out again");
    }

    /// The refill is capped: waiting ten periods does not stack ten refills.
    function test_regrowthIsCappedAtFull() public {
        _raid(90);
        _comeHome();
        _clearGarrison();

        skip(REGEN_PERIOD * 10);
        town.claimAll(HOME); // any call; the parcel refills on the next raid
        _raid(90);

        (uint256 food, uint256 gold) = _goods(WILD);
        assertLe(food, WILD_GOODS, "never above a full parcel");
        assertLe(gold, WILD_GOODS, "never above a full parcel");
        assertLe(_army(WILD, SPEARMAN), 30, "garrison caps too");
    }

    // ---------------------------------------------------------------- cooldown

    /// Without this a bot would sit on one parcel and take every refill.
    function test_sameRaiderMustWaitADay() public {
        _raid(40);
        _comeHome();

        uint256[6] memory order;
        order[MACEMAN] = 40;
        TownWar(address(town)).recruit(HOME, order);
        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = 40;

        vm.expectRevert(TownBase.RaidTooSoon.selector);
        TownWar(address(town)).dispatchArmy(sent, HOME, WILD);

        skip(24 hours);
        TownWar(address(town)).dispatchArmy(sent, HOME, WILD); // now allowed
    }

    /// The cooldown is per raider, so it does not shield the parcel from everyone.
    function test_cooldownIsPerRaiderNotPerParcel() public {
        _raid(40);
        _comeHome();

        address rival = address(0xB0B);
        uint256 rivalLand = 105105; // seeded by initialize
        lands.setOwner(rivalLand, rival);

        vm.startPrank(rival);
        uint256[6] memory order;
        order[MACEMAN] = 40;
        TownWar(address(town)).recruit(rivalLand, order);
        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = 40;
        TownWar(address(town)).dispatchArmy(sent, rivalLand, WILD); // a different raider is free to go
        vm.stopPrank();
    }

    // ---------------------------------------------------------------- ownership

    /// The rule that keeps a sold parcel from printing goods forever: once someone
    /// owns it, it is not wild any more, so nothing regenerates.
    function test_onceOwnedAParcelStopsBeingWild() public {
        assertTrue(TownWar(address(town)).isWildLand(WILD), "wild while unowned");

        lands.setOwner(WILD, address(0xB0B)); // the owner unlocked and sold it
        assertFalse(TownWar(address(town)).isWildLand(WILD), "an owned parcel is never wild");

        // Even though its type is still Jungle in Lands.
        assertEq(lands.landType(WILD), 1, "type unchanged");
    }

    function test_wildLandNeverDrawsAStarterPack() public {
        _raid(40);
        assertTrue(town.hasStarted(WILD), "marked started, so no free 400/400");
    }

    // ---------------------------------------------------------------- preview

    /// An untouched jungle reads as empty in storage but is in fact full. The
    /// preview has to say full, or the UI sends armies at a parcel it believes
    /// holds nothing.
    function test_previewShowsAnUntouchedJungleAsFull() public {
        (uint256 stored,) = _goods(WILD);
        assertEq(stored, 0, "storage really is empty");
        assertEq(_army(WILD, SPEARMAN), 0, "and no garrison is written");

        (uint256[2] memory goods, uint256 garrison,) =
            TownWar(address(town)).previewWildLand(WILD);
        assertEq(goods[0], WILD_GOODS, "but a raider would find full food");
        assertEq(goods[1], WILD_GOODS, "and full gold");
        assertEq(garrison, 30, "defended by the full garrison");
    }

    /// After a raid it reports what is actually left, then climbs back.
    function test_previewTracksRegrowth() public {
        _raid(90);
        _comeHome();
        _clearGarrison();

        (uint256[2] memory justAfter,,) = TownWar(address(town)).previewWildLand(WILD);

        skip(REGEN_PERIOD / 2);
        (uint256[2] memory halfway,,) = TownWar(address(town)).previewWildLand(WILD);
        assertGt(halfway[0], justAfter[0], "food grows back");

        skip(REGEN_PERIOD * 5);
        (uint256[2] memory later, uint256 garrison,) =
            TownWar(address(town)).previewWildLand(WILD);
        assertEq(later[0], WILD_GOODS, "and stops at full");
        assertEq(garrison, 30, "garrison too");
    }

    /// The preview must agree with what the raid then actually finds.
    function test_previewMatchesWhatTheRaidTakes() public {
        _raid(90);
        _comeHome();
        _clearGarrison();
        skip(REGEN_PERIOD / 3);

        (uint256[2] memory predicted, uint256 predictedGarrison,) =
            TownWar(address(town)).previewWildLand(WILD);

        // Materialise it by raiding; the contract runs the same arithmetic.
        uint256[6] memory order;
        order[MACEMAN] = 90;
        TownWar(address(town)).recruit(HOME, order);
        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = 90;
        skip(24 hours); // clear the raid cooldown
        TownWar(address(town)).dispatchArmy(sent, HOME, WILD);

        // The preview moves with the clock, so re-read it at the moment of battle.
        skip(6 hours);
        (uint256[2] memory atBattle, uint256 garrisonAtBattle,) =
            TownWar(address(town)).previewWildLand(WILD);
        assertGe(atBattle[0], predicted[0], "only grows while the army marches");
        assertGe(garrisonAtBattle, predictedGarrison, "so does the garrison");

        TownWar(address(town)).war(HOME, 0);
        // Whatever the defender had, the battle used the same numbers: the
        // survivors are a share of what the preview reported.
        assertLe(_army(WILD, SPEARMAN), garrisonAtBattle, "defenders came from the preview");
    }

    function test_previewIsZeroForOrdinaryLand() public {
        (uint256[2] memory goods, uint256 garrison,) =
            TownWar(address(town)).previewWildLand(HOME);
        assertEq(goods[0], 0, "a town is not previewable as wild");
        assertEq(garrison, 0, "nor does it report a garrison");
    }

    function test_wildParametersAreReadable() public {
        (uint256 perType, uint256 size, uint256 wType, uint256 period, uint256 cooldown) =
            TownWar(address(town)).wildLandParameters();
        assertEq(perType, WILD_GOODS, "stock");
        assertEq(size, 30, "garrison");
        assertEq(wType, SPEARMAN, "spearmen defend");
        assertEq(period, REGEN_PERIOD, "regrowth period");
        assertEq(cooldown, 24 hours, "raid cooldown");
    }

    // ---------------------------------------------------------------- invariant

    /// Goods conjured by regrowth must be counted, or the supply invariant breaks.
    function test_regrowthIsAddedToTheGlobalSupply() public {
        uint256[2] memory before = town.getTotalExistedGood();
        _raid(40);
        uint256[2] memory afterRaid = town.getTotalExistedGood();

        assertGt(afterRaid[0], before[0], "wild food entered the world");
        assertGt(afterRaid[1], before[1], "wild gold entered the world");
    }
}
