//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Army is  ERC1155{
    constructor() ERC1155("URI"){
        
    }
}