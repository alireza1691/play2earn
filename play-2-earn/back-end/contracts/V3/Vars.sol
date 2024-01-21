//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Vars is Ownable{

    uint256 private  workerGoldPerMinute = 1 ether ;
    uint256 private  baseArmyCapacity = 50;
    uint256 private  baseWarriorRequiredFood = 3 ether;
    uint256 private  baseFoodRevenuePer3hours = 2 ether;
    uint256 private  baseGoldRevenuePer3hours = 2 ether;
    uint256 private  baseWarriorLootCapacity = 30 ether;
    uint256 private  retreatCostPerWarrior = 5 ether;
    uint256 private  dispatchCostPerWarrior = 1 ether;
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

    function editWarrior(uint256 index,uint8[3] memory amounts, uint256 price) external onlyOwner {
      require(index < 6, "Invalid warrior");
      warriorTypes[index] = WarriorInfo(amounts[0],amounts[1],amounts[2],warriorTypes[index].name,price);
    }

    function changeVariable(uint256 newVarAmount, uint256 index) external onlyOwner {
      if (index == 0) {
        require(newVarAmount > 200000000 gwei && newVarAmount < 5 ether, "Amount is out of range");
        workerGoldPerMinute = newVarAmount;
      }
      if (index == 1) {
        require(newVarAmount > 20 && newVarAmount < 200, "Amount is out of range");
        baseArmyCapacity  = newVarAmount;
      }
      if (index == 2) {
        require(newVarAmount > 1 && newVarAmount < 10, "Amount is out of range");
        baseWarriorRequiredFood  = newVarAmount;
      }
      if (index == 3) {
        require(newVarAmount > 500000000 gwei && newVarAmount < 10 ether, "Amount is out of range");
        baseFoodRevenuePer3hours  = newVarAmount;
      }
      if (index == 4) {
        require(newVarAmount > 500000000 gwei && newVarAmount <  10 ether, "Amount is out of range");
        baseGoldRevenuePer3hours  = newVarAmount;
      }
      if (index == 5) {
        require(newVarAmount > 5 ether && newVarAmount < 100 ether, "Amount is out of range");
        baseWarriorLootCapacity  = newVarAmount;
      }
      if (index == 6) {
        require(newVarAmount > 1 ether && newVarAmount < 10 ether, "Amount is out of range");
        retreatCostPerWarrior  = newVarAmount;
      }
      if (index == 7) {
        require(newVarAmount > 200000000 && newVarAmount < 5 ether, "Amount is out of range");
        dispatchCostPerWarrior  = newVarAmount;
      }
    }

    function WarriorTypes() view public returns (WarriorInfo[] memory) {
        return warriorTypes;
    }
    function DispatchCostPerWarrior() view public returns (uint256) {
      return dispatchCostPerWarrior;
    }

    function RetreatCostPerWarrior() view public returns (uint256) {
      return retreatCostPerWarrior;
    }
    function WorkerGoldPerMinute() view public returns (uint256) {
        return workerGoldPerMinute;
    }

    function BaseWarriorLootCapacity() view public returns (uint256) {
        return baseWarriorLootCapacity;
    }

    function BaseArmyCapacity() view public returns (uint256) {
        return baseArmyCapacity;
    }

    function BaseWarriorRequiredFood() view public returns (uint256) {
        return baseWarriorRequiredFood;
    }
    function BaseFoodRevenuePer3hours() view public returns (uint256) {
        return baseFoodRevenuePer3hours;
    }
    function BaseGoldRevenuePer3hours() view public returns (uint256) {
        return baseGoldRevenuePer3hours;
    }
    //    function TrnasferCostPercentage() pure public returns (uint256) {
    //     return trnasferCostPercentage;
    // }
  
}