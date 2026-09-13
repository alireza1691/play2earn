// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {Town, TownWar} from "../../src/new/Town.sol";

/**
 * @notice Upgrades the live Town behind its proxy, rather than redeploying.
 *
 * A fresh deployment would mean new addresses, a frontend change, and re-seeding
 * the world — ten lands, the clan, the four garrisoned rival parcels — for about
 * 0.14 ETH. An upgrade is two implementation deployments and keeps all of it.
 *
 * What makes it safe is that the faucet's storage sits *after* `warModule`.
 * `warModule` is declared in `Town`, one slot past TownBase's last variable, and
 * `cast storage <proxy> 22` shows the war module address living there. Appending
 * to TownBase would have inserted before it and shifted it, and the new
 * implementation would then read it as zero — every call through the fallback,
 * the whole AMM included, reverting with WarModuleNotSet. Check the layout
 * before running this if the diff touched any state:
 *
 *   forge inspect src/new/Town.sol:Town storage-layout
 *
 * (Note the path. There are two contracts named `Town`, and a bare
 * `forge inspect Town` resolves the v3 one.)
 *
 * TownWar is not behind a proxy — `Town` reaches it by delegatecall — so it is
 * a plain deploy plus one `setWarModule`. Both halves go together: they share
 * TownBase's layout, and a mismatched pair reads different slots.
 *
 * @dev Kept in small functions on purpose. Written as one `run()` it put solc's
 *      via_ir pipeline over its stack limit, and a stack-too-deep with no
 *      function name in it is a miserable thing to debug.
 *
 * Usage:
 *   forge script script/new/UpgradeTown.s.sol:UpgradeTown \
 *     --rpc-url sepolia --private-key $PRIVATE_KEY --broadcast --slow
 *
 * Env:
 *   FAUCET_FUNDING  PLOT to stock the faucet with, in wei. 0 skips it.
 *                   Defaults to 5,000,000 PLOT, which is 5,000 claims.
 */
contract UpgradeTown is Script {
    uint256 constant DEFAULT_FUNDING = 5_000_000 ether;

    function run() external {
        (address townAddress, address plotAddress) = _addresses();
        _upgrade(townAddress);
        _openFaucet(townAddress, plotAddress);
        _report(townAddress);
    }

    function _addresses() internal view returns (address town, address plot) {
        string memory file = vm.readFile("deployments/sepolia.json");
        town = vm.parseJsonAddress(file, ".town");
        plot = vm.parseJsonAddress(file, ".token");
    }

    function _upgrade(address townAddress) internal {
        Town town = Town(townAddress);
        console2.log("proxy        ", townAddress);
        console2.log("old war      ", town.warModule());

        vm.startBroadcast();
        // Empty calldata: there is no reinitializer to run. The new state
        // defaults to false and zero, which is exactly a closed, empty faucet.
        town.upgradeToAndCall(address(new Town()), "");
        town.setWarModule(address(new TownWar()));
        vm.stopBroadcast();
    }

    /// Without these two the page correctly reports a closed faucet and nobody
    /// can claim, which looks like a bug and is not one.
    function _openFaucet(address townAddress, address plotAddress) internal {
        uint256 funding = vm.envOr("FAUCET_FUNDING", DEFAULT_FUNDING);
        Town town = Town(townAddress);

        vm.startBroadcast();
        town.setFaucetEnabled(true);
        if (funding > 0) {
            PLOT(plotAddress).approve(townAddress, funding);
            town.fundFaucet(funding);
        }
        vm.stopBroadcast();
    }

    function _report(address townAddress) internal view {
        Town town = Town(townAddress);
        console2.log("");
        console2.log("new war      ", town.warModule());
        console2.log("faucet open  ", town.faucetEnabled());
        console2.log("faucet holds ", town.faucetReserve());
        console2.log("addresses are unchanged");
    }
}
