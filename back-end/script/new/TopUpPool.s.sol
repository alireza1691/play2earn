// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {Town, TownWar} from "../../src/new/Town.sol";

/**
 * @notice Decides whether the pools need PLOT, and puts it there.
 *
 * The rewards bucket is 450M and there is no keeper — there cannot be one, the
 * codebase has no scheduled transaction anywhere. So topping up is a thing a
 * person does, and the thing a person needs is a number and a reason.
 *
 * The policy, both halves of it decided rather than inferred:
 *
 *   demand-driven      nothing is added while the reserves are healthy. Money
 *                      is spent only once players have actually drained it,
 *                      which is also the only time it does anything.
 *
 *   proportional to    each pool is topped back toward its baseline by what it
 *   depletion          has lost, not by a fixed share. Food and gold drift
 *                      apart as people trade; splitting 50/50 would deepen the
 *                      one nobody is using.
 *
 * Run it to see the recommendation; add --broadcast to act on it.
 *
 *   forge script script/new/TopUpPool.s.sol:TopUpPool --rpc-url sepolia \
 *     --private-key $PRIVATE_KEY
 *
 * Env:
 *   BASELINE_PLOT  what each pool's PLOT side is topped back toward, in wei.
 *                  Defaults to the 25M each pool was seeded with.
 *   TRIGGER_BPS    how far a reserve must fall before it is worth a
 *                  transaction. Defaults to 5000 — half the baseline.
 *   MAX_TOPUP      a ceiling per run, so a fat-fingered baseline cannot empty
 *                  the bucket in one go. Defaults to 50M.
 */
contract TopUpPool is Script {
    uint256 constant DEFAULT_BASELINE = 25_000_000 ether;
    uint256 constant DEFAULT_TRIGGER_BPS = 5_000;
    uint256 constant DEFAULT_MAX_TOPUP = 50_000_000 ether;

    Town town;
    PLOT plot;

    function run() external {
        string memory file = vm.readFile("deployments/sepolia.json");
        town = Town(vm.parseJsonAddress(file, ".town"));
        plot = PLOT(vm.parseJsonAddress(file, ".token"));

        uint256 baseline = vm.envOr("BASELINE_PLOT", DEFAULT_BASELINE);
        uint256 triggerBps = vm.envOr("TRIGGER_BPS", DEFAULT_TRIGGER_BPS);
        uint256 maxTopUp = vm.envOr("MAX_TOPUP", DEFAULT_MAX_TOPUP);

        (uint256[2] memory plotRes, uint256[2] memory goodsRes) =
            TownWar(address(town)).getReserves();

        uint256 trigger = (baseline * triggerBps) / 10_000;

        console2.log("baseline per pool ", baseline);
        console2.log("trigger at        ", trigger);
        console2.log("");

        uint256[2] memory topUp;
        for (uint256 i = 0; i < 2; i++) {
            string memory name = i == 0 ? "food" : "gold";
            console2.log(name);
            console2.log("  plot reserve    ", plotRes[i]);
            console2.log("  goods reserve   ", goodsRes[i]);

            if (plotRes[i] >= trigger) {
                console2.log("  -> healthy, nothing to do");
            } else if (plotRes[i] >= baseline) {
                console2.log("  -> above baseline already");
            } else {
                // Proportional to depletion: what this pool has actually lost,
                // not a fixed share of the bucket.
                uint256 shortfall = baseline - plotRes[i];
                topUp[i] = shortfall > maxTopUp ? maxTopUp : shortfall;
                console2.log("  -> short by     ", shortfall);
                console2.log("  -> topping up   ", topUp[i]);
            }
            console2.log("");
        }

        if (topUp[0] == 0 && topUp[1] == 0) {
            console2.log("nothing to do");
            return;
        }

        uint256 total = topUp[0] + topUp[1];
        console2.log("total to add      ", total);
        console2.log("treasury holds    ", plot.balanceOf(msg.sender));
        require(plot.balanceOf(msg.sender) >= total, "treasury cannot cover it");

        vm.startBroadcast();
        // One approval for both, then each pool separately — addLiquidity takes
        // a single index because the policy lives here, not on chain.
        plot.approve(address(town), total);
        if (topUp[0] > 0) town.addLiquidity(0, topUp[0]);
        if (topUp[1] > 0) town.addLiquidity(1, topUp[1]);
        vm.stopBroadcast();

        console2.log("done");
    }
}
