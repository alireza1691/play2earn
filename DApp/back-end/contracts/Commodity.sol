// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Commodity is ERC20, Ownable {

    // Authorized address should be Lands contract address.
    // address private authorizedAdd;
    address private landsContractAddress;

    constructor(string memory name, string memory symbol/*, address authorizedAddress*/) ERC20 (name, symbol)  {
        _mint(msg.sender, 10000000 ether);
        // authorizedAdd = authorizedAddress;
    }
    modifier isAuthorized {
        require(msg.sender == landsContractAddress);
        _;
    }

    function attachLandsAddress(address newAddress) external onlyOwner {
        landsContractAddress = newAddress;
    }


    function withdraw(address account, uint256 amount) external isAuthorized {
        _mint(account, amount);
    }

    function use(address account, uint256 amount) external isAuthorized {
        _burn(account, amount);
    }
}