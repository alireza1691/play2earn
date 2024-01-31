//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { Proxy} from "@openzeppelin/contracts/proxy/Proxy.sol";
import { ProxyAdmin } from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract LandsProxy is TransparentUpgradeableProxy {

    address private implementation;
    constructor (address landsContractAddress, address owner )TransparentUpgradeableProxy(landsContractAddress,owner,abi.encodeWithSignature("initialize()")) {
        implementation = landsContractAddress;
    }

    function initialize() internal {
        
    }

    // function setImplementation(address newLandsContractAddress) external {
    //     implementation = newLandsContractAddress;
    // }

    // function _implementation() internal view override returns (address) {
    //     return implementation;
    // }
}
