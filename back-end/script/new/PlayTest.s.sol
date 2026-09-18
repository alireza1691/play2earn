// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {PLOT} from "../../src/new/PLOT.sol";
import {Town, TownWar} from "../../src/new/Town.sol";

/**
 * @notice Drives an end-to-end game between two real wallets on Sepolia.
 *
 * Split into phases because an attack is not one transaction and the middle of
 * it is a wait: an army takes `distance * 150` seconds to arrive, which for
 * these two lands is twelve and a half minutes each way.
 *
 *   PHASE=setup    both lands built out and garrisoned
 *   PHASE=dispatch player 2 sends an army at player 1
 *   PHASE=attack   resolve it once the army has arrived
 *   PHASE=return   bring the survivors and the loot home
 *
 * Every build occupies the land's single worker for two hours, so each is
 * followed by finishNow — gold for time, which is what that call is for.
 */
contract PlayTest is Script {
    uint256 constant LAND1 = 104104; // player 1, already minted and built on
    uint256 constant LAND2 = 108101; // player 2, minted for this test

    uint256 constant MACEMAN = 0;
    uint256 constant ATTACKERS = 40;
    uint256 constant DEFENDERS = 20;

    Town town;
    PLOT plot;

    function run() external {
        string memory file = vm.readFile("deployments/sepolia.json");
        town = Town(vm.parseJsonAddress(file, ".town"));
        plot = PLOT(vm.parseJsonAddress(file, ".token"));

        string memory phase = vm.envOr("PHASE", string("setup"));
        uint256 k1 = vm.envUint("PRIVATE_KEY");
        uint256 k2 = vm.envUint("PLAYER2_KEY");

        if (_eq(phase, "setup")) {
            _setupPlayer2(k2);
            _setupPlayer1(k1);
        } else if (_eq(phase, "dispatch")) {
            _dispatch(k2);
        } else if (_eq(phase, "attack")) {
            _attack(k2);
        } else if (_eq(phase, "return")) {
            _return(k2);
        } else {
            revert("PHASE must be setup, dispatch, attack or return");
        }
    }

    /// Player 2 starts with nothing but PLOT: buy goods, build, recruit.
    function _setupPlayer2(uint256 key) internal {
        vm.startBroadcast(key);

        if (!town.hasStarted(LAND2)) town.startLand(LAND2);

        // The starter pack is 400 of each, which does not cover one town hall.
        // Goods come out of the AMM, paid for in PLOT.
        if (town.getPlotBalance(vm.addr(key)) < 10_000 ether) {
            plot.approve(address(town), 20_000 ether);
            town.deposit(20_000 ether);
        }
        uint256[2] memory held = town.getLandIdData(LAND2).goodsBalance;
        if (held[0] < 3_000 ether) TownWar(address(town)).buyGood(LAND2, 0, 5_000 ether, 0);
        if (held[1] < 3_000 ether) TownWar(address(town)).buyGood(LAND2, 1, 5_000 ether, 0);

        _build(LAND2);
        _recruit(LAND2, ATTACKERS);

        vm.stopBroadcast();
    }

    /// Player 1 already has a town hall, walls and both resource buildings.
    function _setupPlayer1(uint256 key) internal {
        vm.startBroadcast(key);
        _build(LAND1);
        _recruit(LAND1, DEFENDERS);
        vm.stopBroadcast();
    }

    /// Town hall first: barracks and camp both require one a level above them.
    function _build(uint256 land) internal {
        if (town.getLandIdData(land).townhallLevel == 0) {
            town.buildTownhall(land);
            town.finishNow(land);
        }
        if (town.getLandIdData(land).barracksLevel == 0) {
            town.buildBarracks(land);
            town.finishNow(land);
        }
        // Without a camp the garrison caps at ten, which is no battle at all.
        if (town.getLandIdData(land).trainingCampLevel == 0) {
            town.buildTrainingCamp(land);
            town.finishNow(land);
        }
    }

    function _recruit(uint256 land, uint256 count) internal {
        uint256 have = town.getArmy(land)[MACEMAN];
        if (have >= count) return;
        uint256[6] memory order;
        order[MACEMAN] = count - have;
        TownWar(address(town)).recruit(land, order);
    }

    function _dispatch(uint256 key) internal {
        uint256[] memory sent = new uint256[](6);
        sent[MACEMAN] = ATTACKERS;
        vm.startBroadcast(key);
        TownWar(address(town)).dispatchArmy(sent, LAND2, LAND1);
        vm.stopBroadcast();
        console2.log("dispatched; the march is 750 seconds");
    }

    function _attack(uint256 key) internal {
        vm.startBroadcast(key);
        TownWar(address(town)).war(LAND2, 0);
        vm.stopBroadcast();
    }

    function _return(uint256 key) internal {
        vm.startBroadcast(key);
        TownWar(address(town)).joinDispatchedArmy(LAND2, 0);
        vm.stopBroadcast();
    }

    function _eq(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
