// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {Town, TownBase, TownWar} from "../../src/new/Town.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {LandsProxy} from "../../src/new/LandsProxy.sol";

/// @dev Town only ever calls ownerOf() on the Lands contract.
contract MockLands {
    mapping(uint256 => address) private owners;

    function setOwner(uint256 tokenId, address newOwner) external {
        owners[tokenId] = newOwner;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }

    function ownerOfOrZero(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }

    /// Every parcel in these tests is an ordinary Town unless a test says otherwise.
    function landType(uint256) external pure returns (uint8) { return 0; }
}

/// @notice Each test pins one of the group-1 fixes applied in src/new.
///         Every one of these fails against src/Town.sol.
contract TownFixesTest is Test {
    Town town;
    MockLands lands;
    PLOT plot;

    // The constructor seeds these three lands with 10000 food + 10000 gold and
    // level-2 barracks / townhall / training camp / walls.
    uint256 constant LAND = 101101;
    uint256 constant LAND_B = 105105;

    uint256 constant FOOD = 0;
    uint256 constant GOLD = 1;

    event UpgradeBarracks(uint256 indexed landTokenId, uint256 currentLevel);

    // Storage slots used by the vm.store helpers below. Read them back with
    // `forge inspect Town storage-layout` after any change to the state variables —
    // removing Vars in G-08 shifted every one of these by one.
    uint256 constant TotalGoodsSlot = 7;
    uint256 constant LandDataSlot = 14;

    function setUp() public {
        vm.warp(1_000_000);
        lands = new MockLands();
        plot = new PLOT(address(this));
        town = _deployTown(true);
        lands.setOwner(LAND, address(this));
        lands.setOwner(LAND_B, address(this));
        _seedPool(town);
    }

    /// 1 PLOT buys 2 goods, so the goods side is seeded at twice the PLOT side.
    function _seedPool(Town target) internal {
        uint256[2] memory plotSide = [uint256(25_000_000 ether), 25_000_000 ether];
        uint256[2] memory goodsSide = [uint256(50_000_000 ether), 50_000_000 ether];
        plot.approve(address(target), plotSide[0] + plotSide[1]);
        target.seedPool(plotSide, goodsSide);
    }

    /// @dev Town is UUPS now: the implementation holds no state, the proxy does.
    function _deployTown(bool seedTestLands) internal returns (Town) {
        Town implementation = new Town();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(plot), address(lands), seedTestLands, address(this))
            )
        );
        Town deployed = Town(address(proxy));
        // War is a separate deployed contract Town delegatecalls into; without
        // this every dispatch reverts with WarModuleNotSet.
        deployed.setWarModule(address(new TownWar()));
        return deployed;
    }

    function _balances(uint256 landId) internal view returns (uint256 food, uint256 gold) {
        uint256[2] memory goods = town.getLandIdData(landId).goodsBalance;
        return (goods[FOOD], goods[GOLD]);
    }

    // ---------------------------------------------------------------- H-01

    /// Upgrading a Farm must charge requiredFood from food and requiredGold from
    /// gold — the same order buildResourceBuilding uses. The old code passed them
    /// swapped, so a Farm upgrade billed 125 food and 75 gold instead of 150/250.
    function test_H01_upgradeChargesFoodAndGoldInTheRightOrder() public {
        town.buildResourceBuilding(LAND, 0); // Farm: 75 food, 125 gold
        skip(6 hours);
        town.claimRevenue(1); // bank what is owed so the delta below is the charge alone

        (uint256 foodBefore, uint256 goldBefore) = _balances(LAND);
        // upgradeResourceBuilding claims first, and that revenue lands in food.
        uint256 revenuePaidDuringUpgrade = town.getCurrentRevenue(1);

        town.upgradeResourceBuilding(1, LAND);
        (uint256 foodAfter, uint256 goldAfter) = _balances(LAND);

        // level 1 -> 2 means a 2x multiplier on the base costs.
        assertEq(foodBefore + revenuePaidDuringUpgrade - foodAfter, 75 ether * 2, "food charge");
        // A Farm never produces gold, so this delta is the charge on its own.
        // The old code billed 75 ether * 2 here.
        assertEq(goldBefore - goldAfter, 125 ether * 2, "gold charge");
    }

    // ---------------------------------------------------------------- H-02

    /// finishNow is priced in gold. A land rich in gold but poor in food must be
    /// able to pay; the old code tested the food balance against a gold price.
    function test_H02_finishNowChecksGoldNotFood() public {
        // finishNow subtracts from totalExistedGood[1] without the guard _spendGoods
        // uses, so the global gold counter has to be primed first or it underflows.
        town.buildResourceBuilding(LAND, 1); // Gold mine
        skip(300 days);
        town.claimRevenue(1);

        // Start a build on LAND_B and let it run down to a few minutes remaining.
        // Resource builds take BaseBuildTimestamp (2 hours) since H-20.
        town.buildResourceBuilding(LAND_B, 0);
        skip(2 hours - 3 minutes);

        // Drain LAND_B's food, leaving plenty of gold.
        (uint256 food,) = _balances(LAND_B);
        town.transferGoods(FOOD, food - 1 ether, LAND_B, LAND);

        (uint256 foodBefore, uint256 goldBefore) = _balances(LAND_B);
        uint256 cost = town.getFinishCost(LAND_B);
        assertGt(cost, foodBefore, "test needs cost above the food balance");
        assertLt(cost, goldBefore, "test needs cost below the gold balance");

        town.finishNow(LAND_B); // reverts InsufficientGoods on the old code

        (uint256 foodAfter, uint256 goldAfter) = _balances(LAND_B);
        assertEq(foodAfter, foodBefore, "food must be untouched");
        assertEq(goldBefore - goldAfter, cost, "gold must cover the cost");
        assertEq(town.getRemainedBuildTimestamp(LAND_B), 0, "worker must be free");
    }

    // ---------------------------------------------------------------- H-03

    /// claimAll iterates the land's own buildings. With one building the old loop
    /// ran twice and reverted on an out-of-bounds read.
    function test_H03_claimAllWorksWithASingleBuilding() public {
        town.buildResourceBuilding(LAND, 0);
        skip(6 hours);

        (uint256 foodBefore,) = _balances(LAND);
        town.claimAll(LAND); // panics on the old code
        (uint256 foodAfter,) = _balances(LAND);

        assertGt(foodAfter, foodBefore, "farm revenue must land");
    }

    /// ...and with three buildings it must claim all three, not just the first two.
    function test_H03_claimAllCoversEveryBuilding() public {
        town.buildResourceBuilding(LAND, 0);
        skip(6 hours);
        town.buildResourceBuilding(LAND, 1); // Gold mine
        skip(6 hours);
        town.buildResourceBuilding(LAND, 1);
        skip(6 hours);

        // Snapshot before claiming: since C-01, claiming advances each clock, so
        // reading the revenue afterwards would return ~0.
        uint256 secondBuildingRevenue = town.getCurrentRevenue(2);
        uint256 thirdBuildingRevenue = town.getCurrentRevenue(3);
        assertGt(thirdBuildingRevenue, 0, "third building should have earned");

        (, uint256 goldBefore) = _balances(LAND);
        town.claimAll(LAND);
        (, uint256 goldAfter) = _balances(LAND);

        assertEq(
            goldAfter - goldBefore,
            secondBuildingRevenue + thirdBuildingRevenue,
            "both gold mines must be claimed"
        );
    }

    // ---------------------------------------------------------------- H-11

    /// The event must carry the level the land actually holds now.
    function test_H11_upgradeEventReportsTheRealLevel() public {
        town.buildTownhall(LAND); // 2 -> 3, needed before barracks can reach 3
        skip(24 hours);

        vm.expectEmit(true, false, false, true);
        emit UpgradeBarracks(LAND, 3); // old code emitted 4

        town.buildBarracks(LAND);

        assertEq(town.getLandIdData(LAND).barracksLevel, 3, "stored level");
    }

    // ---------------------------------------------------------------- M-02

    function test_M02_invalidGoodIndexRevertsCleanly() public {
        vm.expectRevert(TownBase.InvalidItem.selector);
        TownWar(address(town)).sellGood(LAND, 2, 1 ether, 0);

        vm.expectRevert(TownBase.InvalidItem.selector);
        TownWar(address(town)).swapGoods(LAND, 2, 1 ether, 0);

        vm.expectRevert(TownBase.InvalidItem.selector);
        town.transferGoods(2, 1 ether, LAND, LAND_B);
    }

    // ---------------------------------------------------------------- M-03

    /// Selling the whole balance of a good must be allowed; the old bound was <=.
    function test_M03_canSellTheEntireBalance() public {
        // Give the global supply counter something to work with.
        town.buildResourceBuilding(LAND, 0);
        skip(300 days);
        town.claimRevenue(1);

        // Leave LAND_B with a small, exact food balance.
        (uint256 food,) = _balances(LAND_B);
        town.transferGoods(FOOD, food - 10 ether, LAND_B, LAND);
        (uint256 remaining,) = _balances(LAND_B);
        assertEq(remaining, 10 ether, "setup");

        TownWar(address(town)).sellGood(LAND_B, FOOD, remaining, 0); // reverts InsufficientGoods on the old code

        (uint256 afterSale,) = _balances(LAND_B);
        assertEq(afterSale, 0, "balance must be emptied");
    }

    // ---------------------------------------------------------------- H-17

    /// Dispatching must charge exactly DispatchCostPerWarrior per warrior sent.
    /// The old code also billed a stray, undocumented amount first.
    function test_H17_dispatchChargesOnlyTheDispatchCost() public {
        uint256[6] memory recruits;
        recruits[0] = 4; // Macemen, barracks level 2 covers types 0 and 1
        TownWar(address(town)).recruit(LAND, recruits);

        uint256[] memory sent = new uint256[](6);
        sent[0] = 3;

        (uint256 foodBefore,) = _balances(LAND);
        TownWar(address(town)).dispatchArmy(sent, LAND, LAND_B);
        (uint256 foodAfter,) = _balances(LAND);

        assertEq(foodBefore - foodAfter, 3 * 1 ether, "3 warriors x DispatchCostPerWarrior");
        assertEq(town.getArmy(LAND)[0], 1, "one maceman stays home");
    }

    // ================================================================
    //                    GROUP 2 — balance decisions
    // ================================================================

    // ---------------------------------------------------------------- C-01

    /// Claiming twice in a row must pay once.
    function test_C01_secondClaimInTheSameBlockPaysNothing() public {
        town.buildResourceBuilding(LAND, 0);
        skip(6 hours);

        (uint256 start,) = _balances(LAND);
        town.claimRevenue(1);
        (uint256 afterFirst,) = _balances(LAND);
        assertGt(afterFirst, start, "first claim pays");

        town.claimRevenue(1);
        (uint256 afterSecond,) = _balances(LAND);
        assertEq(afterSecond, afterFirst, "second claim must pay nothing");
    }

    /// Option B: an early claim banks the whole periods and carries the remainder.
    function test_C01_partialPeriodCarriesOver() public {
        town.buildResourceBuilding(LAND, 0);

        skip(5 hours); // one whole period, two hours left over
        (uint256 before5h,) = _balances(LAND);
        town.claimRevenue(1);
        (uint256 after5h,) = _balances(LAND);
        assertEq(after5h - before5h, 2 ether, "one period paid");

        // Only one more hour passes. Under option A the clock would have been reset
        // to the 5h mark and this would pay nothing; the carried-over 2h completes
        // a second period instead.
        skip(1 hours);
        town.claimRevenue(1);
        (uint256 after6h,) = _balances(LAND);
        assertEq(after6h - after5h, 2 ether, "carried remainder completes a period");
    }

    // ---------------------------------------------------------------- C-02

    function test_C02_nonOwnerCannotSellSomeoneElsesGoods() public {
        address stranger = address(0xBEEF);
        vm.prank(stranger);
        vm.expectRevert(TownBase.CallerIsNotOwner.selector);
        TownWar(address(town)).sellGood(LAND, FOOD, 1 ether, 0);
    }

    // ---------------------------------------------------------------- H-04

    /// A narrow order must only be charged for what it actually contains.
    function test_H04_foodIsChargedPerWarriorType() public {
        uint256[6] memory order;
        order[0] = 10; // Macemen only

        (uint256 foodBefore, uint256 goldBefore) = _balances(LAND);
        TownWar(address(town)).recruit(LAND, order);
        (uint256 foodAfter, uint256 goldAfter) = _balances(LAND);

        // 3 ether per warrior. The old code billed 210 ether by re-counting these
        // ten warriors once for every untouched type.
        assertEq(foodBefore - foodAfter, 30 ether, "food charge");
        assertEq(goldBefore - goldAfter, 70 ether, "gold charge: 10 x 7 ether");
    }

    // ---------------------------------------------------------------- H-05

    /// Training camp level 2 must actually hold 2 x BaseArmyCapacity = 100.
    function test_H05_theFullCapacityIsReachable() public {
        uint256[6] memory order;

        order[0] = 60;
        TownWar(address(town)).recruit(LAND, order); // the old code reverted here

        order[0] = 40;
        TownWar(address(town)).recruit(LAND, order);
        assertEq(town.getArmy(LAND)[0], 100, "capacity reached exactly");

        order[0] = 1;
        vm.expectRevert(TownBase.MaxCapacity.selector);
        TownWar(address(town)).recruit(LAND, order);
    }

    /// Dispatched warriors deliberately stay outside the cap.
    function test_H05_dispatchedArmyDoesNotCountTowardCapacity() public {
        uint256[6] memory order;
        order[0] = 100;
        TownWar(address(town)).recruit(LAND, order);

        uint256[] memory sent = new uint256[](6);
        sent[0] = 100;
        TownWar(address(town)).dispatchArmy(sent, LAND, LAND_B);

        // The garrison is empty again, so a fresh 100 may be raised.
        TownWar(address(town)).recruit(LAND, order);
        assertEq(town.getArmy(LAND)[0], 100, "garrison refilled");
    }

    // ---------------------------------------------------------------- H-06

    function test_H06_wallBonusCurve() public {
        assertEq(town.getWallBonus(0), 0, "no wall");
        assertEq(town.getWallBonus(1), 50, "5.0%");
        assertEq(town.getWallBonus(5), 250, "25.0%");
        assertEq(town.getWallBonus(10), 500, "50.0% at the tier break");
        // Held at the cap until levels above 10 are unlocked.
        assertEq(town.getWallBonus(15), 500, "capped");
        assertEq(town.getWallBonus(20), 500, "capped");
        assertEq(town.getWallBonus(999), 500, "capped");
    }

    /// The second tier is already wired: raising WallBonusCap to 750 yields
    /// 2.5% per level from 11 to 20. Locked in here so the intent survives.
    function test_H06_secondTierMathIsInPlace() public {
        uint256 firstTier = 10 * 50;                 // levels 1-10
        uint256 secondTier = (20 - 10) * 25;         // levels 11-20
        assertEq(firstTier + secondTier, 750, "level 20 reaches 75.0%");
    }

    // ---------------------------------------------------------------- H-19

    function test_H19_mainnetDeploymentSeedsNothing() public {
        Town mainnetTown = _deployTown(false);

        uint256[2] memory goods = mainnetTown.getLandIdData(LAND).goodsBalance;
        assertEq(goods[FOOD], 0, "no free food");
        assertEq(goods[GOLD], 0, "no free gold");
        assertEq(mainnetTown.getLandIdData(LAND).townhallLevel, 0, "no free buildings");
        assertFalse(mainnetTown.hasStarted(LAND), "not started either");
    }

    // ---------------------------------------------------------------- H-20

    function test_H20_buildTakesTwoHoursNotSix() public {
        town.buildResourceBuilding(LAND, 0);
        assertEq(town.getRemainedBuildTimestamp(LAND), 120, "2 hours, in minutes");
    }

    // ================================================================
    //                    GROUP 3 — first batch
    // ================================================================

    // ---------------------------------------------------------------- N-02

    /// A freshly minted land must be able to start playing.
    function test_N02_freshLandGetsAStarterPack() public {
        Town mainnetTown = _deployTown(false);
        uint256 fresh = 140140;
        lands.setOwner(fresh, address(this));

        assertFalse(mainnetTown.hasStarted(fresh), "not started yet");
        mainnetTown.startLand(fresh);

        uint256[2] memory goods = mainnetTown.getLandIdData(fresh).goodsBalance;
        assertEq(goods[FOOD], mainnetTown.StarterFood(), "starter food");
        assertEq(goods[GOLD], mainnetTown.StarterGold(), "starter gold");
        assertTrue(mainnetTown.hasStarted(fresh), "marked started");
    }

    /// The pack buys exactly the four resource buildings a townhall-0 land may hold,
    /// and cannot reach a townhall. That is the whole sizing rationale.
    function test_N02_packBuysFourBuildingsAndNoTownhall() public {
        Town mainnetTown = _deployTown(false);
        uint256 fresh = 140140;
        lands.setOwner(fresh, address(this));

        for (uint8 i = 0; i < 4; i++) {
            mainnetTown.buildResourceBuilding(fresh, i % 2); // alternate farm / mine
            skip(2 hours);
        }

        uint256[2] memory goods = mainnetTown.getLandIdData(fresh).goodsBalance;
        assertEq(goods[FOOD], 0, "food exactly spent");
        assertEq(goods[GOLD], 0, "gold exactly spent");

        vm.expectRevert(TownBase.InsufficientBalance.selector);
        mainnetTown.buildTownhall(fresh);
    }

    /// Any owner action triggers the pack, so a player never has to know it exists.
    function test_N02_firstActionAutoStartsTheLand() public {
        Town mainnetTown = _deployTown(false);
        uint256 fresh = 140140;
        lands.setOwner(fresh, address(this));

        mainnetTown.buildResourceBuilding(fresh, 0);
        assertTrue(mainnetTown.hasStarted(fresh), "auto-started");
    }

    function test_N02_packIsGrantedOnlyOnce() public {
        Town mainnetTown = _deployTown(false);
        uint256 fresh = 140140;
        lands.setOwner(fresh, address(this));

        mainnetTown.startLand(fresh);
        vm.expectRevert(TownBase.LandAlreadyStarted.selector);
        mainnetTown.startLand(fresh);

        // Selling the land must not hand the buyer a second pack.
        lands.setOwner(fresh, address(0xB0B));
        vm.prank(address(0xB0B));
        vm.expectRevert(TownBase.LandAlreadyStarted.selector);
        mainnetTown.startLand(fresh);
    }

    // ---------------------------------------------------------------- N-03

    /// Townhall costs double per level, so climbing from 2 to 10 legitimately costs
    /// ~306,000 of each good — far more than any test can farm. Write the level
    /// straight into storage and check the guard.
    ///
    /// Since G-01, LandIdData is packed: slot offset 3 holds
    /// latestBuildTimeStamp (bits 0-63), barracks (64-71), wall (72-79),
    /// townhall (80-87), trainingCamp (88-95). So the write is read-mask-write.
    function _setTownhallLevel(uint256 landId, uint256 level) internal {
        uint256 slot = uint256(keccak256(abi.encode(landId, uint256(LandDataSlot)))) + 3;
        uint256 current = uint256(vm.load(address(town), bytes32(slot)));
        uint256 cleared = current & ~(uint256(0xff) << 80);
        vm.store(address(town), bytes32(slot), bytes32(cleared | (level << 80)));
    }

    function _fundLand(uint256 landId, uint256 amount) internal {
        uint256 base = uint256(keccak256(abi.encode(landId, uint256(LandDataSlot))));
        vm.store(address(town), bytes32(base), bytes32(amount));     // food
        vm.store(address(town), bytes32(base + 1), bytes32(amount)); // gold
        // totalExistedGood must move with the balances or the now-unconditional
        // burn in _spendGoods underflows — the rule the invariant suite enforces.
        vm.store(address(town), bytes32(TotalGoodsSlot), bytes32(amount));
        vm.store(address(town), bytes32(TotalGoodsSlot + 1), bytes32(amount));
    }

    function test_N03_townhallStopsAtTen() public {
        uint256 maxLevel = town.MaxTownhallLevel();

        _setTownhallLevel(LAND, maxLevel);
        assertEq(town.getLandIdData(LAND).townhallLevel, maxLevel, "level written");

        vm.expectRevert(TownBase.TownhallMaxLevel.selector);
        town.buildTownhall(LAND);

        // One below the cap is still allowed.
        _setTownhallLevel(LAND, maxLevel - 1);
        _fundLand(LAND, 1_000_000 ether);
        town.buildTownhall(LAND);
        assertEq(town.getLandIdData(LAND).townhallLevel, maxLevel, "reached the cap");
    }

    /// Packing must not have disturbed the neighbouring fields.
    function test_G01_packedFieldsStayIndependent() public {
        town.buildResourceBuilding(LAND, 0);
        uint256 stamp = town.getLandIdData(LAND).latestBuildTimeStamp;
        assertGt(stamp, block.timestamp, "timestamp survives");

        _setTownhallLevel(LAND, 7);
        Town.LandIdDataView memory data = town.getLandIdData(LAND);
        assertEq(data.townhallLevel, 7, "townhall written");
        assertEq(data.latestBuildTimeStamp, stamp, "timestamp untouched");
        assertEq(data.barracksLevel, 2, "barracks untouched");
        assertEq(data.wallLevel, 2, "wall untouched");
        assertEq(data.trainingCampLevel, 2, "camp untouched");
    }

    /// Walls, barracks and the training camp are all gated behind the townhall, so
    /// capping it at 10 caps them too — which is what the 50% wall bonus assumes.
    function test_N03_capAlsoBoundsTheOtherBuildings() public {
        assertEq(town.MaxTownhallLevel(), 10, "townhall cap");
        assertEq(town.getWallBonus(town.MaxTownhallLevel()), 500, "wall bonus at the cap");
    }

    // ---------------------------------------------------------------- C-05

    /// Coordinates split on 1000, so 123145 is (123, 145) and neighbouring lands
    /// are genuinely close. Under the old /100 split these were nonsense.
    function test_C05_travelTimeMatchesMapDistance() public {
        // One step east: distance 1 -> 150 seconds -> 2 minutes after rounding.
        assertEq(TownWar(address(town)).getDispatchTime(120120, 120121), 2, "neighbour");

        // Opposite corners: distance ~140 -> ~350 minutes.
        uint256 corner = TownWar(address(town)).getDispatchTime(100100, 199199);
        assertGt(corner, 300, "corner to corner is hours, not seconds");
        assertLt(corner, 360, "and under six hours");

        // Travel must be symmetric and zero to itself.
        assertEq(TownWar(address(town)).getDispatchTime(120120, 130130), TownWar(address(town)).getDispatchTime(130130, 120120), "symmetric");
        assertEq(TownWar(address(town)).getDispatchTime(120120, 120120), 0, "same land");
    }

    // ---------------------------------------------------------------- C-07

    function test_C07_ownerCanPauseAndResumeTheGame() public {
        town.pause();

        vm.expectRevert(); // EnforcedPause
        town.buildResourceBuilding(LAND, 0);
        vm.expectRevert();
        town.claimAll(LAND);
        vm.expectRevert();
        town.deposit(1 ether);

        // Views stay readable while paused.
        town.getLandIdData(LAND);

        town.unpause();
        town.buildResourceBuilding(LAND, 0); // works again
    }

    function test_C07_strangerCannotPause() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert();
        town.pause();
    }

    // ---------------------------------------------------------------- C-06

    // ================================================================
    //                    GROUP 3 — hardening
    // ================================================================

    // ---------------------------------------------------------------- M-04

    function test_M04_transferGoodsRejectsUnmintedAndSelfTargets() public {
        vm.expectRevert(TownBase.SameLand.selector);
        town.transferGoods(FOOD, 1 ether, LAND, LAND);

        // 140140 was never minted in the mock registry.
        vm.expectRevert(TownBase.InvalidLand.selector);
        town.transferGoods(FOOD, 1 ether, LAND, 140140);
    }

    // ---------------------------------------------------------------- M-05

    function test_M05_dispatchRejectsUnmintedAndSelfTargets() public {
        uint256[6] memory order;
        order[0] = 5;
        TownWar(address(town)).recruit(LAND, order);

        uint256[] memory sent = new uint256[](6);
        sent[0] = 1;

        vm.expectRevert(TownBase.SameLand.selector);
        TownWar(address(town)).dispatchArmy(sent, LAND, LAND);

        vm.expectRevert(TownBase.InvalidLand.selector);
        TownWar(address(town)).dispatchArmy(sent, LAND, 140140);
    }

    // ---------------------------------------------------------------- M-06

    function test_M06_dispatchesAreCapped() public {
        uint256[6] memory order;
        order[0] = 100;
        TownWar(address(town)).recruit(LAND, order);

        uint256[] memory sent = new uint256[](6);
        sent[0] = 1;

        for (uint256 i = 0; i < town.MaxDispatchedArmies(); i++) {
            TownWar(address(town)).dispatchArmy(sent, LAND, LAND_B);
        }
        assertEq(TownWar(address(town)).getDispatchedArmies(LAND).length, town.MaxDispatchedArmies(), "at the cap");

        vm.expectRevert(TownBase.TooManyDispatches.selector);
        TownWar(address(town)).dispatchArmy(sent, LAND, LAND_B);
    }

    // ---------------------------------------------------------------- M-12

    function test_M12_initializeRejectsZeroAddresses() public {
        Town implementation = new Town();
        vm.expectRevert();
        new LandsProxy(
            address(implementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(0), address(lands), false, address(this))
            )
        );
    }

    // ---------------------------------------------------------------- G-03

    /// The type limit still holds after swapping the O(n) scan for a counter.
    function test_G03_typeLimitStillCapsEachBuildingType() public {
        // Townhall 2 allows townhallLevel + 2 = 4 of a type, but the hard cap is
        // MaxResourceBuildingsCapacity / 2 = 4 as well.
        for (uint256 i = 0; i < 4; i++) {
            town.buildResourceBuilding(LAND, 0); // farms
            skip(2 hours);
        }
        vm.expectRevert(TownBase.MaxCapacity.selector);
        town.buildResourceBuilding(LAND, 0);

        // A different type is unaffected by the first type's tally.
        town.buildResourceBuilding(LAND, 1);
    }

    // ---------------------------------------------------------------- M-01

    function test_M01_tradingAndArmyMovesEmitEvents() public {
        uint256[6] memory order;
        order[0] = 3;
        TownWar(address(town)).recruit(LAND, order);

        uint256[] memory sent = new uint256[](6);
        sent[0] = 2;

        vm.recordLogs();
        TownWar(address(town)).dispatchArmy(sent, LAND, LAND_B);
        assertGt(vm.getRecordedLogs().length, 0, "dispatch must be observable");
    }

    function test_C06_townStateLivesInTheProxy() public {
        assertEq(town.owner(), address(this), "initialised through the proxy");
        // Seeded data written during initialize() is readable through the proxy.
        assertEq(town.getLandIdData(LAND).townhallLevel, 2, "seed applied to proxy storage");

        Town newImplementation = new Town();
        town.upgradeToAndCall(address(newImplementation), "");
        assertEq(town.getLandIdData(LAND).townhallLevel, 2, "state survives the upgrade");
    }
}
