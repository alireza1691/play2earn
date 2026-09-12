// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {PlotVesting} from "../../src/new/PlotVesting.sol";

/// @notice The team's 150M, and the year it cannot be touched.
contract PlotVestingTest is Test {
    PLOT plot;
    PlotVesting vesting;

    address constant TEAM = address(0x7EA);

    uint64 constant START = 1_800_000_000;
    uint64 constant CLIFF = 365 days;
    uint64 constant DURATION = 3 * 365 days;

    /// 15% of a billion.
    uint256 constant GRANT = 150_000_000 ether;

    function setUp() public {
        vm.warp(START);
        plot = new PLOT(address(this));
        vesting = new PlotVesting(
            address(plot),
            TEAM,
            START,
            CLIFF,
            DURATION
        );
        plot.transfer(address(vesting), GRANT);
    }

    // ------------------------------------------------------------ the cliff

    function test_nothingIsReleasableBeforeTheCliff() public {
        assertEq(vesting.releasable(), 0, "at start");

        vm.warp(START + CLIFF - 1);
        assertEq(vesting.releasable(), 0, "one second short");

        vm.expectRevert(PlotVesting.NothingToRelease.selector);
        vesting.release();
    }

    /// The cliff withholds the first year rather than deleting it, so a third
    /// of the grant lands in one piece the moment it passes.
    function test_theFirstYearArrivesWholeAtTheCliff() public {
        vm.warp(START + CLIFF);
        assertApproxEqRel(
            vesting.releasable(),
            GRANT / 3,
            0.001e18,
            "one year of three"
        );
    }

    // ----------------------------------------------------------- the ramp

    function test_releasesLinearlyAfterTheCliff() public {
        vm.warp(START + DURATION / 2);
        assertApproxEqRel(vesting.releasable(), GRANT / 2, 0.001e18, "half way");

        vm.warp(START + DURATION);
        assertEq(vesting.releasable(), GRANT, "fully vested");
    }

    function test_everythingIsOutByTheEnd() public {
        vm.warp(START + DURATION);
        vesting.release();

        assertEq(plot.balanceOf(TEAM), GRANT, "team holds the grant");
        assertEq(plot.balanceOf(address(vesting)), 0, "contract is empty");
        assertEq(vesting.releasable(), 0, "nothing left");
    }

    function test_releasingTwiceDoesNotPayTwice() public {
        vm.warp(START + DURATION / 2);
        vesting.release();
        uint256 first = plot.balanceOf(TEAM);

        vm.expectRevert(PlotVesting.NothingToRelease.selector);
        vesting.release();

        assertEq(plot.balanceOf(TEAM), first, "no second payment");
    }

    /// @dev Starts at the cliff, not at zero: nothing is releasable before it,
    ///      so an earlier first step reverts rather than paying nothing.
    function test_partialReleasesSumToTheWhole() public {
        uint64[5] memory steps = [
            CLIFF,
            uint64(DURATION / 2),
            uint64((DURATION * 2) / 3),
            uint64((DURATION * 5) / 6),
            DURATION
        ];
        for (uint256 i = 0; i < steps.length; i++) {
            vm.warp(START + steps[i]);
            vesting.release();
        }
        assertEq(plot.balanceOf(TEAM), GRANT, "nothing lost to rounding");
    }

    // --------------------------------------------------------- top-ups

    /// A later transfer joins the existing schedule instead of starting a new
    /// one — which is the reason `total()` counts what has already left.
    function test_aTopUpVestsOnTheOriginalTimeline() public {
        vm.warp(START + DURATION / 2);
        vesting.release();

        plot.transfer(address(vesting), GRANT);

        // Half way through, half of the larger total should be accounted for,
        // and half of that is already in the team's hands.
        assertApproxEqRel(
            plot.balanceOf(TEAM) + vesting.releasable(),
            (GRANT * 2) / 2,
            0.001e18,
            "half of the new total"
        );

        vm.warp(START + DURATION);
        vesting.release();
        assertEq(plot.balanceOf(TEAM), GRANT * 2, "all of it, eventually");
    }

    // --------------------------------------------------------- access

    /// Permissionless, because it can only ever pay the beneficiary — the team
    /// is never locked out by a lost key on the calling side.
    function test_anyoneMayTriggerTheRelease() public {
        vm.warp(START + DURATION);
        vm.prank(address(0xBEEF));
        vesting.release();
        assertEq(plot.balanceOf(TEAM), GRANT, "still paid the beneficiary");
    }

    /// There is no owner and no revoke, so there is no path that redirects a
    /// funded schedule. This is the property the whole design is for.
    function test_thereIsNoWayToRedirectTheGrant() public {
        vm.warp(START + DURATION);
        vm.prank(address(0xBEEF));
        vesting.release();
        assertEq(plot.balanceOf(address(0xBEEF)), 0, "caller gets nothing");
    }

    // --------------------------------------------------------- constructor

    function test_rejectsNonsenseParameters() public {
        vm.expectRevert(PlotVesting.ZeroAddress.selector);
        new PlotVesting(address(0), TEAM, START, CLIFF, DURATION);

        vm.expectRevert(PlotVesting.ZeroAddress.selector);
        new PlotVesting(address(plot), address(0), START, CLIFF, DURATION);

        vm.expectRevert(PlotVesting.ZeroDuration.selector);
        new PlotVesting(address(plot), TEAM, START, CLIFF, 0);
    }

    // --------------------------------------------------------- fuzz

    /// Never pays more than has vested, at any instant of the schedule.
    function testFuzz_releasableNeverExceedsVested(uint64 offset) public {
        offset = uint64(bound(offset, 0, DURATION * 2));
        vm.warp(START + offset);
        assertLe(vesting.releasable(), vesting.vestedAt(uint64(block.timestamp)));
        assertLe(vesting.releasable(), GRANT, "never more than the grant");
    }
}
