// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {Town, TownBase, TownWar} from "../../src/new/Town.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {LandsProxy} from "../../src/new/LandsProxy.sol";

contract MockLands {
    mapping(uint256 => address) private owners;
    function setOwner(uint256 tokenId, address newOwner) external { owners[tokenId] = newOwner; }
    function ownerOf(uint256 tokenId) external view returns (address) { return owners[tokenId]; }
    function ownerOfOrZero(uint256 tokenId) external view returns (address) { return owners[tokenId]; }
    function landType(uint256) external pure returns (uint8) { return 0; }
}

/// @notice The daily testnet handout: what it gives, what it refuses, and the
///         two accounting rules it must not break.
contract FaucetTest is Test {
    Town town;
    MockLands lands;
    PLOT plot;

    uint256 constant LAND = 101101;
    uint256 constant OTHER_LAND = 102102;
    uint256 constant FOOD = 0;
    uint256 constant GOLD = 1;

    uint256 constant HANDOUT = 1000 ether;
    address constant PLAYER = address(0xA11CE);

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

        uint256[2] memory plotSide = [uint256(25_000_000 ether), 25_000_000 ether];
        uint256[2] memory goodsSide = [uint256(50_000_000 ether), 50_000_000 ether];
        plot.approve(address(town), 50_000_000 ether);
        town.seedPool(plotSide, goodsSide);

        lands.setOwner(LAND, PLAYER);
        lands.setOwner(OTHER_LAND, PLAYER);
    }

    function _open(uint256 funding) internal {
        town.setFaucetEnabled(true);
        plot.approve(address(town), funding);
        town.fundFaucet(funding);
    }

    // ------------------------------------------------------------ closed

    /// Off unless somebody opens it, which is what makes a mainnet deployment
    /// safe without anyone having to remember.
    function test_faucetIsClosedByDefault() public {
        assertFalse(town.faucetEnabled(), "closed on a fresh deployment");

        vm.prank(PLAYER);
        vm.expectRevert(TownBase.FaucetClosed.selector);
        town.faucet(LAND);
    }

    function test_onlyOwnerCanOpenIt() public {
        vm.prank(PLAYER);
        vm.expectRevert();
        town.setFaucetEnabled(true);
    }

    function test_anOpenButUnfundedFaucetRefuses() public {
        town.setFaucetEnabled(true);

        vm.prank(PLAYER);
        vm.expectRevert(TownBase.FaucetEmpty.selector);
        town.faucet(LAND);
    }

    // ------------------------------------------------------------ claiming

    function test_aClaimPaysGoodsAndPlot() public {
        _open(10_000 ether);
        uint256[2] memory before = town.getLandIdData(LAND).goodsBalance;

        vm.prank(PLAYER);
        town.faucet(LAND);

        uint256[2] memory goods = town.getLandIdData(LAND).goodsBalance;
        // 101101 is one of the three parcels seedTestLands stocks, so compare
        // the delta rather than the absolute balance.
        assertEq(goods[FOOD] - before[FOOD], HANDOUT, "food");
        assertEq(goods[GOLD] - before[GOLD], HANDOUT, "gold");
        assertEq(town.getPlotBalance(PLAYER), HANDOUT, "plot");
    }

    /// The PLOT comes out of the reserve rather than from nowhere — PLOT has no
    /// mint function, so a faucet that invented it would be unbacked.
    function test_theHandoutComesOutOfTheReserve() public {
        _open(10_000 ether);
        assertEq(town.faucetReserve(), 10_000 ether, "funded");

        vm.prank(PLAYER);
        town.faucet(LAND);

        assertEq(town.faucetReserve(), 9_000 ether, "reserve pays the claim");
    }

    /// Solvency: everything the contract owes, it holds.
    function test_claimingKeepsTheContractSolvent() public {
        _open(10_000 ether);

        vm.prank(PLAYER);
        town.faucet(LAND);

        (uint256[2] memory plotRes,) = TownWar(address(town)).getReserves();
        uint256 owed =
            town.getPlotBalance(PLAYER) + plotRes[0] + plotRes[1] + town.faucetReserve();
        assertEq(plot.balanceOf(address(town)), owed, "owed equals held");
    }

    /// Goods are created, so the global counter has to move with them or the
    /// supply invariant drifts.
    function test_claimingMovesTheGlobalGoodsCounter() public {
        _open(10_000 ether);
        uint256[2] memory before = town.getTotalExistedGood();

        vm.prank(PLAYER);
        town.faucet(LAND);

        uint256[2] memory since = town.getTotalExistedGood();
        assertEq(since[FOOD], before[FOOD] + HANDOUT, "food counted");
        assertEq(since[GOLD], before[GOLD] + HANDOUT, "gold counted");
    }

    // ------------------------------------------------------------ cooldown

    function test_aSecondClaimSameDayIsRefused() public {
        _open(10_000 ether);

        vm.startPrank(PLAYER);
        town.faucet(LAND);
        vm.expectRevert(TownBase.FaucetOnCooldown.selector);
        town.faucet(LAND);
        vm.stopPrank();
    }

    /// The limit is per address, not per land — otherwise owning ten parcels
    /// would mean ten times the faucet.
    function test_anotherLandDoesNotGetASecondClaim() public {
        _open(10_000 ether);

        vm.startPrank(PLAYER);
        town.faucet(LAND);
        vm.expectRevert(TownBase.FaucetOnCooldown.selector);
        town.faucet(OTHER_LAND);
        vm.stopPrank();
    }

    function test_theClaimComesBackAfterADay() public {
        _open(10_000 ether);

        vm.prank(PLAYER);
        town.faucet(LAND);

        vm.warp(block.timestamp + 1 days - 1);
        vm.prank(PLAYER);
        vm.expectRevert(TownBase.FaucetOnCooldown.selector);
        town.faucet(LAND);

        vm.warp(block.timestamp + 1);
        vm.prank(PLAYER);
        town.faucet(LAND);

        assertEq(town.getPlotBalance(PLAYER), HANDOUT * 2, "two days, two claims");
    }

    function test_cooldownIsPerAddress() public {
        _open(10_000 ether);
        address second = address(0xB0B);
        lands.setOwner(OTHER_LAND, second);

        vm.prank(PLAYER);
        town.faucet(LAND);

        // A different player is not on the first one's clock.
        vm.prank(second);
        town.faucet(OTHER_LAND);
        assertEq(town.getPlotBalance(second), HANDOUT, "independent cooldowns");
    }

    // ------------------------------------------------------------ ownership

    function test_cannotClaimOntoSomeoneElsesLand() public {
        _open(10_000 ether);
        lands.setOwner(OTHER_LAND, address(0xBEEF));

        vm.prank(PLAYER);
        vm.expectRevert();
        town.faucet(OTHER_LAND);
    }

    function test_fundingIsOwnerOnly() public {
        plot.transfer(PLAYER, 1_000 ether);
        vm.startPrank(PLAYER);
        plot.approve(address(town), 1_000 ether);
        vm.expectRevert();
        town.fundFaucet(1_000 ether);
        vm.stopPrank();
    }

    /// Draining it stops claims rather than paying out of the pool.
    function test_anExhaustedFaucetStopsCleanly() public {
        _open(HANDOUT);

        vm.prank(PLAYER);
        town.faucet(LAND);
        assertEq(town.faucetReserve(), 0, "drained");

        address second = address(0xCA41);
        lands.setOwner(OTHER_LAND, second);
        vm.prank(second);
        vm.expectRevert(TownBase.FaucetEmpty.selector);
        town.faucet(OTHER_LAND);
    }
}
