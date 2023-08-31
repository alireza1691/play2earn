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

    function uri(uint256 tokenId) view public override returns (string memory) {
        return tokenIdInfo[tokenId].imageURL;
    }

    function calculate(uint256[] memory attackerArmyIds,
    uint256[] memory attackerArmyAmount,
    uint256[] memory defenderArmyIds,
    uint256[] memory defenderArmyAmount
    )  external view returns (
        // uint256[] memory killedTroopsOfAttacker, 
        // uint256[] memory killedTroopsOfDefender,
        bool ,
        // int256 ,
        // int256 ,
        uint256 ,
        uint256 ,
        uint256 ,
        uint256
        ) {
        uint256 totalAttackerHp;
        uint256 totalAttackPower;
        for (uint i = 0; i < attackerArmyIds.length; i++) {
            uint256 hp = tokenIdInfo[attackerArmyIds[i]].hp ;
            uint256 power = tokenIdInfo[attackerArmyIds[i]].attackPower ;
            totalAttackerHp += hp * attackerArmyAmount[i];
            totalAttackPower += power * attackerArmyAmount[i];
        }
        uint256 totalDefenderHp;
        uint256 totalDefenderPower;
        for (uint i = 0; i < attackerArmyIds.length; i++) {
            uint256 hp = tokenIdInfo[defenderArmyIds[i]].hp ;
            uint256 power = tokenIdInfo[defenderArmyIds[i]].defPower ;
            totalDefenderHp += hp * defenderArmyAmount[i];
            totalDefenderPower += power * defenderArmyAmount[i];
        }
        int256 attRes = int256(totalAttackPower) - int256(totalDefenderHp);
        int256 defRes = int256(totalDefenderPower) - int256(totalAttackerHp);
        bool successAttack = attRes > defRes ? true : false ;
        uint256[] memory remainedAttackerTroops;
        uint256[] memory remainedDefenderTroops;
        uint256 remainedDefenderPower;
        for (uint i = 0; i < defenderArmyAmount.length; i++) {
            uint256 remianedTroops = attackerArmyAmount[i] * (totalAttackPower - totalDefenderHp);
            remainedDefenderTroops[i] = remianedTroops;
            remainedDefenderPower += remianedTroops * tokenIdInfo[defenderArmyIds[i]].attackPower;
        }
        for (uint i = 0; i < attackerArmyAmount.length; i++) {
             uint256 remianedTroops = attackerArmyAmount[i] * (remainedDefenderPower - totalAttackerHp);
             remainedAttackerTroops[i] = remianedTroops;
        }

        return (successAttack,totalAttackerHp, totalAttackPower, totalDefenderHp, totalDefenderPower);
    }
}
