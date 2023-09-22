//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import "./Lands.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Errors  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************



contract Barracks is Ownable{

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Events  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    event Attack(uint256 attackerLandId, uint256 defenderLandId,uint256[] attackerArmy, uint256[] defenderArmy, uint256[] lootAmounts, bool success);


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Vairables  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    Lands lands;

    uint256 private constant baseArmyCapacity = 50;
    //////////////////////////////////      Stone     Wood      Iron      Gold       Food
    uint256[5] private requiredCommodities = [50 ether, 50 ether, 50 ether, 100 ether, 50 ether];


    /// @notice Land token id => type of warrior => amount
    mapping (uint256 => mapping(uint256 => uint256)) internal landArmy;
    /// @notice Land id => Barracks level
    /// *** Note that since defaul level is 0 it means barracks has not builed yet.
    /// After each 'buildBararcks' barrack will upgrade to next level and new kind of army will unlock for user.
    mapping (uint256 => uint256) internal level;

    struct WarriorInfo {
        uint8 attackPower;
        uint8 defPower;
        uint8 hp;
        uint8 requiredLevel;
        string imageURL;
        string name;
        uint256 price;
    }

    WarriorInfo[] warriorTypes;


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    constructor(){
        warriorTypes.push(WarriorInfo( 60, 90, 140, 1, "https://ipfs.io/ipfs/QmTd17tuN1FmMYbQyEDbDA7L97a9fPo6YzRYJVTGcP1jWo","Spear man",5 ether));
        warriorTypes.push(WarriorInfo( 90, 70, 200, 2, "https://ipfs.io/ipfs/QmUjNQwfx3DkVW115cywXTbgBSbkh53u1k3bDcmaA9xagJ","Swordsman",8 ether));
        warriorTypes.push(WarriorInfo( 40, 60, 80, 3, "https://ipfs.io/ipfs/QmeXxnC5iqzeXeBF5DjXPeLLu4636As4mQpv9LtotHFMSp","Archer",10 ether));
    }




    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Modifiers  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    modifier existItem (uint256 typeIndex) {
        require(typeIndex < warriorTypes.length , "No defined");
        _;
    }
        /// @notice Making sure caller is owner of pointed land in Lands contract.
    modifier onlyBarracksOwner(uint256 landTokenId) {
        require(lands.ownerOf(landTokenId) == msg.sender, "Land not owned by you");
        _;
    }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***********************   External & public functions  ***********************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************



    // function _attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external onlyBarracksOwner(attackerId) returns(bool){
    //     require(lands.ownerOf(targetId) != address(0), "");
    //     require(warriorsAmounts.length == types.length, "Lengths does not match");
    //     for (uint i = 0; i < warriorsAmounts.length; i++) {
    //         require(landArmy[attackerId][i] >= warriorsAmounts[i], "Insufficient army");
    //         landArmy[attackerId][i] -= warriorsAmounts[i];
    //     }
    //     (bool success, uint256 remainedAttackerArmy, uint256 remainedDefenderArmy) = calculateResult(warriorsAmounts, targetId);
    //     // Loot calculated percent if attacker won
    //     if (success) {
    //         lands.loot(attackerId, targetId, remainedAttackerArmy - remainedDefenderArmy);
    //     }
    //     // Updating Army of each user condsidering losses.
    //     for (uint i = 0; i < types.length; i++) {
    //         if (landArmy[targetId][i] > 0) {
    //             landArmy[targetId][i] = (landArmy[targetId][i]) * (remainedDefenderArmy) / (100) ;
    //         }
    //         if (landArmy[attackerId][i] > 0) {
    //             landArmy[attackerId][i] += (warriorsAmounts[i]) * (remainedAttackerArmy) / (100);
    //         }
    //     }
    //     return success;
    // }

    function addArmy(uint256 warriorType, uint256 amount, uint256 landId) internal {
        landArmy[landId][warriorType] += amount;
    }

    function _attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) internal onlyBarracksOwner(attackerId) returns(bool, uint256){
        require(warriorsAmounts.length == getWarriorTypes().length, "Lengths does not match");
        uint256 totalArmy;
        for (uint i = 0; i < warriorsAmounts.length; i++) {
            totalArmy += warriorsAmounts[i];
            require(landArmy[attackerId][i] >= warriorsAmounts[i], "Insufficient army");
            landArmy[attackerId][i] -= warriorsAmounts[i];
        }
        require(totalArmy > 0, "Army = 0");
        uint256 attackerPower;
        uint256 attackerHp;
        uint256 defenderPower;
        uint256 defenderHp;

        (uint256[] memory defenderWarriorsAmounts,) = getArmy(targetId);
        // Calculate attacker and defender power
        for (uint256 i = 0; i < warriorTypes.length; i++) {
            attackerPower += warriorTypes[i].attackPower * warriorsAmounts[i];
            attackerHp += warriorTypes[i].hp * warriorsAmounts[i];
            defenderPower += warriorTypes[i].defPower * defenderWarriorsAmounts[i];
            defenderHp += warriorTypes[i].hp * defenderWarriorsAmounts[i];
        }


        (bool success, uint256 remainedAttackerArmy, uint256 remainedDefenderArmy) = _calculateWar(attackerPower, attackerHp, defenderPower, defenderHp);

        // Updating Army of each user condsidering losses.
        for (uint i = 0; i < warriorTypes.length; i++) {
            if (landArmy[targetId][i] > 0) {
                landArmy[targetId][i] = (landArmy[targetId][i]) * (remainedDefenderArmy) / (100) ;
            }
            if (landArmy[attackerId][i] > 0) {
                landArmy[attackerId][i] += (warriorsAmounts[i]) * (remainedAttackerArmy) / (100);
            }
        }
        return (success, remainedAttackerArmy - remainedDefenderArmy );
    }




    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  **************************   Only owner functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function updateType(uint8[3] memory physicalInfo,uint8 requiredLevel, string memory imageURL, string memory name, uint256 price, uint256 typeIndex) external onlyOwner{
        warriorTypes[typeIndex] = WarriorInfo( physicalInfo[0], physicalInfo[1], physicalInfo[2], requiredLevel, imageURL,name,price );
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *****************************   View functions  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function getArmy(uint256 landId) view public returns (uint256[] memory, uint256) {
        uint256[] memory amounts = new uint256[](warriorTypes.length);
        uint256 totalArmy;
        for (uint i = 0; i < warriorTypes.length; i++) {
            amounts[i] = landArmy[landId][i];
            totalArmy += landArmy[landId][i];
        }
        return (amounts, totalArmy);
    }

    function getWarriorTypes() view public returns (WarriorInfo[] memory) {
        return warriorTypes;
    }

    function getLevel(uint256 landTokenId) view public returns (uint256) {
        return level[landTokenId];
    }

    // function getRequiredCommodities() view public returns (uint256[5] memory) {
    //     return requiredCommodities;
    // }

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ****************************   Internal functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    function _calculateWar(uint256 attackerPower, uint256 attackerHp, uint256 defenderPower, uint256 defenderHp) pure internal returns ( bool, uint256, uint256 ) {
        
        // Calculate the percentage of loss for attacker and target
        uint256 attackerRemainedArmyPercent;
        uint256 targetRemainedArmyPercent;
        bool attackSuccess;
        // Compare attacker power with target power to determine the result
        if ( defenderHp >  attackerPower && attackerHp > defenderPower ) {
            if (attackerHp - defenderPower > defenderHp -  attackerPower) {
                attackSuccess = true;
                attackerRemainedArmyPercent = (attackerHp - (defenderPower/3))*100 / attackerHp;
                targetRemainedArmyPercent = (defenderHp - attackerPower/2) *100 / defenderHp;
            } else {
                attackSuccess = false;
                attackerRemainedArmyPercent = (attackerHp - (defenderPower/2))*100 / attackerHp;
                targetRemainedArmyPercent = (defenderHp - attackerPower/3) *100 / defenderHp;
            }
        } else {
            
            if (defenderHp  <  attackerPower ) {
                      attackSuccess = true;
                if (attackerPower < defenderHp*3/2 ) {
                    attackerRemainedArmyPercent = (attackerHp - (defenderPower/4))*100 / attackerHp;
                    targetRemainedArmyPercent = 30;
                }
                if ( defenderHp*3/2 < attackerPower && defenderHp*2 > attackerPower) {
                    attackerRemainedArmyPercent = (attackerHp - (defenderPower/5))*100 / attackerHp;
                    targetRemainedArmyPercent = 15;
                }
                if (defenderHp * 2 < attackerPower) {
                    attackerRemainedArmyPercent = (attackerHp - (defenderPower/6))*100 / attackerHp;
                    targetRemainedArmyPercent = 0;
                } 
            } else {
                attackSuccess = false;
                if (defenderPower < attackerHp*3/2) {
                    attackerRemainedArmyPercent = 30;
                    targetRemainedArmyPercent = (defenderHp - (attackerPower/4)) * 100 / defenderHp;
                }
                if (attackerHp * 2 < defenderPower) {
                    attackerRemainedArmyPercent = 15;
                    targetRemainedArmyPercent = (defenderHp - (attackerPower/5)) * 100 / defenderHp;
                }
                if (attackerHp * 3/2 < defenderPower && attackerHp*2 > defenderPower) {
                    attackerRemainedArmyPercent = 0;
                    targetRemainedArmyPercent = (defenderHp - (attackerPower/6)) * 100 / defenderHp;
                }
            }


        }
            return (attackSuccess,attackerRemainedArmyPercent, targetRemainedArmyPercent);

    }



    // function calculateResult( uint256[] memory warriorsAmounts, uint256 targetLandId) internal view returns ( bool, uint256, uint256) {
    //     uint256 attackerPower;
    //     uint256 attackerHp;
    //     uint256 defenderPower;
    //     uint256 defenderHp;
    //     bool attackSuccess;
    //           (uint256[] memory defenderWarriorsAmounts,) = getArmy(targetLandId);
    //     // Calculate attacker and defender power
    //     for (uint256 i = 0; i < warriorTypes.length; i++) {
    //         attackerPower += warriorTypes[i].attackPower * warriorsAmounts[i];
    //         attackerHp += warriorTypes[i].hp * warriorsAmounts[i];
    //         defenderPower += warriorTypes[i].defPower * defenderWarriorsAmounts[i];
    //         defenderHp += warriorTypes[i].hp * defenderWarriorsAmounts[i];
    //     }


    //     // Calculate the percentage of loss for attacker and target
    //     uint256 attackerRemainedArmyPercent;
    //     uint256 targetRemainedArmyPercent;

    //     // Compare attacker power with target power to determine the result
    //     if ( defenderHp >  attackerPower && attackerHp > defenderPower ) {
    //         if (attackerHp - defenderPower > defenderHp -  attackerPower) {
    //             attackSuccess = true;
    //             attackerRemainedArmyPercent = (attackerHp - (defenderPower/3))*100 / attackerHp;
    //             targetRemainedArmyPercent = (defenderHp - attackerPower/2) *100 / defenderHp;
    //         } else {
    //             attackSuccess = false;
    //             attackerRemainedArmyPercent = (attackerHp - (defenderPower/2))*100 / attackerHp;
    //             targetRemainedArmyPercent = (defenderHp - attackerPower/3) *100 / defenderHp;
    //         }
    //     } else {
            
    //         if (defenderHp  <  attackerPower ) {
    //                   attackSuccess = true;
    //             if (attackerPower < defenderHp*3/2 ) {
    //                 attackerRemainedArmyPercent = (attackerHp - (defenderPower/4))*100 / attackerHp;
    //                 targetRemainedArmyPercent = 30;
    //             }
    //             if ( defenderHp*3/2 < attackerPower && defenderHp*2 > attackerPower) {
    //                 attackerRemainedArmyPercent = (attackerHp - (defenderPower/5))*100 / attackerHp;
    //                 targetRemainedArmyPercent = 15;
    //             }
    //             if (defenderHp * 2 < attackerPower) {
    //                 attackerRemainedArmyPercent = (attackerHp - (defenderPower/6))*100 / attackerHp;
    //                 targetRemainedArmyPercent = 0;
    //             } 
    //         } else {
    //             attackSuccess = false;
    //             if (defenderPower < attackerHp*3/2) {
    //                 attackerRemainedArmyPercent = 30;
    //                 targetRemainedArmyPercent = (defenderHp - (attackerPower/4)) * 100 / defenderHp;
    //             }
    //             if (attackerHp * 2 < defenderPower) {
    //                 attackerRemainedArmyPercent = 15;
    //                 targetRemainedArmyPercent = (defenderHp - (attackerPower/5)) * 100 / defenderHp;
    //             }
    //             if (attackerHp * 3/2 < defenderPower && attackerHp*2 > defenderPower) {
    //                 attackerRemainedArmyPercent = 0;
    //                 targetRemainedArmyPercent = (defenderHp - (attackerPower/6)) * 100 / defenderHp;
    //             }
    //         }


    //     }
    //         return (attackSuccess,attackerRemainedArmyPercent, targetRemainedArmyPercent);


    // }


    // function calculateTimestamp() external {}
    // function repair() external {}

}
