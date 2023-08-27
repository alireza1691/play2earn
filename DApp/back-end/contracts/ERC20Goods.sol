// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Goods is ERC20 {
    constructor(string memory name, string memory symbol) ERC20 (name, symbol)  {
        _mint(msg.sender, 1000 ether);
    }

    function burn(address from, uint256 amount) external{
        _burn(from,amount);
    }
}