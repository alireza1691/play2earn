// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Commodity is ERC20 {

    // Authorized address should be Lands contract address.
    // address private authorizedAdd;

    constructor(string memory name, string memory symbol/*, address authorizedAddress*/) ERC20 (name, symbol)  {
        _mint(msg.sender, 10000000 ether);
        // authorizedAdd = authorizedAddress;
    }

    // modifier isAuthorized {
    //     require(msg.sender == authorizedAdd);
    //     _;
    // }

    // function mint(address account, uint256 amount) external isAuthorized {
    //     _mint(account, amount);
    // }

    // function use(address account, uint256 amount) external isAuthorized {
    //     _burn(account, amount);
    // }
}