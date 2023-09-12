//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


// import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./LandsV1.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeMath } from "@openzeppelin/contracts-v0.7/math/SafeMath.sol";

// import { StringUtils } from "./StringUtils.sol";

contract Army is Ownable{
        using SafeMath for uint256;

        LandsV1 lands;

    constructor(address landsContractAddress){
        types.push(Info( 60, 90, 140, "Replace this with image url","Spear man",5 ether));
        types.push(Info( 90, 70, 200, "Replace this with image url","Swordsman",8 ether));
        types.push(Info( 40, 60, 80, "Replace this with image url","Archer",10 ether));
        lands = LandsV1(landsContractAddress);
    }

    uint256 private constant baseArmyCapacity = 50;
    //////////////////////////////////      Stone     Wood      Iron      Gold       Food
    uint256[5] private requiredCommodities = [50 ether, 50 ether, 50 ether, 100 ether, 50 ether];


    /// @notice Land token id => type of warrior => amount
    mapping (uint256 => mapping(uint256 => uint256)) internal balances;
    /// @notice Land id => Barracks level
    /// *** Note that since defaul level is 0 it means barracks has not builed yet.
    /// After each 'buildBararcks' barrack will upgrade to next level and new kind of army will unlock for user.
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
        /// @notice Making sure caller is owner of pointed land in Lands contract.
    modifier onlyLandOwner(uint256 landTokenId) {
        require(lands.ownerOf(landTokenId) == msg.sender, "Land not owned by you");
        _;
    }



    function buildBarracks(uint256 landId) public {
        uint256 currentLevel = level[landId];
        uint256[5] memory requiredComs;
        for (uint i = 0; i < requiredCommodities.length; i++) {
            requiredComs[i] = requiredCommodities[i] * (currentLevel+1);
        }
        uint256[5] memory balArray = lands.getAssetsBal(landId);
        require(balArray[0] >= requiredComs[0] &&
        balArray[1] >= requiredComs[1] && 
        balArray[2] >= requiredComs[2] &&
        balArray[3] >= requiredComs[3] &&
        balArray[4] >= requiredComs[4] 
        , "Insufficient commodities");
        lands.spendCommodities(landId,requiredComs);
        level[landId] ++;
    }

    function buildWarrior(uint256 landId, uint256 typeIndex, uint256 amount) external{
        require(msg.sender == lands.ownerOf(landId), "Callerr is not land owner");
        require(typeIndex < types.length, "Type is not valid");
        require(typeIndex < level[landId] && level[landId] != 0, "Upgrade barracks needed");
        lands.spendCommodities(landId,[0,0,0,types[typeIndex].price,0]);
        balances[landId][typeIndex] += amount;
    }

    function getArmy(uint256 landId) view public returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](types.length);
        for (uint i = 0; i < types.length; i++) {
            amounts[i] = balances[landId][i];
        }
        return amounts;
    }

    function attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external onlyLandOwner(attackerId) returns(uint, uint){
        require(lands.ownerOf(targetId) != address(0), "");
        require(warriorsAmounts.length == types.length, "Lengths does not match");
        for (uint i = 0; i < warriorsAmounts.length; i++) {
            require(balances[attackerId][i] >= warriorsAmounts[i], "Insufficient army");
            balances[attackerId][i] -= warriorsAmounts[i];
        }
        (bool success, uint256 remainedAttackerArmy, uint256 remainedDefenderArmy) = calculateResult(warriorsAmounts, targetId);
        // Loot calculated percent if attacker won
        if (success) {
            lands.loot(attackerId, targetId, remainedAttackerArmy - remainedDefenderArmy);
        }
        // Updating Army of each user condsidering losses.
        for (uint i = 0; i < types.length; i++) {
            if (balances[targetId][i] > 0) {
                balances[targetId][i] = (balances[targetId][i]).mul(remainedDefenderArmy).div(100) ;
            }
            if (balances[attackerId][i] > 0) {
                balances[attackerId][i] += warriorsAmounts[i].mul(remainedAttackerArmy).div(100);
                // balances[attackerId][i] -= warriorsAmounts[i].mul(totalPercentage.sub(remainedAttackerArmy));
                            // balances[attackerId][i] = balances[attackerId][i].sub(warriorsAmounts[i].mul(totalPercentage.sub(remainedAttackerArmy)).div(100));
            }
        }
    }

    function updateType(uint8[3] memory physicalInfo, string memory imageURL, string memory name, uint256 price, uint256 typeIndex) external onlyOwner{
        types[typeIndex] = Info( physicalInfo[0], physicalInfo[1], physicalInfo[2], imageURL,name,price );
    }

    function calculateResult( uint256[] memory warriorsAmounts, uint256 targetLandId) public view returns ( bool, uint256, uint256) {
        uint256 attackerPower;
        uint256 attackerHp;
        uint256 defenderPower;
        uint256 defenderHp;
        bool attackSuccess;
              uint256[] memory defenderWarriorsAmounts = getArmy(targetLandId);
        // Calculate attacker and defender power
        for (uint256 i = 0; i < types.length; i++) {
            attackerPower += types[i].attackPower * warriorsAmounts[i];
            attackerHp += types[i].hp * warriorsAmounts[i];
            defenderPower += types[i].defPower * defenderWarriorsAmounts[i];
            defenderHp += types[i].hp * defenderWarriorsAmounts[i];
        }


        // Calculate the percentage of loss for attacker and target
        uint256 attackerRemainedArmyPercent;
        uint256 targetRemainedArmyPercent;
        uint256 powerDifference;

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
