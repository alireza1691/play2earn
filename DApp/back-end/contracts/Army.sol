//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Army is  ERC1155{

    constructor() ERC1155("URI"){
        tokenIdInfo[1] = swordMan;
        tokenIdInfo[2] = archer;
        tokenIdInfo[3] = spearMan;
    }

    mapping (uint256 tokenId => Info) private tokenIdInfo;

    struct Info {
        uint8 attackPower;
        uint8 defPower;
        uint8 hp;
        string imageURL;
    }

    Info swordMan = Info( 130, 100, 200, "Replace this with image url");
    Info archer = Info( 80 , 110, 80, "Replace this with image url");
    Info spearMan = Info( 60 , 150, 140,"Replace this with image url");

    modifier existItem (uint256 tokenId) {
        require(tokenIdInfo[tokenId].attackPower != 0 &&
        tokenIdInfo[tokenId].defPower != 0
        , "No defined");
        _;
    }


    function claim(address to, uint256 id, uint256 amount, bytes memory data) external existItem(id){
        _mint( to, id, amount, data);
    }

    function claimBatch(address to, uint256[] memory id, uint256[] memory amount, bytes memory data) external{
        _mintBatch(to, id, amount, data);
    }

    function test() external view returns (Info memory) {
        return tokenIdInfo[4];
    }
}
