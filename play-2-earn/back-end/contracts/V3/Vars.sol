//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Vars is Ownable{

    // uint256 private constant withdrawalFee = 10;
    // uint256 private constant swapFee = 5;
    uint256 private constant workerGoldPerHour = 10 ether;
    uint256 private constant baseBuildTimestamp = 3 hours;
    uint256 private constant baseTownhallBuildTimestamp = 6 hours;
    uint8 private constant maxResourceBuildingsCapacity = 8;
    uint8 private constant baseArmyCapacity = 50;
    uint256 private constant baseGoodCapacityOfBuilding = 40 ether;
    uint256 private constant baseWarriorRequiredFood = 3 ether;
    uint256 private constant baseFoodRevenuePer3hours = 2 ether;
    uint256 private constant baseGoldRevenuePer3hours = 2 ether;
    uint256 private constant baseWarriorLootCapacity = 30 ether;
    uint256 private constant retreatCostPerWarrior = 5 ether;
      // uint256 private constant trnasferCostPercentage = 7;
        struct WarriorInfo {
        uint8 attackPower;
        uint8 defPower;
        uint8 hp;
        string name;
        uint256 price;
    }

  
    WarriorInfo[] warriorTypes;

    constructor()  Ownable(msg.sender) {
        warriorTypes.push(WarriorInfo( 45, 30, 70, "Maceman",7 ether));
        warriorTypes.push(WarriorInfo( 20, 60, 70, "Spearman",8 ether));
        warriorTypes.push(WarriorInfo( 60, 70, 90,"Swordsman",15 ether));
        warriorTypes.push(WarriorInfo( 50, 50, 70,"Archer",10 ether));
        warriorTypes.push(WarriorInfo( 45, 80, 110,"Shieldman",22 ether));
        warriorTypes.push(WarriorInfo( 90, 60, 100,"Knight",30 ether));
    }

function WarriorTypes() view public returns (WarriorInfo[] memory) {
        return warriorTypes;
    }
    // function WithdrawalFee() pure public returns (uint256) {
    //     return withdrawalFee;
    // }
    //   function SwapFee() pure public returns (uint256) {
    //     return swapFee;
    // }

    function RetreatCostPerWarrior() pure public returns (uint256) {
      return retreatCostPerWarrior;
    }
      function WorkerGoldPerHour() pure public returns (uint256) {
        return workerGoldPerHour;
    }
      function BaseBuildTimestamp() pure public returns (uint256) {
        return baseBuildTimestamp;
    }
      function BaseWarriorLootCapacity() pure public returns (uint256) {
        return baseWarriorLootCapacity;
    }
      function BaseTownhallBuildTimestamp() pure public returns (uint256) {
        return baseTownhallBuildTimestamp;
    }
      function MaxResourceBuildingsCapacity() pure public returns (uint256) {
        return maxResourceBuildingsCapacity;
    }
      function BaseArmyCapacity() pure public returns (uint256) {
        return baseArmyCapacity;
    }
      function BaseGoodCapacityOfBuilding() pure public returns (uint256) {
        return baseGoodCapacityOfBuilding;
    }
      function BaseWarriorRequiredFood() pure public returns (uint256) {
        return baseWarriorRequiredFood;
    }
      function BaseFoodRevenuePer3hours() pure public returns (uint256) {
        return baseFoodRevenuePer3hours;
    }
      function BaseGoldRevenuePer3hours() pure public returns (uint256) {
        return baseGoldRevenuePer3hours;
    }
    //    function TrnasferCostPercentage() pure public returns (uint256) {
    //     return trnasferCostPercentage;
    // }
  
}