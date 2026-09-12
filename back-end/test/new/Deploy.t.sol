// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {DeployPlotWar} from "../../script/new/DeployPlotWar.s.sol";
import {Town, TownBase, TownWar} from "../../src/new/Town.sol";
import {DeployConfig} from "../../script/new/DeployConfig.sol";

/// @notice Runs the real deploy script end to end, so the deployment order itself
///         is covered rather than only the contracts it produces.
contract DeployTest is Test {
    DeployPlotWar script;
    address treasury = address(0x7EA5);

    function setUp() public {
        script = new DeployPlotWar();
    }

    /// The script contract is the effective sender of the calls `deploy` makes,
    /// so it is what has to own things during setup. Under --broadcast that
    /// role belongs to the EOA instead; see the note on DeployPlotWar.deploy.
    function _deploy() internal returns (DeployPlotWar.Deployment memory) {
        return script.deploy(
            address(script),
            treasury,
            DeployConfig.forChain(DeployConfig.SEPOLIA)
        );
    }

    function test_deploysAWorkingGame() public {
        DeployPlotWar.Deployment memory d = _deploy();

        assertEq(d.plot.totalSupply(), 1_000_000_000 ether, "supply minted");
        assertEq(d.lands.name(), "Plot War Lands", "lands initialised through proxy");
        assertEq(d.lands.getPrice(), 0.005 ether, "land price set");

        // The pool must be live: prices only exist once reserves do.
        uint256[2] memory prices = TownWar(address(d.town)).getGoodsPrice();
        assertEq(prices[0], 0.5 ether, "1 PLOT buys 2 goods");
        assertEq(prices[1], 0.5 ether, "same on both pools");

        (uint256[2] memory plotRes, uint256[2] memory goodsRes) = TownWar(address(d.town)).getReserves();
        assertEq(plotRes[0], 25_000_000 ether, "food pool PLOT");
        assertEq(goodsRes[0], 50_000_000 ether, "food pool goods");

        // The contract holds exactly the PLOT it now owes to the pools.
        assertEq(
            d.plot.balanceOf(address(d.town)),
            plotRes[0] + plotRes[1],
            "pool is actually funded"
        );
    }

    /// Base carries the production config, which must never seed lands: those
    /// three coordinates would otherwise be a free head start for whoever mints
    /// them first.
    function test_productionConfigLeavesNoSeededLands() public {
        DeployPlotWar.Deployment memory d = script.deploy(
            address(script),
            treasury,
            DeployConfig.forChain(DeployConfig.BASE)
        );
        assertFalse(d.town.hasStarted(101101), "no head start on mainnet");
        assertEq(d.town.getLandIdData(101101).townhallLevel, 0, "no free buildings");
    }

    /// ...and the script refuses outright if someone hand-edits the flag on.
    function test_productionRefusesSeededLands() public {
        DeployConfig.NetworkConfig memory config = DeployConfig.forChain(DeployConfig.BASE);
        config.seedTestLands = true;
        vm.expectRevert(DeployPlotWar.RefusingToSeedTestLandsOnProduction.selector);
        script.deploy(address(script), treasury, config);
    }

    function test_sepoliaSeedsTestLands() public {
        DeployPlotWar.Deployment memory d = _deploy();
        assertTrue(d.town.hasStarted(101101), "testnet gets the head start");
    }

    function test_unsupportedChainIsRejected() public {
        vm.expectRevert(abi.encodeWithSelector(DeployConfig.UnsupportedChain.selector, uint256(1)));
        DeployConfig.forChain(1);
    }

    function test_ownershipAndSupplyAreHandedToTheTreasury() public {
        DeployPlotWar.Deployment memory d = _deploy();
        assertEq(d.town.owner(), treasury, "ownership handed over");
        assertEq(d.lands.owner(), treasury, "ownership handed over");
        // The unpooled remainder of the supply goes with it.
        assertEq(d.plot.balanceOf(treasury), 1_000_000_000 ether - 50_000_000 ether, "treasury holds the rest");
        assertEq(d.plot.balanceOf(address(script)), 0, "deployer keeps nothing");
    }

    /// A player can actually mint a land and start playing straight after deploy.
    function test_aPlayerCanStartRightAfterDeploy() public {
        DeployPlotWar.Deployment memory d = _deploy();

        address player = address(0xA11CE);
        vm.deal(player, 1 ether);
        vm.startPrank(player);

        d.lands.mintLand{value: d.lands.getPrice()}(120, 120);
        d.town.startLand(120120);

        uint256[2] memory goods = d.town.getLandIdData(120120).goodsBalance;
        assertEq(goods[0], d.town.StarterFood(), "starter food");
        assertEq(goods[1], d.town.StarterGold(), "starter gold");

        d.town.buildResourceBuilding(120120, 0); // must not revert
        vm.stopPrank();
    }
}
