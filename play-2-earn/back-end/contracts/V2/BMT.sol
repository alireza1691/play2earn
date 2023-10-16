// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract BMT is ERC20, Ownable {


    constructor() ERC20 ("BMT", "Blockdom token") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 ether);
    }
}