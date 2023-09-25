// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract BKT is ERC20, Ownable {

    // Authorized address should be Lands contract address.
    // address private authorizedAdd;
    address private landsContractAddress;

    constructor() ERC20 ("BKC", "Blockchain's kingdom token")  {
        _mint(msg.sender, 10000000 ether);
        // authorizedAdd = authorizedAddress;
    }
    modifier isAuthorized {
        require(msg.sender == landsContractAddress);
        _;
    }

}