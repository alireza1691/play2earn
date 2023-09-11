//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


// import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./LandsV1.sol";

contract Army {
        LandsV1 lands;

    constructor(address landsContractAddress){
        types.push(Info( 60, 150, 140, "Replace this with image url","Spear man",5 ether));
        types.push(Info( 130, 100, 200, "Replace this with image url","Swordsman",8 ether));
        types.push(Info( 80, 110, 80, "Replace this with image url","Archer",10 ether));
        lands = LandsV1(landsContractAddress);
    }

    uint256 private constant baseArmyCapacity = 50;
    //////////////////////////////////      Stone     Wood      Iron      Gold       Food
    uint256[5] private requiredCommodities = [50 ether, 50 ether, 50 ether, 100 ether, 50 ether];


    /// @notice land token id => type of warrior => amount
    mapping (uint256 => mapping(uint256 => uint256)) internal balances;
    mapping (uint256 => uint256) internal level;

    struct Info {
        uint8 attackPower;
        uint8 defPower;
        uint8 hp;
        string imageURL;
        string name;
        uint256 price;
    }

    Info[] types;
    modifier existItem (uint256 typeIndex) {
        require(typeIndex < types.length , "No defined");
        _;
    }


    function buildBararcks(uint256 landId) public {
        uint256 currentLevel = level[landId];
        uint256[5] memory requiredComs;
        for (uint i = 0; i < requiredCommodities.length; i++) {
            requiredComs[i] = requiredCommodities[i] * (currentLevel+1);
        }
        require(lands.getAssetBal(landId, 0) >= requiredComs[0] &&
        lands.getAssetBal(landId, 1) >= requiredComs[1] && 
        lands.getAssetBal(landId, 2) >= requiredComs[2] &&
        lands.getAssetBal(landId, 3) >= requiredComs[3] &&
        lands.getAssetBal(landId, 4) >= requiredComs[4] 
        , "Insufficient commodities");
        lands.spendCommodities(landId,requiredComs);
    }

    function buildWarrior(uint256 landId, uint256 typeIndex, uint256 amount) internal{
        require(msg.sender == lands.ownerOf(landId), "Callerr is not land owner");
        require(typeIndex < types.length, "Type is not valid");
        require(typeIndex <= level[landId], "Upgrade barracks needed");
        lands.spendCommodities(landId,[0,0,0,types[typeIndex].price,0]);
        balances[landId][typeIndex] += amount;
    }

    function getArmy(uint256 landId) view public returns (uint256[] memory) {
        uint256[] memory amounts;
        for (uint i = 0; i < types.length; i++) {
            amounts[i] = balances[landId][i];
        }
        return amounts;
    }

    function attack(uint256[] memory warriorsTypes,uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external returns(uint, uint){
        require(warriorsTypes.length == warriorsAmounts.length, "Lengths does not match");
        for (uint i = 0; i < warriorsTypes.length; i++) {
            require(balances[attackerId][warriorsTypes[i]] > warriorsAmounts[i], "InsufficientArmy");
            balances[attackerId][warriorsTypes[i]] -= warriorsAmounts[i];
        }
        // calculateResult();
    }

    function addNewType() external{
        
    }

function calculateResult(uint256[] memory warriorsTypes, uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) view public returns ( bool) {
    require(warriorsTypes.length == warriorsAmounts.length, "Lengths do not match");

    uint256 attackerPower;
    uint256 targetPower;
    bool attackSuccess;

    // Calculate attacker power
    for (uint256 i = 0; i < warriorsTypes.length; i++) {
        require(balances[attackerId][warriorsTypes[i]] >= warriorsAmounts[i], "Insufficient Army");
        uint256 warriorPower = types[warriorsTypes[i]].attackPower * warriorsAmounts[i] * types[warriorsTypes[i]].hp;
        attackerPower += warriorPower;
    }

    // Calculate target power (assuming target has equal defense power for all warriors)
    for (uint256 i = 0; i < warriorsTypes.length; i++) {
        uint256 warriorPower = types[warriorsTypes[i]].defPower * warriorsAmounts[i] * types[warriorsTypes[i]].hp;
        targetPower += warriorPower;
    }

    // Calculate the percentage of loss for attacker and target
    uint256 attackerLossPercent;
    uint256 targetLossPercent;

    // Compare attacker power with target power to determine the result
    if (attackerPower > targetPower) {
        // Attacker wins
        attackSuccess = true;
        uint256 powerDifference = attackerPower - targetPower;
        attackerLossPercent = (powerDifference * 100) / attackerPower;
        targetLossPercent = attackerLossPercent / 10; // Assuming winner's advantage is 10%
   
    } else {
        // Target wins or it's a draw
        attackSuccess = false;
        uint256 powerDifference = targetPower - attackerPower;
        targetLossPercent = (powerDifference * 100) / targetPower;
        attackerLossPercent = targetLossPercent / 10; // Assuming winner's advantage is 10%
    }

}
    // function claim(address to, uint256 id, uint256 amount, bytes memory data) external existItem(id){
    //     _mint( to, id, amount, data);
    // }

    // function claimBatch(address to, uint256[] memory id, uint256[] memory amount, bytes memory data) external{
    //     _mintBatch(to, id, amount, data);
    // }

    // function test() external view returns (Info memory) {
    //     return tokenIdInfo[4];
    // }

    // function uri(uint256 tokenId) view public override returns (string memory) {
    //     return tokenIdInfo[tokenId].imageURL;
    // }

    // function calculate(uint256[] memory attackerArmyIds,
    //     uint256[] memory attackerArmyAmount,
    //     uint256[] memory defenderArmyIds,
    //     uint256[] memory defenderArmyAmount
    //     )  external view returns (
    //     // uint256[] memory killedTroopsOfAttacker, 
    //     // uint256[] memory killedTroopsOfDefender,
    //     bool ,
    //     // int256 ,
    //     // int256 ,
    //     uint256 ,
    //     uint256 ,
    //     uint256 
    //     ) {
    //     uint256 totalAttackerHp;
    //     uint256 totalAttackPower;
    //     for (uint i = 0; i < attackerArmyIds.length; i++) {
    //         uint256 hp = tokenIdInfo[attackerArmyIds[i]].hp ;
    //         uint256 power = tokenIdInfo[attackerArmyIds[i]].attackPower ;
    //         totalAttackerHp += hp * attackerArmyAmount[i];
    //         totalAttackPower += power * attackerArmyAmount[i];
    //     }
    //     uint256 totalDefenderHp;
    //     uint256 totalDefenderPower;
    //     for (uint i = 0; i < attackerArmyIds.length; i++) {
    //         uint256 hp = tokenIdInfo[defenderArmyIds[i]].hp ;
    //         uint256 power = tokenIdInfo[defenderArmyIds[i]].defPower ;
    //         totalDefenderHp += hp * defenderArmyAmount[i];
    //         totalDefenderPower += power * defenderArmyAmount[i];
    //     }
    //     int256 attRes = int256(totalAttackPower) - int256(totalDefenderHp);
    //     int256 defRes = int256(totalDefenderPower) - int256(totalAttackerHp);
    //     bool successAttack = attRes > defRes ? true : false ;
    //     // uint256[] memory remainedAttackerTroops;
    //     // uint256[] memory remainedDefenderTroops;
       
    //     bool isAttackResPositive = attRes >= 0 ? true : false;
    //     bool isDefResPositive = defRes >= 0 ? true : false;
    //     // uint256 defenderFatality = (uint256(convertedAttackRes)) * 100/ totalDefenderHp;
    //     // uint256 remainedDefenderPower = totalDefenderPower * (100 - defenderFatality) / 100;
    //     // uint256 attackerFatality = (remainedDefenderPower - uint256(convertedDefenceRes))*100 / totalAttackerHp;

    //     int256 defenderFatality = isAttackResPositive ? 100 : (int256(totalDefenderHp) - attRes )/int256(totalDefenderHp);
    //     int256 remainedDefenderPower = totalDefenderPower * (100 - defenderFatality) / 100;
    //     int256 attackerFatality = (remainedDefenderPower - uint256(convertedDefenceRes))*100 / totalAttackerHp;


    //     // for (uint i = 0; i < defenderArmyAmount.length; i++) {
    //     //     uint256 remianedTroops = attackerArmyAmount[i] * (totalAttackPower - totalDefenderHp);
    //     //     remainedDefenderTroops[i] = remianedTroops;
    //     //     remainedDefenderPower += remianedTroops * tokenIdInfo[defenderArmyIds[i]].attackPower;
    //     // }
    //     // for (uint i = 0; i < attackerArmyAmount.length; i++) {
    //     //      uint256 remianedTroops = attackerArmyAmount[i] * (remainedDefenderPower - totalAttackerHp);
    //     //      remainedAttackerTroops[i] = remianedTroops;
    //     // }

    //     return (successAttack, defenderFatality, remainedDefenderPower, attackerFatality);
    // }
}
