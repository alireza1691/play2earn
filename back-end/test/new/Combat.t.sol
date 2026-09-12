// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {Town, TownBase, TownWar, Utils} from "../../src/new/Town.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {LandsProxy} from "../../src/new/LandsProxy.sol";

contract MockLands {
    mapping(uint256 => address) private owners;
    function setOwner(uint256 tokenId, address newOwner) external { owners[tokenId] = newOwner; }
    function ownerOf(uint256 tokenId) external view returns (address) { return owners[tokenId]; }
    function ownerOfOrZero(uint256 tokenId) external view returns (address) { return owners[tokenId]; }
    /// Every parcel in these tests is an ordinary Town unless a test says otherwise.
    function landType(uint256) external pure returns (uint8) { return 0; }
}

/// @dev Exposes the library so its properties can be tested directly.
contract WarHarness {
    function resolve(uint256 ap, uint256 ah, uint256 dp, uint256 dh)
        external pure returns (bool, uint256, uint256, uint256)
    {
        return Utils.calculateWar(ap, ah, dp, dh);
    }
}

contract CombatTest is Test {
    Town town;
    MockLands lands;
    PLOT plot;
    WarHarness war;

    uint256 constant ATTACKER = 101101;
    uint256 constant DEFENDER = 105105;
    uint256 constant MACEMAN = 0;

    function setUp() public {
        vm.warp(1_000_000);
        lands = new MockLands();
        plot = new PLOT(address(this));
        war = new WarHarness();

        Town implementation = new Town();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(plot), address(lands), true, address(this))
            )
        );
        town = Town(address(proxy));
        // War is a separate deployed contract Town delegatecalls into; without
        // this every dispatch reverts with WarModuleNotSet.
        town.setWarModule(address(new TownWar()));
        lands.setOwner(ATTACKER, address(this));
        lands.setOwner(DEFENDER, address(this));

        uint256[2] memory b = [uint256(25_000_000 ether), 25_000_000 ether];
        uint256[2] memory g = [uint256(50_000_000 ether), 50_000_000 ether];
        plot.approve(address(town), 50_000_000 ether);
        town.seedPool(b, g);
    }

    // ================================================================
    //                        formula properties
    // ================================================================

    /// Every result must be a valid percentage. The old formula could return a
    /// winner with fewer survivors than the loser, which then underflowed.
    function testFuzz_H07_resultsAreAlwaysValidPercentages(
        uint64 ap, uint64 ah, uint64 dp, uint64 dh
    ) public {
        (bool success, uint256 atk, uint256 dfn, uint256 loot) = war.resolve(ap, ah, dp, dh);

        assertLe(atk, 100, "attacker survivors over 100%");
        assertLe(dfn, 100, "defender survivors over 100%");
        assertLe(loot, 50, "loot over the cap");
        if (!success) {
            assertEq(loot, 0, "a failed attack loots nothing");
        }
    }

    /// The winner never comes out worse than the loser. This is the property whose
    /// absence made `war` revert on some winning attacks.
    function testFuzz_H07_winnerNeverFaresWorseThanLoser(
        uint64 ap, uint64 ah, uint64 dp, uint64 dh
    ) public {
        vm.assume(uint256(ap) * ah != uint256(dp) * dh);
        (bool success, uint256 atk, uint256 dfn,) = war.resolve(ap, ah, dp, dh);
        if (success) {
            assertGe(atk, dfn, "attacker won but lost more");
        } else {
            assertGe(dfn, atk, "defender held but lost more");
        }
    }

    /// H-08: an exact tie used to fall through every branch and wipe out both sides.
    function test_H08_exactTieIsHandled() public {
        (bool success, uint256 atk, uint256 dfn,) = war.resolve(100, 100, 100, 100);
        assertFalse(success, "ties go to the defender");
        // Not the old 0/0 wipeout.
        assertGt(atk, 0, "attacker keeps something");
        assertGt(dfn, 0, "defender keeps something");
        assertEq(dfn, Utils.WinnerMinSurvivors, "closest possible fight hits the floor");
    }

    /// H-09: an undefended town used to divide by zero.
    function test_H09_zeroArmiesDoNotDivideByZero() public {
        (bool success, uint256 atk, uint256 dfn, uint256 loot) = war.resolve(100, 100, 0, 0);
        assertTrue(success, "an empty town falls");
        assertEq(atk, 100, "no losses against nobody");
        assertEq(dfn, 0, "nothing was there");
        assertEq(loot, 50, "a rout carries the maximum");

        // Nobody at all: nothing happens either way.
        (bool s2, uint256 a2, uint256 d2, uint256 l2) = war.resolve(0, 0, 0, 0);
        assertFalse(s2, "no attack, no capture");
        assertEq(a2, 100, "no losses");
        assertEq(d2, 100, "no losses");
        assertEq(l2, 0, "no loot");
    }

    /// More attackers must never produce a worse outcome.
    function test_H07_outcomeIsMonotoneInArmySize() public {
        int256 previous = type(int256).min;
        for (uint256 n = 1; n <= 60; n++) {
            // n Knights (att 90, hp 100) against 30 Shieldmen (def 80, hp 110).
            (bool success, uint256 atk, uint256 dfn,) =
                war.resolve(n * 90, n * 100, 30 * 80, 30 * 110);

            int256 score = success
                ? int256(1000 + atk)
                : -int256(dfn);
            assertGe(score, previous, "adding warriors made things worse");
            previous = score;
        }
    }

    /// The tuning constant does what it claims: it is the floor for the winner.
    function test_winnerFloorMatchesTheConstant() public {
        (, uint256 atk,,) = war.resolve(1000, 1000, 999, 1000); // as close as it gets
        assertGe(atk, Utils.WinnerMinSurvivors, "winner never drops below the floor");
        assertEq(Utils.WinnerMinSurvivors, 40, "tuned for a slightly aggressive game");
    }

    // ================================================================
    //                     retreat and capacity
    // ================================================================

    function _dispatch(uint256 count) internal {
        uint256[6] memory order;
        order[MACEMAN] = count;
        TownWar(address(town)).recruit(ATTACKER, order);

        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = count;
        TownWar(address(town)).dispatchArmy(sent, ATTACKER, DEFENDER);
    }

    /// H-18: retreating must be possible while the army is still marching.
    function test_H18_canRetreatBeforeArrival() public {
        _dispatch(10);
        // The march has barely started.
        skip(1 minutes);
        TownWar(address(town)).retreat(ATTACKER, 0); // used to revert with "Not arrived yet"
    }

    /// Turning back early is quick; turning back at the gates costs the full march.
    function test_H18_returnTripMatchesDistanceTravelled() public {
        _dispatch(10);
        uint256 fullTrip = TownWar(address(town)).getDispatchTime(ATTACKER, DEFENDER);

        skip(2 minutes);
        TownWar(address(town)).retreat(ATTACKER, 0);
        uint256 quickReturn = TownWar(address(town)).getRemainedDispatchTimestamp(ATTACKER, 0);
        assertLt(quickReturn, fullTrip, "an early turn-back is short");
        assertApproxEqAbs(quickReturn, 2, 1, "roughly the two minutes already marched");
    }

    /// H-18: the retreat fee is burned, not gifted to the target.
    function test_H18_retreatCostIsBurnedNotPaidToTheDefender() public {
        _dispatch(10);
        uint256 defenderGoldBefore = town.getLandIdData(DEFENDER).goodsBalance[1];

        skip(1 minutes);
        TownWar(address(town)).retreat(ATTACKER, 0);

        assertEq(
            town.getLandIdData(DEFENDER).goodsBalance[1],
            defenderGoldBefore,
            "the defender must not profit from a retreat"
        );
    }

    // ================================================================
    //                     the capacity exploit
    // ================================================================

    /// Dispatch, refill the garrison, then try to bring the first army home.
    /// Without the check at the gate this ended with double the allowed army.
    function test_returningArmyCannotExceedCapacity() public {
        uint256 capacity = 2 * 50; // training camp level 2
        _dispatch(capacity);
        assertEq(town.getArmy(ATTACKER)[MACEMAN], 0, "garrison emptied");

        // Refill while they are away — allowed by design.
        uint256[6] memory order;
        order[MACEMAN] = capacity;
        TownWar(address(town)).recruit(ATTACKER, order);

        skip(1 minutes);
        TownWar(address(town)).retreat(ATTACKER, 0);
        skip(2 hours);

        vm.expectRevert(TownBase.MaxCapacity.selector);
        TownWar(address(town)).joinDispatchedArmy(ATTACKER, 0);

        assertEq(town.getArmy(ATTACKER)[MACEMAN], capacity, "still exactly at capacity");
    }

    /// ...and disbanding makes room, so the army is never stranded.
    function test_disbandingMakesRoomForTheReturningArmy() public {
        uint256 capacity = 2 * 50;
        _dispatch(capacity);

        uint256[6] memory order;
        order[MACEMAN] = capacity;
        TownWar(address(town)).recruit(ATTACKER, order);

        skip(1 minutes);
        TownWar(address(town)).retreat(ATTACKER, 0);
        skip(2 hours);

        TownWar(address(town)).disbandArmy(ATTACKER, order); // stand the replacements down
        assertEq(town.getArmy(ATTACKER)[MACEMAN], 0, "garrison cleared");

        TownWar(address(town)).joinDispatchedArmy(ATTACKER, 0);
        assertEq(town.getArmy(ATTACKER)[MACEMAN], capacity, "veterans came home");
        assertEq(TownWar(address(town)).getDispatchedArmies(ATTACKER).length, 0, "record consumed");
    }

    function test_disbandCannotRemoveMoreThanYouHave() public {
        uint256[6] memory order;
        order[MACEMAN] = 5;
        TownWar(address(town)).recruit(ATTACKER, order);

        uint256[6] memory tooMany;
        tooMany[MACEMAN] = 6;
        vm.expectRevert();
        TownWar(address(town)).disbandArmy(ATTACKER, tooMany);
    }

    function test_disbandRejectsAnEmptyOrder() public {
        uint256[6] memory nothing;
        vm.expectRevert(TownBase.InsufficientArmy.selector);
        TownWar(address(town)).disbandArmy(ATTACKER, nothing);
    }

    // ================================================================
    //                     G-08 — editWarrior moved here
    // ================================================================

    /// It now edits the array the game actually fights with. On Vars it edited a
    /// second copy that Town never read, so it changed nothing at all.
    function test_G08_editWarriorChangesRealCombatStats() public {
        uint256[6] memory order;
        order[MACEMAN] = 10;
        TownWar(address(town)).recruit(ATTACKER, order);

        (uint256 attackBefore,,,) = town._getArmyInfo(ATTACKER);

        uint8[3] memory stats = [uint8(120), 30, 70]; // attack 45 -> 120
        town.editWarrior(MACEMAN, stats, 7 ether);

        (uint256 attackAfter,,,) = town._getArmyInfo(ATTACKER);
        assertEq(attackBefore, 10 * 45, "original attack power");
        assertEq(attackAfter, 10 * 120, "the edit reached the battle stats");
    }

    function test_G08_editWarriorIsBounded() public {
        uint8[3] memory tooStrong = [uint8(250), 30, 70];
        vm.expectRevert(TownBase.InvalidItem.selector);
        town.editWarrior(MACEMAN, tooStrong, 7 ether);

        uint8[3] memory fine = [uint8(50), 30, 70];
        vm.expectRevert(TownBase.InvalidItem.selector);
        town.editWarrior(MACEMAN, fine, 500 ether); // price out of range

        vm.expectRevert(TownBase.InvalidItem.selector);
        town.editWarrior(99, fine, 7 ether); // no such warrior
    }

    function test_G08_onlyOwnerCanEditWarriors() public {
        uint8[3] memory stats = [uint8(50), 30, 70];
        vm.prank(address(0xBEEF));
        vm.expectRevert();
        town.editWarrior(MACEMAN, stats, 7 ether);
    }

    function test_onlyTheOwnerCanDisband() public {
        uint256[6] memory order;
        order[MACEMAN] = 1;
        TownWar(address(town)).recruit(ATTACKER, order);

        vm.prank(address(0xBEEF));
        vm.expectRevert(TownBase.CallerIsNotOwner.selector);
        TownWar(address(town)).disbandArmy(ATTACKER, order);
    }
}
