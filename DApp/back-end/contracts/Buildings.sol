//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { LandsV1 } from "./LandsV1.sol";

contract Buildings is  ERC1155, Ownable{


    LandsV1 lands;

    address stone;
    address wood ;
    address iron ;
    address gold ;
    address food ;

    uint256 tokenIdCounter;

    constructor(address landsContract) ERC1155("Buildings"){
        lands = LandsV1(landsContract);
    }

    mapping (uint256 tokenId => Info) private tokenIdInfo;

    struct Info {
        uint8 requireStone;
        uint8 requireWood;
        uint8 requireIron;
        uint8 requireGold;
        uint8 requireFood;
        uint8 baseRev;
        uint8 baseCapacity;
        address revTokenAddress;
        string imageURL;
    }

    Info stoneMine = Info( 0, 200, 150, 0, 25, 8, 80, stone, "Replace this with image url");
    Info lumberMill = Info( 50, 50, 250, 0, 25, 8, 80, wood, "Replace this with image url");
    Info ironMine = Info( 100, 100, 100, 0, 25, 8, 80, iron,"Replace this with image url");
    Info ranchHouse = Info( 250, 50, 0, 0, 100, 10, 100, food,"Replace this with image url");

    struct Status {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 attachedLand;
    }
    

    modifier existItem (uint256 tokenId) {
        require(tokenIdInfo[tokenId].baseRev != 0 &&
        tokenIdInfo[tokenId].revTokenAddress != address(0)
        , "No defined");
        _;
    }

    function addNewBuilding(uint8[7] memory requiredCommodities, address revenueToken, string memory imgUrl) external onlyOwner {
        tokenIdInfo[tokenIdCounter] = Info(
            requiredCommodities[0],
            requiredCommodities[1],
            requiredCommodities[2],
            requiredCommodities[3],
            requiredCommodities[4],
            requiredCommodities[5],
            requiredCommodities[6],
            revenueToken,
            imgUrl
        );
        tokenIdCounter++;
    }
    function test() external view returns (Info memory) {
        return tokenIdInfo[4];
    }

    function uri(uint256 tokenId) view public override returns (string memory) {
        return tokenIdInfo[tokenId].imageURL;
    }

}
