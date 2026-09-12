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
    /// Every parcel in these tests is an ordinary Town unless a test says otherwise.
    function landType(uint256) external pure returns (uint8) { return 0; }
}

/// @notice The goods pools: pricing, depth, and the solvency property that makes
///         plotBalance backed instead of invented.
contract PoolTest is Test {
    Town town;
    MockLands lands;
    PLOT plot;

    uint256 constant LAND = 101101;
    uint256 constant FOOD = 0;
    uint256 constant GOLD = 1;

    // 1 PLOT buys 2 goods, so the goods side starts at twice the PLOT side.
    uint256 constant PLOT_SIDE = 25_000_000 ether;
    uint256 constant GOODS_SIDE = 50_000_000 ether;

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
        // War is a separate deployed contract Town delegatecalls into; without
        // this every dispatch reverts with WarModuleNotSet.
        town.setWarModule(address(new TownWar()));
        lands.setOwner(LAND, address(this));

        uint256[2] memory plotSide = [PLOT_SIDE, PLOT_SIDE];
        uint256[2] memory goodsSide = [GOODS_SIDE, GOODS_SIDE];
        plot.approve(address(town), PLOT_SIDE * 2);
        town.seedPool(plotSide, goodsSide);
    }

    function _deposit(uint256 amount) internal {
        plot.approve(address(town), amount);
        town.deposit(amount);
    }

    // ---------------------------------------------------------------- supply

    function test_totalSupplyIsOneBillion() public {
        assertEq(plot.totalSupply(), 1_000_000_000 ether, "supply");
        assertEq(plot.name(), "Plot War Token", "name");
        assertEq(plot.symbol(), "PLOT", "symbol");
    }

    // ---------------------------------------------------------------- pricing

    /// Opening price: 1 PLOT = 2 goods, so a good is worth 0.5 PLOT.
    function test_openingPriceIsHalfABmtPerGood() public {
        uint256[2] memory prices = TownWar(address(town)).getGoodsPrice();
        assertEq(prices[FOOD], 0.5 ether, "food price");
        assertEq(prices[GOLD], 0.5 ether, "gold price");
    }

    /// A trade small against the reserves lands within a fee's distance of parity.
    function test_smallBuyGetsRoughlyTwoGoodsPerBmt() public {
        _deposit(1_000 ether);
        uint256 quoted = TownWar(address(town)).quoteBuy(FOOD, 1_000 ether);

        // 2 goods per PLOT, less the 5% fee, less negligible slippage.
        assertApproxEqRel(quoted, 1_900 ether, 0.001e18, "about 1900 goods");
        TownWar(address(town)).buyGood(LAND, FOOD, 1_000 ether, 0);
    }

    function test_sellingIsThereverseOfBuying() public {
        uint256 proceeds = TownWar(address(town)).quoteSell(FOOD, 2_000 ether);
        // 2000 goods is 1000 PLOT at parity, less the 5% fee.
        assertApproxEqRel(proceeds, 950 ether, 0.001e18, "about 950 PLOT");
    }

    /// Depth check: the numbers behind the 5%-of-supply recommendation.
    function test_largeDumpMovesThePriceButDoesNotBreakIt() public {
        uint256 before = TownWar(address(town)).getGoodsPrice()[FOOD];
        uint256 proceeds = TownWar(address(town)).quoteSell(FOOD, 1_000_000 ether);

        // Parity would be 500_000 PLOT; fee plus slippage take a visible bite.
        assertLt(proceeds, 500_000 ether, "worse than parity");
        assertGt(proceeds, 400_000 ether, "but not catastrophic");

        assertGt(before, 0, "price was live");
    }

    // ---------------------------------------------------------------- safety

    /// The constant product means no sale, at any size, can empty the reserve.
    function test_poolCannotBeDrained() public {
        uint256 absurd = 1_000_000_000_000 ether;
        uint256 proceeds = TownWar(address(town)).quoteSell(FOOD, absurd);

        (uint256[2] memory plotRes,) = TownWar(address(town)).getReserves();
        assertLt(proceeds, plotRes[FOOD], "payout is always below the reserve");
    }

    function test_poolCanOnlyBeSeededOnce() public {
        uint256[2] memory side = [uint256(1 ether), 1 ether];
        plot.approve(address(town), 2 ether);
        vm.expectRevert(TownBase.PoolAlreadySeeded.selector);
        town.seedPool(side, side);
    }

    function test_onlyOwnerCanSeed() public {
        Town implementation = new Town();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(plot), address(lands), false, address(this))
            )
        );
        Town fresh = Town(address(proxy));

        uint256[2] memory side = [uint256(1 ether), 1 ether];
        vm.prank(address(0xBEEF));
        vm.expectRevert();
        fresh.seedPool(side, side);
    }

    function test_tradingBeforeSeedingIsRefused() public {
        Town implementation = new Town();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(plot), address(lands), true, address(this))
            )
        );
        Town fresh = Town(address(proxy));
        // The pool lives in the war module, reached through Town's fallback, so
        // an unwired Town reverts with WarModuleNotSet long before it gets far
        // enough to notice the pool is empty.
        fresh.setWarModule(address(new TownWar()));

        vm.expectRevert(TownBase.PoolNotSeeded.selector);
        TownWar(address(fresh)).sellGood(LAND, FOOD, 1 ether, 0);
    }

    // ---------------------------------------------------------------- C-02

    /// The property that closes C-02: every PLOT the contract owes is a PLOT it holds.
    /// Under the old implementation sellGood credited plotBalance out of nothing, so
    /// player claims could exceed the contract's actual token balance.
    function test_C02_contractIsSolventAfterHeavyTrading() public {
        _deposit(100_000 ether);

        for (uint256 i = 0; i < 5; i++) {
            TownWar(address(town)).buyGood(LAND, FOOD, 10_000 ether, 0);
            (uint256 food,) = _goods(LAND);
            TownWar(address(town)).sellGood(LAND, FOOD, food / 2, 0);
        }

        uint256 owed = town.getPlotBalance(address(this));
        (uint256[2] memory plotRes,) = TownWar(address(town)).getReserves();
        uint256 tracked = owed + plotRes[0] + plotRes[1];

        assertEq(plot.balanceOf(address(town)), tracked, "every owed PLOT is held");
    }

    /// Selling cannot mint claims the contract cannot honour.
    function test_C02_withdrawAlwaysSucceedsForWhatWasCredited() public {
        _deposit(50_000 ether);
        TownWar(address(town)).buyGood(LAND, FOOD, 50_000 ether, 0);
        (uint256 food,) = _goods(LAND);
        TownWar(address(town)).sellGood(LAND, FOOD, food, 0);

        uint256 credited = town.getPlotBalance(address(this));
        assertGt(credited, 0, "sale paid something");
        town.withdraw(credited); // must not revert
    }

    function _goods(uint256 landId) internal view returns (uint256, uint256) {
        uint256[2] memory g = town.getLandIdData(landId).goodsBalance;
        return (g[0], g[1]);
    }

    // ---------------------------------------------------------------- storage cap

    /// The cap now grows on the same curve as production, so upgrading keeps paying.
    function test_storageCapScalesWithLevel() public {
        town.buildResourceBuilding(LAND, 0);
        skip(365 days); // long enough that the cap, not time, is the limit

        uint256 atLevelOne = town.getCurrentRevenue(1);
        assertEq(atLevelOne, 40 ether, "level 1 cap");

        town.upgradeResourceBuilding(1, LAND);
        skip(365 days);
        uint256 atLevelTwo = town.getCurrentRevenue(1);

        // Linear caps gave 80 at level 2; the exponential curve gives the same
        // doubling as production.
        assertEq(atLevelTwo, 80 ether, "level 2 cap doubles");
    }

    // ---------------------------------------------------------------------
    // Slippage guards
    //
    // The pool prices against its own reserves, so the output a player is
    // quoted is only valid for the reserves at quote time. Anyone watching the
    // mempool can trade ahead of a large order and make it fill worse. The
    // minimum-out argument lets the caller name the worst fill they accept;
    // passing 0 keeps the old unguarded behaviour.
    // ---------------------------------------------------------------------

    function test_buyRevertsWhenOutputIsBelowTheMinimum() public {
        _deposit(1_000 ether);
        uint256 quoted = TownWar(address(town)).quoteBuy(FOOD, 1_000 ether);

        vm.expectRevert(TownBase.SlippageExceeded.selector);
        TownWar(address(town)).buyGood(LAND, FOOD, 1_000 ether, quoted + 1);
    }

    function test_buyPassesWhenOutputMeetsTheMinimum() public {
        _deposit(1_000 ether);
        uint256 quoted = TownWar(address(town)).quoteBuy(FOOD, 1_000 ether);

        // The land is not empty at setUp, so compare the delta.
        uint256 before = town.getLandIdData(LAND).goodsBalance[FOOD];
        TownWar(address(town)).buyGood(LAND, FOOD, 1_000 ether, quoted);
        assertEq(
            town.getLandIdData(LAND).goodsBalance[FOOD] - before,
            quoted,
            "filled at exactly the quote"
        );
    }

    function test_sellRevertsWhenProceedsAreBelowTheMinimum() public {
        uint256 proceeds = TownWar(address(town)).quoteSell(FOOD, 2_000 ether);

        vm.expectRevert(TownBase.SlippageExceeded.selector);
        TownWar(address(town)).sellGood(LAND, FOOD, 2_000 ether, proceeds + 1);
    }

    function test_swapRevertsWhenOutputIsBelowTheMinimum() public {
        vm.expectRevert(TownBase.SlippageExceeded.selector);
        TownWar(address(town)).swapGoods(LAND, FOOD, 1_000 ether, type(uint256).max);
    }

    /// The guard is what a front-run actually trips: quote, let someone else
    /// move the pool, then find the fill no longer honours the quote.
    function test_guardCatchesAFrontRun() public {
        _deposit(200_000 ether);
        uint256 quoted = TownWar(address(town)).quoteBuy(FOOD, 1_000 ether);

        // Somebody else buys the same good first and moves the price.
        TownWar(address(town)).buyGood(LAND, FOOD, 150_000 ether, 0);

        vm.expectRevert(TownBase.SlippageExceeded.selector);
        TownWar(address(town)).buyGood(LAND, FOOD, 1_000 ether, quoted);
    }

    // ---------------------------------------------------------------------
    // addLiquidity — the only way the rewards bucket can reach players
    //
    // PLOT has no mint function, so what players earn has to be moved into the
    // reserve they are paid from. seedPool runs once and deposit credits the
    // depositor rather than the pool, so neither of those can do it.
    // ---------------------------------------------------------------------

    function test_addLiquidityDeepensOnlyThePlotSide() public {
        (uint256[2] memory plotBefore, uint256[2] memory goodsBefore) =
            TownWar(address(town)).getReserves();

        plot.approve(address(town), 1_000_000 ether);
        town.addLiquidity(FOOD, 1_000_000 ether);

        (uint256[2] memory plotAfter, uint256[2] memory goodsAfter) =
            TownWar(address(town)).getReserves();

        assertEq(plotAfter[FOOD], plotBefore[FOOD] + 1_000_000 ether, "plot side grew");
        assertEq(goodsAfter[FOOD], goodsBefore[FOOD], "goods side untouched");
        assertEq(plotAfter[GOLD], plotBefore[GOLD], "other pool untouched");
        assertEq(goodsAfter[GOLD], goodsBefore[GOLD], "other pool untouched");
    }

    /// The point of the whole mechanism: players get more PLOT per unit sold.
    function test_addLiquidityRaisesWhatSellersAreePaid() public {
        uint256 before = TownWar(address(town)).quoteSell(FOOD, 1_000 ether);

        plot.approve(address(town), 25_000_000 ether);
        town.addLiquidity(FOOD, 25_000_000 ether);

        uint256 afterTopUp = TownWar(address(town)).quoteSell(FOOD, 1_000 ether);
        assertGt(afterTopUp, before, "selling pays more once the pool is deeper");
    }

    /// Solvency is the property that makes plotBalance real, and a top-up must
    /// not dent it: the PLOT enters the contract and the reserve together.
    function test_addLiquidityKeepsTheContractSolvent() public {
        _deposit(10_000 ether);
        TownWar(address(town)).buyGood(LAND, FOOD, 5_000 ether, 0);

        plot.approve(address(town), 3_000_000 ether);
        town.addLiquidity(GOLD, 3_000_000 ether);

        uint256 owed = town.getPlotBalance(address(this));
        (uint256[2] memory plotRes,) = TownWar(address(town)).getReserves();
        assertEq(
            plot.balanceOf(address(town)),
            owed + plotRes[0] + plotRes[1],
            "every owed PLOT is held"
        );
    }

    function test_onlyOwnerCanAddLiquidity() public {
        plot.transfer(address(0xBEEF), 1_000 ether);
        vm.startPrank(address(0xBEEF));
        plot.approve(address(town), 1_000 ether);
        vm.expectRevert();
        town.addLiquidity(FOOD, 1_000 ether);
        vm.stopPrank();
    }

    function test_addLiquidityRejectsNonsense() public {
        plot.approve(address(town), 1_000 ether);

        vm.expectRevert(TownBase.InvalidItem.selector);
        town.addLiquidity(2, 1_000 ether);

        vm.expectRevert(TownBase.InsufficientLiquidity.selector);
        town.addLiquidity(FOOD, 0);
    }

    function test_addLiquidityNeedsASeededPool() public {
        Town implementation = new Town();
        LandsProxy proxy = new LandsProxy(
            address(implementation),
            abi.encodeCall(
                TownBase.initialize,
                (address(plot), address(lands), true, address(this))
            )
        );
        Town fresh = Town(address(proxy));

        plot.approve(address(fresh), 1_000 ether);
        vm.expectRevert(TownBase.PoolNotSeeded.selector);
        fresh.addLiquidity(FOOD, 1_000 ether);
    }
}
