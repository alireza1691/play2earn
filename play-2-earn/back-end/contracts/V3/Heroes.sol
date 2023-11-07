// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { TransferHelper } from "../TransferHelper.sol";

contract Heroes is ERC721, Ownable {
    address private immutable BMTAddress;
    uint256 heroCounter;
    constructor(address tokenAddress)ERC721("Heroes","BH") Ownable(msg.sender){
        BMTAddress = tokenAddress;
    }

    struct HeroInfo {
        uint256 attackPower;
        uint256 defPower;
        uint256 currentHp;
        uint256 fullHpl;
        uint256 price;
    }
    
    HeroInfo CommonHero = HeroInfo(1000,1000,1000, 1000, 0.2 ether);
    mapping (uint256 => HeroInfo) tokenIdToHero;

    function addHero(uint8 attPw, uint8 defPw, uint8 hp, string memory name, uint) external onlyOwner {
    }
    function buy(uint256 tokenId) external{
        _mint(msg.sender, tokenId);
    }
    function getHero(uint256 tokenId) view public returns (HeroInfo memory) {
        return tokenIdToHero[tokenId];
    }
    function heal(uint256 tokenId) external {
    }
    function upgrade(uint256 tokenId, uint256 propertyIndex, uint256 amount) external{
    }
    function caclulateHealTimestamp(uint256 tokenId) view public returns (uint256) {
    }
}