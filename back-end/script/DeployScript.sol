// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {Script, console2} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

contract DeployContract is Script {
    function run() public returns (Counter) {
        vm.startBroadcast();
        Counter deployedContract = new Counter();
        deployedContract.increment();
        vm.stopBroadcast();
        return deployedContract;
    }
}