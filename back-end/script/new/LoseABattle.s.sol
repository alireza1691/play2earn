// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {Lands} from "../../src/new/LandsV3.sol";
import {Town, TownWar} from "../../src/new/Town.sol";

/**
 * @notice Loses a battle on purpose, so the battle log has a defeat in it.
 *
 * The Defenses tab and the "You lost" branch of the result card had never been
 * rendered against real data — every battle fought so far was won. This sends a
 * deliberately hopeless army at a wild parcel and lets it die.
 *
 * The target is a jungle one tile from 112118, chosen because travel is
 * `distance * 150` seconds and one tile is two and a half minutes rather than
 * the two hours the rival's parcels are away. A wild jungle also needs no
 * co-operating second account: it is attackable unminted and garrisoned with 30
 * spearmen that regrow on their own.
 *
 * Three phases, because an attack is not one transaction and the middle one is
 * a wait:
 *
 *   PHASE=prepare   build barracks, recruit a token force
 *   PHASE=dispatch  send them, then wait out the march
 *   PHASE=attack    resolve the battle (they lose)
 *
 * Usage:
 *   PHASE=prepare forge script script/new/LoseABattle.s.sol:LoseABattle \
 *     --rpc-url sepolia --private-key $PRIVATE_KEY --broadcast --slow
 */
contract LoseABattle is Script {
    /// Ours, and adjacent to the target.
    uint256 constant FROM = 112118;
    /// A natural jungle: 2,000 of each good and 30 spearmen, no owner.
    uint256 constant TARGET = 112119;

    /// Enough to be a battle and nowhere near enough to win one.
    uint256 constant DOOMED_SPEARMEN = 3;

    Lands lands;
    Town town;

    function run() external {
        string memory file = vm.readFile("deployments/sepolia.json");
        lands = Lands(payable(vm.parseJsonAddress(file, ".lands")));
        town = Town(vm.parseJsonAddress(file, ".town"));

        string memory phase = vm.envOr("PHASE", string("prepare"));

        if (_eq(phase, "prepare")) _prepare();
        else if (_eq(phase, "dispatch")) _dispatch();
        else if (_eq(phase, "attack")) _attack();
        else revert("PHASE must be prepare, dispatch or attack");
    }

    /// Barracks needs a townhall a level above it, so both go up first.
    function _prepare() internal {
        vm.startBroadcast();
        if (!town.hasStarted(FROM)) town.startLand(FROM);

        if (town.getLandIdData(FROM).townhallLevel == 0) {
            town.buildTownhall(FROM);
            town.finishNow(FROM);
        }
        if (town.getLandIdData(FROM).barracksLevel == 0) {
            town.buildBarracks(FROM);
            town.finishNow(FROM);
        }

        uint256[6] memory order;
        order[0] = DOOMED_SPEARMEN;
        TownWar(address(town)).recruit(FROM, order);
        vm.stopBroadcast();

        console2.log("recruited spearmen", DOOMED_SPEARMEN);
        console2.log("next: PHASE=dispatch");
    }

    function _dispatch() internal {
        uint256[] memory sent = new uint256[](6);
        sent[0] = DOOMED_SPEARMEN;

        vm.startBroadcast();
        TownWar(address(town)).dispatchArmy(sent, FROM, TARGET);
        vm.stopBroadcast();

        console2.log("dispatched to", TARGET);
        console2.log("wait ~3 minutes, then: PHASE=attack");
    }

    /// @dev Index 0 holds while this is the only army out from this land. If it
    ///      is not, the war call reverts rather than hitting the wrong one.
    function _attack() internal {
        vm.startBroadcast();
        TownWar(address(town)).war(FROM, 0);
        vm.stopBroadcast();

        console2.log("battle resolved - check the log");
    }

    function _eq(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
