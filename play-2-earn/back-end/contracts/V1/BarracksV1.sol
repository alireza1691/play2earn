// //SPDX-License-Identifier: MIT
// pragma solidity ^0.8.17;


// import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ********************************   Errors  ***********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  *****************************************a*************************************


// contract BarracksV1 is Ownable{

//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ********************************   Events  ***********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************

//     event Attack(uint256 attackerLandId, uint256 defenderLandId,uint256[] attackerArmy, uint256[] defenderArmy, bool success);


//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  *******************************   Vairables  *********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************

//     /// @notice Land token id => type of warrior => amount
//     mapping (uint256 => mapping(uint256 => uint256)) internal landArmy;
//     /// @notice Land id => Barracks level
//     /// *** Note that since defaul level is 0 it means barracks has not builed yet.
//     /// After each 'buildBararcks' barrack will upgrade to next level and new kind of army will unlock for user.


//     struct WarriorInfo {
//         uint8 attackPower;
//         uint8 defPower;
//         uint8 hp;
//         uint8 requiredLevel;
//         string name;
//         uint256 price;
//     }

//     WarriorInfo[] warriorTypes;
//     address private  townContract;


//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************   Constructor  ********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************


//     constructor(){
//         warriorTypes.push(WarriorInfo( 60, 90, 140, 1,"Spearman",5 ether));
//         warriorTypes.push(WarriorInfo( 90, 70, 200, 2,"Swordsman",8 ether));
//         warriorTypes.push(WarriorInfo( 40, 60, 80, 3,"Archer",10 ether));
//     }




//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  *******************************   Modifiers  *********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************

//     modifier existItem (uint256 typeIndex) {
//         require(typeIndex < warriorTypes.length , "No defined");
//         _;
//     }
//     modifier onlyTown () {
//         require(msg.sender == townContract, "Caller should be town contract");
//         _;
//     }



//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ***********************   External & public functions  ***********************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************



//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  *********************   Only owner and town functions  ***********************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************

//     function authorize(address town) external  onlyOwner{
//         townContract = town;
//     }

//     function updateWarriorType_(uint8[3] memory physicalInfo,uint8 requiredLevel/*, string memory imageURL*/, string memory name, uint256 price, uint256 typeIndex) public  onlyOwner{
//         warriorTypes[typeIndex] = WarriorInfo( physicalInfo[0], physicalInfo[1], physicalInfo[2], requiredLevel,/* imageURL,*/name,price );
//     }

//     function addWarrior_(uint256 warriorType, uint256 amount, uint256 landId) external  onlyTown {
//         landArmy[landId][warriorType] += amount;
//     }


//     function attack_(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external  onlyTown returns(bool, uint256){
//         require(warriorsAmounts.length == warriorTypes.length, "Lengths does not match");
//         // uint256 totalArmy;
//         uint256 attackerPower;
//         uint256 attackerHp;
//         uint256 defenderPower;
//         uint256 defenderHp;
//         uint256[] memory defenderWarriorsAmounts = getArmy(targetId);

//         for (uint i = 0; i < warriorsAmounts.length; i++) {
//             require(landArmy[attackerId][i] >= warriorsAmounts[i], "Insufficient army");
//             // totalArmy += warriorsAmounts[i];
//             landArmy[attackerId][i] -= warriorsAmounts[i];

//             attackerPower += warriorTypes[i].attackPower * warriorsAmounts[i];
//             attackerHp += warriorTypes[i].hp * warriorsAmounts[i];
//             defenderPower += warriorTypes[i].defPower * defenderWarriorsAmounts[i];
//             defenderHp += warriorTypes[i].hp * defenderWarriorsAmounts[i];
//         }
//         // require(totalArmy > 0, "Army = 0");


//         (bool success, uint256 remainedAttackerArmy, uint256 remainedDefenderArmy) = _calculateWar(attackerPower, attackerHp, defenderPower, defenderHp);

//         // Updating Army of each user condsidering losses.
//         _reduceBatchWarriorByPercent(remainedDefenderArmy, targetId);
//         _addEnteredBatchWarriorByPercent(warriorsAmounts, remainedAttackerArmy, attackerId);
        
//         emit Attack(attackerId, targetId, warriorsAmounts, getArmy(targetId),success);
//         return (success, remainedAttackerArmy - remainedDefenderArmy );
//     }


//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  *****************************   View functions  ******************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************


//     function getArmy(uint256 landId) view public returns (uint256[] memory) {
//         uint256[] memory amounts = new uint256[](warriorTypes.length);
//         for (uint i = 0; i < warriorTypes.length; i++) {
//             amounts[i] = landArmy[landId][i];
//         }
//         return (amounts);
//     }

//     function getWarriorTypes() view external   returns (WarriorInfo[] memory) {
//         return warriorTypes;
//     }

//     // function getRequiredCommodities() view public returns (uint256[5] memory) {
//     //     return requiredCommodities;
//     // }

//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ****************************   Internal functions  ***************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************


//     function _reduceBatchWarriorByPercent(uint256 remainedPercent, uint256 landId) internal {
//         for (uint i = 0; i < warriorTypes.length; i++) {
//             if (landArmy[landId][i] > 0) {
//                 landArmy[landId][i] = (landArmy[landId][i]) * (remainedPercent) / (100) ;
//             }
//         }
//     }
//     function _addEnteredBatchWarriorByPercent(uint256[] memory enteredArmy, uint256 percentage, uint256 landId) internal{
//         for (uint i = 0; i < warriorTypes.length; i++) {
//             if (enteredArmy[i] > 0) {
//                 landArmy[landId][i] += (enteredArmy[i]) * (percentage) / (100);
//             }
//         }
//     }




//     function _calculateWar(uint256 attackerPower, uint256 attackerHp, uint256 defenderPower, uint256 defenderHp) pure internal returns ( bool, uint256, uint256 ) {
        
//         // Calculate the percentage of loss for attacker and target
//         uint256 attackerRemainedArmyPercent;
//         uint256 targetRemainedArmyPercent;
//         bool attackSuccess;
//         // Compare attacker power with target power to determine the result
//         if ( defenderHp >  attackerPower && attackerHp > defenderPower ) {
//             if (attackerHp - defenderPower > defenderHp -  attackerPower) {
//                 attackSuccess = true;
//                 attackerRemainedArmyPercent = (attackerHp - (defenderPower/3))*100 / attackerHp;
//                 targetRemainedArmyPercent = (defenderHp - attackerPower/2) *100 / defenderHp;
//             } else {
//                 attackSuccess = false;
//                 attackerRemainedArmyPercent = (attackerHp - (defenderPower/2))*100 / attackerHp;
//                 targetRemainedArmyPercent = (defenderHp - attackerPower/3) *100 / defenderHp;
//             }
//         } else {
            
//             if (defenderHp  <  attackerPower ) {
//                       attackSuccess = true;
//                 if (attackerPower < defenderHp*3/2 ) {
//                     attackerRemainedArmyPercent = (attackerHp - (defenderPower/4))*100 / attackerHp;
//                     targetRemainedArmyPercent = 30;
//                 }
//                 if ( defenderHp*3/2 < attackerPower && defenderHp*2 > attackerPower) {
//                     attackerRemainedArmyPercent = (attackerHp - (defenderPower/5))*100 / attackerHp;
//                     targetRemainedArmyPercent = 15;
//                 }
//                 if (defenderHp * 2 < attackerPower) {
//                     attackerRemainedArmyPercent = (attackerHp - (defenderPower/6))*100 / attackerHp;
//                     targetRemainedArmyPercent = 0;
//                 } 
//             } else {
//                 attackSuccess = false;
//                 if (defenderPower < attackerHp*3/2) {
//                     attackerRemainedArmyPercent = 30;
//                     targetRemainedArmyPercent = (defenderHp - (attackerPower/4)) * 100 / defenderHp;
//                 }
//                 if (attackerHp * 2 < defenderPower) {
//                     attackerRemainedArmyPercent = 15;
//                     targetRemainedArmyPercent = (defenderHp - (attackerPower/5)) * 100 / defenderHp;
//                 }
//                 if (attackerHp * 3/2 < defenderPower && attackerHp*2 > defenderPower) {
//                     attackerRemainedArmyPercent = 0;
//                     targetRemainedArmyPercent = (defenderHp - (attackerPower/6)) * 100 / defenderHp;
//                 }
//             }


//         }
//             return (attackSuccess,attackerRemainedArmyPercent, targetRemainedArmyPercent);

//     }


// }