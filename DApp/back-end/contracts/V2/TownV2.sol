//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { LandsV2 } from "./LandsV2.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/interfaces/IERC721.sol";
library TransferHelper {
    /// @notice Transfers tokens from the targeted address to the given destination
    /// @notice Errors with 'STF' if transfer fails
    /// @param token The contract address of the token to be transferred
    /// @param from The originating address from which the tokens will be transferred
    /// @param to The destination address of the transfer
    /// @param value The amount to be transferred
    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) =
            token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'STF');
    }

    /// @notice Transfers tokens from msg.sender to a recipient
    /// @dev Errors with ST if transfer fails
    /// @param token The contract address of the token which will be transferred
    /// @param to The recipient of the transfer
    /// @param value The value of the transfer
    function safeTransfer(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'ST');
    }

    /// @notice Approves the stipulated contract to spend the given allowance in the given token
    /// @dev Errors with 'SA' if transfer fails
    /// @param token The contract address of the token to be approved
    /// @param to The target of the approval
    /// @param value The amount of the given token the target will be allowed to spend
    function safeApprove(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.approve.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'SA');
    }

    /// @notice Transfers ETH to the recipient address
    /// @dev Fails with `STE`
    /// @param to The destination of the transfer
    /// @param value The value to be transferred
    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, 'STE');
    }
}

contract Barracks is Ownable{

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Events  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    // //  ******************************************************************************

    // event Attack(uint256 attackerLandId, uint256 defenderLandId,uint256[] attackerArmy, uint256[] defenderArmy, bool success);


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Vairables  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    /// @notice Land token id => type of warrior => amount
    mapping (uint256 => mapping(uint256 => uint256)) internal landArmy;
    /// @notice Land id => Barracks level
    /// *** Note that since defaul level is 0 it means barracks has not builed yet.
    /// After each 'buildBararcks' barrack will upgrade to next level and new kind of army will unlock for user.


    struct WarriorInfo {
        uint8 attackPower;
        uint8 defPower;
        uint8 hp;
        uint8 requiredLevel;
        string name;
        uint256 price;
    }

    WarriorInfo[] warriorTypes;
    // address private  townContract;


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    constructor() Ownable(msg.sender){
        warriorTypes.push(WarriorInfo( 60, 90, 140, 1,"Spearman",5 ether));
        warriorTypes.push(WarriorInfo( 90, 70, 200, 2,"Swordsman",8 ether));
        warriorTypes.push(WarriorInfo( 40, 60, 80, 3,"Archer",10 ether));
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
    // modifier onlyTown () {
    //     require(msg.sender == townContract, "Caller should be town contract");
    //     _;
    // }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***********************   External & public functions  ***********************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *********************   Only owner and town functions  ***********************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    // function authorize(address town) external  onlyOwner{
    //     townContract = town;
    // }

    function updateWarriorType_(uint8[3] memory physicalInfo,uint8 requiredLevel/*, string memory imageURL*/, string memory name, uint256 price, uint256 typeIndex) public  onlyOwner{
        warriorTypes[typeIndex] = WarriorInfo( physicalInfo[0], physicalInfo[1], physicalInfo[2], requiredLevel,/* imageURL,*/name,price );
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *****************************   View functions  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    function getArmy(uint256 landId) view public returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](warriorTypes.length);
        for (uint i = 0; i < warriorTypes.length; i++) {
            amounts[i] = landArmy[landId][i];
        }
        return (amounts);
    }

    function getWarriorTypes() view public   returns (WarriorInfo[] memory) {
        return warriorTypes;
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


    function _reduceBatchWarriorByPercent(uint256 remainedPercent, uint256 landId) internal {
        for (uint i = 0; i < warriorTypes.length; i++) {
            if (landArmy[landId][i] > 0) {
                landArmy[landId][i] = (landArmy[landId][i]) * (remainedPercent) / (100) ;
            }
        }
    }
    function _addEnteredBatchWarriorByPercent(uint256[] memory enteredArmy, uint256 percentage, uint256 landId) internal{
        for (uint i = 0; i < warriorTypes.length; i++) {
            if (enteredArmy[i] > 0) {
                landArmy[landId][i] += (enteredArmy[i]) * (percentage) / (100);
            }
        }
    }


    function _addWarrior(uint256 warriorType, uint256 amount, uint256 landId) internal  {
        landArmy[landId][warriorType] += amount;
    }


    function _attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) internal  returns(bool, uint256){
        require(warriorsAmounts.length == warriorTypes.length, "Lengths does not match");
        // uint256 totalArmy;
        uint256 attackerPower;
        uint256 attackerHp;
        uint256 defenderPower;
        uint256 defenderHp;
        uint256[] memory defenderWarriorsAmounts = getArmy(targetId);

        for (uint i = 0; i < warriorsAmounts.length; i++) {
            require(landArmy[attackerId][i] >= warriorsAmounts[i], "Insufficient army");
            // totalArmy += warriorsAmounts[i];
            landArmy[attackerId][i] -= warriorsAmounts[i];

            attackerPower += warriorTypes[i].attackPower * warriorsAmounts[i];
            attackerHp += warriorTypes[i].hp * warriorsAmounts[i];
            defenderPower += warriorTypes[i].defPower * defenderWarriorsAmounts[i];
            defenderHp += warriorTypes[i].hp * defenderWarriorsAmounts[i];
        }
        // require(totalArmy > 0, "Army = 0");


        (bool success, uint256 remainedAttackerArmy, uint256 remainedDefenderArmy) = _calculateWar(attackerPower, attackerHp, defenderPower, defenderHp);

        // Updating Army of each user condsidering losses.
        _reduceBatchWarriorByPercent(remainedDefenderArmy, targetId);
        _addEnteredBatchWarriorByPercent(warriorsAmounts, remainedAttackerArmy, attackerId);
        
        // emit Attack(attackerId, targetId, warriorsAmounts, getArmy(targetId),success);
        return (success, remainedAttackerArmy - remainedDefenderArmy );
    }



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


}



contract TownV2 is Ownable, Barracks{

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Errors  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    error CallerIsNotOwner();
    error ClaimBeforeAction();
    error UnAuthorizedToken();
    error InvalidLand();
    error InsufficientCommodity();
    error InsufficientArmy();
    error InvalidItem();
    error MaxCapacity();
    error TimeLimitation();
    error LevelLessThanMin();

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Events  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    event Build( uint256 buildingTypeIndex, uint256 indexed buildingId, uint256 indexed landTokenId);
    event Upgrade( uint256 indexed buildingId, uint256 level);
    event Attack (uint256 indexed attackerLandId, uint256 indexed defenderLandId, bool success , uint256[5] lootAmounts);


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Vairables  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    IERC721 lands;
    IERC20 BKT;


    // address[] private items;

    uint256[5] private baseBararcksRequiredCommodities = [50 ether, 50 ether, 50 ether, 50 ether, 100 ether];
    uint8 private constant maxBuildingsCapacity = 12;
    uint8 private constant baseArmyCapacity = 50;
    uint256 private tokenIdCounter = 1;
    uint256 private constant baseCapacity = 80 ether;

    struct Info {
        uint256 requiredStone;
        uint256 requiredWood;
        uint256 requiredIron;
        uint256 requiredGold;
        uint256 requiredFood;
        uint256 revTokenIndex;
        // string imageURL;
        string buildingName;
    }

    Info[] private buildings;

    struct Status {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 attachedLand;
        uint8 buildingTypeIndex;
    }

    struct LandIdData {
        uint256[5] commoditiesBalance;
        uint256 latestBuildTimeStamp;
        uint256[] buildedBuildings;
        uint256 barracksLevel;
    }

    mapping (uint256 => LandIdData) internal landData;

    mapping (uint256 => Status) private tokenIdStatus;

    /// @notice token ID => landId
    mapping (uint256 => uint256) private belongTo;


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    constructor(address BlockchainsKingdomToken ,address landsContract){
        BKT = IERC20(BlockchainsKingdomToken);
        lands = LandsV2(landsContract);
        buildings.push(Info(0,200 ether,150 ether,0, 25 ether,0/*,"https://ipfs.io/ipfs/QmPNnffNtgiXHhbFFKpzJG6FwgWTRgpWVv7FJza5hK7V7o"*/,"Stone mine"));
        buildings.push(Info(50 ether,50 ether,250 ether,0, 25 ether,1/*,"https://ipfs.io/ipfs/QmU99dxpwMoFAGSoQPLxB6YVAoYSk1iwbDoKj2CuM2pKyB"*/,"Lumber mill"));
        buildings.push(Info(100 ether, 100 ether, 100 ether, 0, 25 ether, 2/*, "Url"*/,"Iron mine"));
        buildings.push(Info( 250 ether, 50 ether, 0, 0, 100 ether, 4/*,"Replace this with image url"*/,"Farm"));
        buildings.push(Info(250 ether, 250 ether, 250 ether, 0, 50 ether, 3/*, "Url"*/,"Gold mine"));
        for (uint i = 0; i<5; i++) 
        {
        landData[101101].commoditiesBalance[i] += 10000 ether;
        landData[109109].commoditiesBalance[i] += 10000 ether;
        }
        landData[101101].barracksLevel = 1;
        landData[109109].barracksLevel = 1;
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Modifiers  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    /// @notice Making sure caller is owner of pointed land in Lands contract.
    modifier onlyLandOwner(uint256 landTokenId) {
        if (lands.ownerOf(landTokenId) != msg.sender) {
            revert CallerIsNotOwner();
        } 
        _;
    }


    /// @notice Making sure caller of token is owner of entered toeknId.
    modifier belongToCaller(uint256 tokenId) {
        if (lands.ownerOf(belongTo[tokenId]) != msg.sender) {
            revert CallerIsNotOwner(); 
        } 
        _;
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***********************   External & public functions  ***********************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    function swapCommodity(uint256 landTokenId, uint256 fromIndex, uint256 toIndex, uint256 amount) external onlyLandOwner(landTokenId) {
        if (landData[landTokenId].commoditiesBalance[fromIndex] < amount) {
            revert InsufficientCommodity();
        }
        landData[landTokenId].commoditiesBalance[fromIndex] -= amount;
        landData[landTokenId].commoditiesBalance[toIndex] += amount * 9 / 10; // Including 10% burn
    }

    function deposit( uint256 landTokenId, uint256 amount, uint256 commodityIndex) external onlyLandOwner(landTokenId){
        TransferHelper.safeTransferFrom(address(BKT),msg.sender,address(this),amount);
        landData[landTokenId].commoditiesBalance[commodityIndex] += amount;
    }
    function splitDeposit(uint256 landTokenId, uint256 amount) external {
        TransferHelper.safeTransferFrom(address(BKT),msg.sender,address(this),amount);
        for (uint i = 0; i < landData[landTokenId].commoditiesBalance.length; i++) {
            landData[landTokenId].commoditiesBalance[i] += amount/5;
        }
    }
    function withdraw(uint256 amount, uint256 landTokenId, uint256 commodityIndex) external onlyLandOwner(landTokenId){
        if (landData[landTokenId].commoditiesBalance[commodityIndex] < amount) {
            revert InsufficientCommodity();
        }
        landData[landTokenId].commoditiesBalance[commodityIndex] -= amount;
        TransferHelper.safeTransfer(address(BKT), msg.sender, amount * 95 /100); // Including 5% withdrawal burn
    }



    function build(uint256 landTokenId, uint8 buildingIndex) external onlyLandOwner(landTokenId){
        if (buildingIndex >= buildings.length) {
            revert InvalidItem();
        }
        if (maxBuildingsCapacity <= landData[landTokenId].buildedBuildings.length) {
            revert MaxCapacity();
        }
        if (getRemainedTimestamp(landTokenId) != 0) {
            revert TimeLimitation();
        }
        Info memory selecteduilding = buildings[buildingIndex];
        require( landData[landTokenId].commoditiesBalance[0] >= selecteduilding.requiredStone && 
        landData[landTokenId].commoditiesBalance[1] >= selecteduilding.requiredWood &&
        landData[landTokenId].commoditiesBalance[2] >= selecteduilding.requiredIron &&
        landData[landTokenId].commoditiesBalance[3] >= selecteduilding.requiredFood &&
        landData[landTokenId].commoditiesBalance[4] >= selecteduilding.requiredGold
        , "Insufficient commodities");
        _spendCommodities(landTokenId, [
            selecteduilding.requiredStone,
            selecteduilding.requiredWood,
            selecteduilding.requiredIron,
            selecteduilding.requiredFood,
            selecteduilding.requiredGold
            ]);
        belongTo[tokenIdCounter] = landTokenId;
        tokenIdStatus[tokenIdCounter] = Status(1, block.timestamp, landTokenId,buildingIndex);
        landData[landTokenId].buildedBuildings.push(tokenIdCounter);
        tokenIdCounter ++;
        landData[landTokenId].latestBuildTimeStamp  = block.timestamp + 6 hours;
        emit Build(buildingIndex, tokenIdCounter-1, landTokenId);
    }


    function upgrade(uint256 buildingTokenId, uint256 landTokenId) external belongToCaller(buildingTokenId){
        if (getRemainedTimestamp(landTokenId) != 0) {
            revert TimeLimitation();
        }
        claimRevenue(buildingTokenId);
        uint256 typeIndex = tokenIdStatus[buildingTokenId].buildingTypeIndex;
        uint256 currentLevel = tokenIdStatus[buildingTokenId].level;
        Info memory selecteduilding = buildings[typeIndex];
        require( landData[landTokenId].commoditiesBalance[0]  >= selecteduilding.requiredStone * (currentLevel+1) && 
        landData[landTokenId].commoditiesBalance[1]  >= selecteduilding.requiredWood * (currentLevel+1) &&
        landData[landTokenId].commoditiesBalance[2]  >= selecteduilding.requiredIron * (currentLevel+1) &&
        landData[landTokenId].commoditiesBalance[3]  >= selecteduilding.requiredGold * (currentLevel+1) &&
        landData[landTokenId].commoditiesBalance[4]  >= selecteduilding.requiredFood * (currentLevel+1)
        , "Insufficient commodities");
        _spendCommodities(landTokenId, [
            selecteduilding.requiredStone * (currentLevel+1),
            selecteduilding.requiredWood * (currentLevel+1),
            selecteduilding.requiredIron * (currentLevel+1),
            selecteduilding.requiredGold * (currentLevel+1),
            selecteduilding.requiredFood * (currentLevel+1)

            ]);
        tokenIdStatus[buildingTokenId].level = currentLevel+1 ;
        landData[landTokenId].latestBuildTimeStamp  = block.timestamp + (6 hours * (currentLevel+1));
        emit Upgrade(buildingTokenId, currentLevel+1);
    }

    function buildBarracks(uint256 landTokenId) public onlyLandOwner(landTokenId) onlyLandOwner(landTokenId){
        if (getRemainedTimestamp(landTokenId) != 0) {
            revert TimeLimitation();
        }
        uint256[5] memory balArray = getAssetsBal(landTokenId);
        require(balArray[0] >= baseBararcksRequiredCommodities[0] &&
        balArray[1] >= baseBararcksRequiredCommodities[1] && 
        balArray[2] >= baseBararcksRequiredCommodities[2] &&
        balArray[3] >= baseBararcksRequiredCommodities[3] &&
        balArray[4] >= baseBararcksRequiredCommodities[4] 
        , "Insufficient commodities");
        _spendCommodities(landTokenId,baseBararcksRequiredCommodities);
        landData[landTokenId].latestBuildTimeStamp  = block.timestamp + (6 hours * (landData[landTokenId].barracksLevel+1));
        landData[landTokenId].barracksLevel ++;
    }

    function recruit(uint256 landTokenId, uint256 typeIndex, uint256 amount) external onlyLandOwner(landTokenId){
        if (typeIndex >= getWarriorTypes().length) {
            revert InvalidItem();
        }
        if (getWarriorTypes()[typeIndex].requiredLevel > landData[landTokenId].barracksLevel) {
            revert LevelLessThanMin();
        }
        if (getWarriorTypes()[typeIndex].price * amount > getAssetsBal(landTokenId)[4]) {
            revert InsufficientCommodity();
        }
        uint256[] memory currentWarriors = getArmy(landTokenId);
        uint256 currentArmy;
        for (uint i = 0; i < currentWarriors.length; i++) {
            currentArmy += currentWarriors[i];
        }
        if (landData[landTokenId].barracksLevel * baseArmyCapacity < currentArmy + amount) {
            revert MaxCapacity();
        }

        _spendCommodities(landTokenId,[0,0,0,0,getWarriorTypes()[typeIndex].price * amount]);
        _addWarrior(typeIndex, amount, landTokenId);
    }



    function claimRevenue(uint256 buildingTokenId) public belongToCaller(buildingTokenId){
        Status memory buildingStatus = getStatus(buildingTokenId);
        Info memory selecteduildingInfo = buildings[buildingStatus.buildingTypeIndex];
        uint256 revenueAmount = getCurrentRevenue(buildingTokenId);
        tokenIdStatus[buildingTokenId].latestActionTimestamp = block.timestamp;
        landData[tokenIdStatus[buildingTokenId].attachedLand].commoditiesBalance[selecteduildingInfo.revTokenIndex] += revenueAmount ;
    }

    function attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external onlyLandOwner(attackerId) {
        require(lands.ownerOf(targetId) != address(0), "Invalid land");
        (bool success, uint256 winRate) = _attack(warriorsAmounts, attackerId, targetId);
        uint256 [5] memory lootAmounts;
        if (success) {
            lootAmounts = _loot(attackerId, targetId, winRate);
        }
        emit Attack(attackerId, targetId, success, lootAmounts);
    }


    // function transferCommodity(uint256 commodityIndex, uint256 amount, uint256 fromId, uint256 toId) external landOwner(fromId){
    //     require(landData[fromId].commoditiesBalance[commodityIndex] >= amount, "Insufficient balance");
    //     landData[fromId].commoditiesBalance[commodityIndex] -= amount;
    //     landData[toId].commoditiesBalance[commodityIndex] += amount * (100-transferCost) / 100;
    // }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  **************************   Only owner functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    // function updateBuilding(uint256 index, uint256[5] memory requiredCommodities/*, string memory imgUrl*/, string memory name) external onlyOwner {
    //     buildings[index] = (Info(
    //         requiredCommodities[0],
    //         requiredCommodities[1],
    //         requiredCommodities[2],
    //         requiredCommodities[3],
    //         requiredCommodities[4],
    //         index,
    //         // imgUrl,
    //         name
    //     ));
    // }

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *****************************   View functions  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function getCurrentRevenue(uint256 buildingTokenId) public view returns(uint256) {
        Status memory buildingStatus = getStatus(buildingTokenId);
        uint256 period = block.timestamp - (buildingStatus.latestActionTimestamp);
        uint256 rev = (period / 3 hours) * buildingStatus.level * 1 ether;
        if (rev > baseCapacity * buildingStatus.level ) {
            rev = baseCapacity * buildingStatus.level ;
        }
        return rev;
    }

    function getStatus(uint256 tokenId) public view returns(Status memory){
        return tokenIdStatus[tokenId];
    }

    function getBuildings() view public returns (Info[] memory) {
        return buildings;
    }

    function getLandIdData(uint256 landTokenId) external view returns(LandIdData memory) {
        return (landData[landTokenId]);
    }

    function getRemainedTimestamp(uint256 landTokenId) view public returns (uint256) {
        uint256 remainedTimestamp;
        if (landData[landTokenId].latestBuildTimeStamp > block.timestamp ) {
            remainedTimestamp = (landData[landTokenId].latestBuildTimeStamp - block.timestamp)/ 1 minutes;
        }
        return remainedTimestamp;
    }
    function getAssetsBal(uint256 landTokenId) view public returns (uint256[5] memory) {
        uint256[5] memory balancesArray;
        for (uint i = 0; i < 5; i++) {
            uint256 thisIndexBalance = landData[landTokenId].commoditiesBalance[i];
            balancesArray[i] = thisIndexBalance;
        }
        return balancesArray;
    }



    function getBarracksRequiredCommodities() view public returns (uint256[5] memory) {
        return baseBararcksRequiredCommodities;
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***************************   Internal functions  ****************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function _spendCommodities(uint256 landTokenId,
        uint256[5] memory amounts
        ) internal {
            // require(amounts.length == 5, "Length does not match");
            for (uint i = 0; i < 5; i++) {
                landData[landTokenId].commoditiesBalance[i] -= amounts[i];
            }
            // balances[landTokenId][assetAddress] -= amount;

    }

    function _loot(uint256 attackerLandId, uint256 targetLandId, uint256 lootPercentage) internal returns(uint256[5] memory lootAmounts) {
        for (uint i = 0; i < 5; i++) {
            // uint256 lootAmount = commoditiesBalance[targetLandId][_convertIndexToAddress(i)] * lootPercentage / 100;
            uint256 lootAmount = landData[targetLandId].commoditiesBalance[i] * lootPercentage / 100;
            lootAmounts[i] = lootAmount;
            landData[targetLandId].commoditiesBalance[i] -= lootAmount;
            landData[attackerLandId].commoditiesBalance[i] += lootAmount * 85 / 100; // We have considered 15% of loot to burn as damage of war in order to resemble real war. On the other hand, keeping the value of the token by burning.
        } 
    }




}
