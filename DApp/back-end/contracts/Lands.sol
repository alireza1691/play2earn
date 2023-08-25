//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Converter } from "./Converter.sol";
// import "./Strings.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Lands is ERC721  {
    using Converter for uint256;

    uint256 private tokenIdCounter;
    uint8 private constant coordinateMax = 100;

    mapping (uint256 => Land) public tokenIdLand;

    struct Land {
        uint8 coordinateX;
        uint8 coordinateY;
        uint8 level;
    }


    constructor() ERC721("Polygon wars land","PWL"){
 
    }

    modifier isExist (uint8 x, uint8 y){
        uint256 tokenId = Converter.concatenate(x, y);
        if (ownerOf(tokenId) == address(0)) {
            _;
        }
        else {
            revert(); 
        } 
    }
    // Check if range of location coordinate is in authorized range.
    modifier isCorrectCoordinate (uint8 x, uint8 y) {
        if (x < 100 || x > 999 || y < 100 || y > 999) {
            revert();
        }
        _;
    }

    function mintLand(uint8 x, uint8 y) external payable isExist(x,y) isCorrectCoordinate(x,y){
        if (x < 10 && y < 10) {
        }
        uint256 tokenId = Converter.concatenate(x, y);
        _mint(msg.sender, tokenId);
        tokenIdLand[tokenId] = Land(x, y, 1);
    }
}

