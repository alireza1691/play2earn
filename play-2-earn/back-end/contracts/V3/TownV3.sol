//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// import { LandsV2 } from "./LandsV2.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/interfaces/IERC721.sol";
import {Vars} from "./Vars.sol";
interface ILands is IERC721 {
    function mintLand(uint8 x, uint8 y) external ;
    function getPrice() pure external returns (uint256); 
    function URI() pure external returns (uint256); 
    function tokenURI(uint256 _tokenId) pure external returns (uint256); 
}   
// interface IHeroes is IERC721 {
//     function getHero(uint256) external view returns(uint256[] memory);
// }
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
library Utils {
    function calculateWar(uint256 attackerPower, uint256 attackerHp, uint256 defenderPower, uint256 defenderHp) pure internal  returns ( bool, uint256, uint256 ) {
        
        // Calculate the percentage of loss for attacker and target
        uint256 attackerRemainedArmyPercent;
        uint256 targetRemainedArmyPercent;
        bool attackSuccess;
        // Compare attacker power with target power to determine the result
        if ( defenderHp >  attackerPower && attackerHp > defenderPower ) {
            if (attackerHp - defenderPower > defenderHp -  attackerPower) {
                attackSuccess = true;
                attackerRemainedArmyPercent = (attackerHp - (defenderPower/3))*100 / attackerHp;
                targetRemainedArmyPercent = (defenderHp - (attackerPower/2)) *100 / defenderHp;
            } else {
                attackSuccess = false;
                attackerRemainedArmyPercent = (attackerHp - (defenderPower/2))*100 / attackerHp;
                targetRemainedArmyPercent = ((defenderHp - (attackerPower/3)) *100) / defenderHp;

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
    function calculateDistance(uint256 fromTokenId, uint256 toTokenId, uint speed) internal  pure returns (uint distance, uint estimatedTime) {
        (uint256 fromX, uint256 fromY) = separateCoordinates(fromTokenId) ;
        (uint256 toX, uint256 toY) = separateCoordinates(toTokenId) ;
        speed = 5;
        // Calculate the Euclidean distance between the two coordinates using the Pythagorean theorem
        uint deltaX = toX > fromX ? toX - fromX : fromX - toX;
        uint deltaY = toY > fromY ? toY - fromY : fromY - toY;
        distance = sqrt(deltaX**2 + deltaY**2);

        // Estimate the time based on the predefined speed (distance / speed)
        estimatedTime = distance*100 / speed;

        return (distance, estimatedTime);
    }
    function separateCoordinates(uint256 tokenId) internal pure returns (uint256, uint256) {
        return (tokenId / 100, tokenId % 100);
    }

    function sqrt(uint x) internal  pure returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}

contract Barracks is Ownable{

    Vars VAR;

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

        // IHeroes HEROES;

    /// @notice Land token id => type of warrior => amount
    mapping (uint256 => mapping(uint256 => uint256)) internal landArmy;
    /// @notice Land id => Barracks level
    /// *** Note that since defaul level is 0 it means barracks has not builed yet.
    /// After each 'buildBararcks' barrack will upgrade to next level and new kind of army will unlock for user.

    /// @notice Land Id => Hero token ID
    mapping (uint256 => uint256) private attachedHero;
    mapping (uint256 => DispatchedArmy[]) internal dispatchedArmies;
    
  struct DispatchedArmy {
        uint256[] amounts;
        uint256 totalArmyAmount;
        uint256 totalPower;
        uint256 totalHp;
        uint256 remainedTime;
        uint256 target;
        uint256[2] lootedAmounts;
        bool isReturning;
        uint256 remainedArmybyPercent;
    }

    // struct WarriorInfo {
    //     uint8 attackPower;
    //     uint8 defPower;
    //     uint8 hp;
    //     string name;
    //     uint256 price;
    // }

  
    // WarriorInfo[] warriorTypes;
    // address private  townContract;


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    constructor(/*address heroesContract*/ address varsAddress) Ownable(msg.sender){
        VAR = Vars(varsAddress);
        // HEROES = IHeroes(heroesContract);
        // warriorTypes.push(WarriorInfo( 45, 30, 70, "Maceman",7 ether));
        // warriorTypes.push(WarriorInfo( 20, 60, 70, "Spearman",8 ether));
        // warriorTypes.push(WarriorInfo( 60, 70, 90,"Swordsman",15 ether));
        // warriorTypes.push(WarriorInfo( 50, 50, 70,"Archer",10 ether));
        // warriorTypes.push(WarriorInfo( 45, 80, 110,"Shieldman",22 ether));
        // warriorTypes.push(WarriorInfo( 90, 60, 100,"Knight",30 ether));
    }




    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Modifiers  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    modifier existItem (uint256 typeIndex) {
        require(typeIndex < warriorTypes().length , "No defined");
        _;
    }


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
    //  *****************************   View functions  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

   
    function warriorTypes() view public   returns (Vars.WarriorInfo[] memory) {
        
        return VAR.WarriorTypes();
    }
    function getArmyInfo(uint256 landTokenId) view public returns (uint256 attPower , uint256 defPower,uint256 hp, uint256 totalArmy) {
        for (uint i = 0; i < warriorTypes().length; i++) {
            attPower +=warriorTypes()[i].attackPower * landArmy[landTokenId][i];
            defPower += warriorTypes()[i].defPower * landArmy[landTokenId][i];
            hp += warriorTypes()[i].hp * landArmy[landTokenId][i];
            totalArmy += landArmy[landTokenId][i];
        }
    }
    function getArmy(uint256 landTokenId) view public returns (uint256[6] memory amounts) {
        for (uint i = 0; i < warriorTypes().length; i++) {
            amounts[i] = landArmy[landTokenId][i];
        }
        return amounts;
    }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ****************************   Internal functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    // function _attachHero(uint256 landId, uint256 heroId) internal{
    //     require(HEROES.ownerOf(heroId) == msg.sender, "caller is not hero owner");
    //     attachedHero[landId] = heroId;
    // }

    function _reduceBatchWarriorByPercent(uint256 remainedPercent, uint256 landId) internal {
        for (uint i = 0; i < warriorTypes().length; i++) {
            if (landArmy[landId][i] > 0) {
                landArmy[landId][i] = (landArmy[landId][i]) * (remainedPercent) / (100) ;
            }
        }
    }
    function _addEnteredBatchWarriorByPercent(uint256[] memory enteredArmy, uint256 percentage, uint256 landId) internal{
        for (uint i = 0; i < warriorTypes().length; i++) {
            if (enteredArmy[i] > 0) {
                landArmy[landId][i] += (enteredArmy[i]) * (percentage) / (100);
            }
        }
    }


    function _addWarrior(uint256 warriorType, uint256 amount, uint256 landId) internal  {
        landArmy[landId][warriorType] += amount;
    }


    function _attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId, uint256 wallsLevel) internal  returns(bool, uint256){
        require(warriorsAmounts.length == warriorTypes().length, "Lengths does not match");
        uint256 attackerPower;
        uint256 attackerHp;
        (,uint256 defenderPower, uint256 defenderHp,) = getArmyInfo(targetId);
        defenderPower += defenderPower * (wallsLevel * 5 /100);

        (bool success, uint256 remainedAttackerArmy, uint256 remainedDefenderArmy) = Utils.calculateWar(attackerPower, attackerHp, defenderPower, defenderHp);

        // Updating Army of each user condsidering losses.
        _reduceBatchWarriorByPercent(remainedDefenderArmy, targetId);
        _addEnteredBatchWarriorByPercent(warriorsAmounts, remainedAttackerArmy, attackerId);
        
        // emit Attack(attackerId, targetId, warriorsAmounts, getArmy(targetId),success);
        return (success, remainedAttackerArmy - remainedDefenderArmy );
    }

    // function test(uint256[] memory amounts, uint256[] memory amounts2) view public returns (bool, uint256, uint256) {
    //     require(amounts.length == warriorTypes.length && amounts2.length == warriorTypes.length , "");
    //     uint256 attPw;
    //     uint256 hp1;
    //     uint256 defPw;
    //     uint256 hp2;
    //     for (uint i = 0; i < warriorTypes.length; i++) {
    //         attPw += warriorTypes[i].attackPower * amounts[i];
    //         hp1 += warriorTypes[i].hp * amounts[i];
    //         defPw += warriorTypes[i].defPower * amounts2[i];
    //         hp2 += warriorTypes[i].hp * amounts2[i];
    //     }
    //     return _calculateWar(attPw, hp1, defPw, hp2);
    // }



}



contract Town is Barracks{

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
    error InsufficientBalance();
    error InsufficientGoods();
    error InsufficientArmy();
    error InvalidItem();
    error MaxCapacity();
    error WorkerIsBusy();
    error BarracksLevelLowerThanWarrior();
    error AlreadyFinished();
    error TownhallUpgradeRequired();

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Events  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    event Deposit(address indexed accountAddress,uint256 tokenAmount);
    event Withdraw(address indexed accountAddress,uint256 tokenAmount);
    event Build( uint256 buildingTypeIndex, uint256 indexed buildingId, uint256 indexed landTokenId );
    event Upgrade( uint256 indexed buildingId, uint256 level );
    event UpgradeBarracks( uint256 indexed landTokenId, uint256 currentLevel );
    event UpgradeWalls(uint256 indexed landTokenId, uint256 currentLevel );
    event UpgradeTownhall(uint256 indexed landTokenId, uint256 currentLevel );
    event UpgradeTrainingCamp(uint256 indexed landTokenId, uint256 currentLevel );
    event UpgradeWarehouse(uint256 indexed landTokenId, uint256 currentLevel );
    event Attack( uint256 indexed attackerLandId, uint256 indexed defenderLandId, bool indexed success , uint256[2] lootAmounts);
    event GoodsProduction( uint256[2] amounts, uint256 indexed landId );
    event GoodsConsumption( uint256[2] amounts, uint256 indexed landId );
    event RecruitWarrior( uint256[] typesAmount, uint256 indexed landId );
    event WarriorLosses( uint256[] typesAmount, uint256 indexed landId );
    

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Interfaces  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    ILands LANDS;
    IERC20 BMT;



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Vairables  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************




    uint256[2] private BaseBararcksRequiredGoods = [ 150 ether, 200 ether];
    uint256[2] private BaseWallRequiredGoods = [ 50 ether, 175 ether];
    uint256[2] private BaseTownhallRequiredGoods = [ 300 ether, 300 ether];
    uint256[2] private BaseTrainingCampRequiredGoods = [ 200 ether, 50 ether];
    uint256[2] private BaseWarehouseRequiredGoods = [ 150 ether, 125 ether];
    uint256 private constant WithdrawalFee = 10;
    uint256 private constant SwapFee = 5;
    uint256 private constant TrnasferCostPercentage = 5;
    // uint256 private constant WorkerGoldPerHour = 10 ether;
    // uint256 private constant BaseBuildTimestamp = 3 hours;
    // uint256 private constant BaseTownhallBuildTimestamp = 6 hours;
    // uint8 private constant MaxResourceBuildingsCapacity = 8;
    // uint8 private constant BaseArmyCapacity = 50;
    // uint256 private constant BaseGoodCapacityOfBuilding = 80 ether;
    // uint256 private constant BaseWarriorRequiredFood = 3 ether;
    // uint256 private constant BaseFoodRevenuePer3hours = 1 ether;
    // uint256 private constant BaseGoldRevenuePer3hours = 1 ether;

    uint256 private tokenIdCounter = 1;
    uint256[2] private totalExistedGood;
  

    struct ResourceBuildingInfo {
        uint256 requiredFood;
        uint256 requiredGold;
        uint256 revTokenIndex;
        string buildingName;
    }

    ResourceBuildingInfo[] private resourceBuildings;

    struct ResourceBuildingStatus {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 attachedLand;
        uint8 buildingTypeIndex;
    }

    struct LandIdData {
        uint256[2] goodsBalance;
        uint256 latestBuildTimeStamp;
        uint256[] buildedResourceBuildings;
        uint256 barracksLevel;
        uint256 wallLevel;
        uint256 townhallLevel;
        uint256 trainingCampLevel;
    }

    mapping (uint256 => LandIdData) internal landData;

    mapping (uint256 => ResourceBuildingStatus) private tokenIdStatus;

    /// @notice Token ID => Land ID
    mapping (uint256 => uint256) private belongTo;

    mapping (address => uint256) private BMTBalance;


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    constructor(address BlockchainsKingdomToken ,address landsAddress, address varsAddress/*, address heroes*/) Barracks(varsAddress){
        // VAR = Vars(varsAddress);
        BMT = IERC20(BlockchainsKingdomToken);
        LANDS = ILands(landsAddress);
        resourceBuildings.push(ResourceBuildingInfo( 75 ether, 125 ether, 0,"Farm"));
        resourceBuildings.push(ResourceBuildingInfo( 125 ether, 75 ether, 1,"Gold mine"));
        for (uint i = 0; i<2; i++) 
        {
        landData[101101].goodsBalance[i] += 10000 ether;
        landData[105105].goodsBalance[i] += 10000 ether;
        landData[109109].goodsBalance[i] += 10000 ether;
        }
        landData[101101].barracksLevel = 2;
        landData[105105].barracksLevel = 2;
        landData[109109].barracksLevel = 2;
         landData[101101].townhallLevel = 2;
        landData[105105].townhallLevel = 2;
        landData[109109].townhallLevel = 2;
         landData[101101].trainingCampLevel = 2;
        landData[105105].trainingCampLevel = 2;
        landData[109109].trainingCampLevel = 2;
        landData[101101].wallLevel = 2;
        landData[105105].wallLevel = 2;
        landData[109109].wallLevel = 2;
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
        if (LANDS.ownerOf(landTokenId) != msg.sender) {
            revert CallerIsNotOwner();
        } 
        _;
    }


    /// @notice Making sure caller of token is owner of entered toeknId.
    modifier belongToCaller(uint256 tokenId) {
        if (LANDS.ownerOf(belongTo[tokenId]) != msg.sender) {
            revert CallerIsNotOwner(); 
        } 
        _;
    }

    modifier typeLimit (uint256 landId, uint256 typeIndex) {
        uint256[] memory buildedBuildings = landData[landId].buildedResourceBuildings;
        uint256 count;
        for (uint i = 0; i < buildedBuildings.length; i++) {
           uint256 buildingType = tokenIdStatus[buildedBuildings[i]].buildingTypeIndex;
           if (buildingType == typeIndex) {
            count ++;
           }
        }
        if (count + 1 > VAR.MaxResourceBuildingsCapacity() / 2) {
            revert MaxCapacity();
        }
        if (count + 1 > landData[landId].townhallLevel + 2) {
            revert TownhallUpgradeRequired();
        }
        _;
    }

    modifier isWorkerReady (uint256 landTokenId){
     if (getRemainedBuildTimestamp(landTokenId) != 0) {
            revert WorkerIsBusy();
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


    function deposit(uint256 amount) external {
        TransferHelper.safeTransferFrom(address(BMT),msg.sender,address(this),amount);
        BMTBalance[msg.sender] += amount;
        emit Deposit( msg.sender, amount);
    }

    function buyGood( uint256 landTokenId, uint256 goodIndex, uint256 amount) external onlyLandOwner(landTokenId){
        if (BMTBalance[msg.sender] < amount) {
            revert InsufficientBalance();
        }
        if (goodIndex > 1) {
            revert InvalidItem();
        }
        uint256 goodAmount = (amount * 1 ether/ getGoodsPrice()[goodIndex]) ;

        BMTBalance[msg.sender] -= amount;
        landData[landTokenId].goodsBalance[goodIndex] += goodAmount;
        // totalExistedGood[goodIndex] += goodAmount;
           // Add relevant emit
    }


    function swapGoods(uint256 landTokenId, uint256 fromIndex, uint256 amountIn) external onlyLandOwner(landTokenId) {
        if (landData[landTokenId].goodsBalance[fromIndex] < amountIn) {
            revert InsufficientGoods();
        }
        landData[landTokenId].goodsBalance[fromIndex] -= amountIn;
        uint256 toIndex = fromIndex == 0 ? 1 : 0;
        uint256[2] memory prices = getGoodsPrice();
        uint256 amountOut = (amountIn * prices[fromIndex]) /(prices[toIndex] * 1 ether);
        landData[landTokenId].goodsBalance[toIndex] += amountOut * (100-SwapFee) / 100; // Including 10% burn
        totalExistedGood[fromIndex] -= amountOut;
        totalExistedGood[toIndex] += amountOut;
        uint256[2] memory amounts;
        amounts[toIndex] = amountOut * SwapFee / 100;
        emit GoodsConsumption(amounts,landTokenId );
    }


    function sellGood( uint256 landTokenId, uint256 goodIndex, uint256 amount) external {
        uint256 totalAmount;
                if (landData[landTokenId].goodsBalance[goodIndex] <= amount) {
                    revert InsufficientGoods();
                } else {
                    totalAmount += (amount * getGoodsPrice()[goodIndex])/ 1 ether;
                    landData[landTokenId].goodsBalance[goodIndex] -= amount;
                    totalExistedGood[goodIndex] -= amount;
                }
        BMTBalance[msg.sender] += totalAmount*(100- SwapFee)/100;
           // Add relevant emit
    }

    function transferGoods(uint256 goodIndex, uint256 amount, uint256 fromId, uint256 toId) external onlyLandOwner(fromId){
        require(landData[fromId].goodsBalance[goodIndex] >= amount, "Insufficient balance");
        landData[fromId].goodsBalance[goodIndex] -= amount;
        landData[toId].goodsBalance[goodIndex] += amount * (100-TrnasferCostPercentage) / 100;
        uint256[2] memory amounts;
        amounts[goodIndex] = amount * TrnasferCostPercentage / 100;
        emit GoodsConsumption(amounts, toId);
    }


    function withdraw(uint256 amount) external {
        if (BMTBalance[msg.sender] < amount) {
            revert InsufficientGoods();
        }
        BMTBalance[msg.sender] -= amount;
        TransferHelper.safeTransfer(address(BMT), msg.sender, amount * (100 - WithdrawalFee) /100); // Including 5% withdrawal burn
        emit Withdraw( msg.sender, amount);
    }



    function buildResourceBuilding(uint256 landTokenId, uint8 buildingIndex) external onlyLandOwner(landTokenId) typeLimit(landTokenId, buildingIndex) isWorkerReady(landTokenId){
        if (buildingIndex >= resourceBuildings.length ) {
            revert InvalidItem();
        }
        ResourceBuildingInfo memory selecteduilding = resourceBuildings[buildingIndex];
        _spendGoods(landTokenId, [
            selecteduilding.requiredFood,
            selecteduilding.requiredGold
        ]);
        belongTo[tokenIdCounter] = landTokenId;
        tokenIdStatus[tokenIdCounter] = ResourceBuildingStatus(1, block.timestamp, landTokenId,buildingIndex);
        landData[landTokenId].buildedResourceBuildings.push(tokenIdCounter);
        tokenIdCounter ++;
        landData[landTokenId].latestBuildTimeStamp  = block.timestamp + 6 hours;
        emit Build(buildingIndex, tokenIdCounter-1, landTokenId);
    }


    function upgradeResourceBuilding(uint256 buildingTokenId, uint256 landTokenId) external belongToCaller(buildingTokenId) isWorkerReady(landTokenId) {
        if (belongTo[buildingTokenId] != landTokenId ) {
            revert InvalidItem();
        }
        claimRevenue(buildingTokenId);
        uint256 typeIndex = tokenIdStatus[buildingTokenId].buildingTypeIndex;
        uint256 currentLevel = tokenIdStatus[buildingTokenId].level;
        ResourceBuildingInfo memory selecteduilding = resourceBuildings[typeIndex];

        _spendGoods(landTokenId, [
            selecteduilding.requiredGold * (2 ** currentLevel),
            selecteduilding.requiredFood * (2 ** currentLevel)
        ]);
        tokenIdStatus[buildingTokenId].level = currentLevel+1 ;
        landData[landTokenId].latestBuildTimeStamp  = block.timestamp + (VAR.BaseBuildTimestamp() * (currentLevel+1));
        emit Upgrade(buildingTokenId, currentLevel+1);
    }

    function buildBarracks(uint256 landTokenId) public onlyLandOwner(landTokenId) isWorkerReady(landTokenId){
        LandIdData storage landProps = landData[landTokenId];
        if (landProps.townhallLevel < landProps.barracksLevel+1) {
            revert TownhallUpgradeRequired();
        }
        _spendGoods(landTokenId,getRequiredGoods(BaseBararcksRequiredGoods,landProps.barracksLevel));
        landProps.latestBuildTimeStamp  = block.timestamp + (VAR.BaseBuildTimestamp() * (landProps.barracksLevel + 1));
        landProps.barracksLevel ++;
        emit UpgradeBarracks( landTokenId, landProps.barracksLevel + 1 );
    }
     function buildTownhall(uint256 landTokenId) public onlyLandOwner(landTokenId) isWorkerReady(landTokenId){
        LandIdData storage landProps = landData[landTokenId];
        _spendGoods(landTokenId,getRequiredGoods(BaseTownhallRequiredGoods,landProps.townhallLevel));
        landProps.latestBuildTimeStamp  = block.timestamp + (VAR.BaseTownhallBuildTimestamp() * (landProps.townhallLevel + 1));
        landProps.townhallLevel ++;
        emit UpgradeTownhall( landTokenId, landProps.townhallLevel + 1 );
    }

    function buildWalls(uint256 landTokenId) public onlyLandOwner(landTokenId) isWorkerReady(landTokenId) {
        LandIdData storage landProps = landData[landTokenId];
        if (landProps.townhallLevel < landProps.wallLevel +1) {
            revert TownhallUpgradeRequired();
        }
        _spendGoods(landTokenId,getRequiredGoods(BaseWallRequiredGoods, landProps.wallLevel));
 
        landProps.latestBuildTimeStamp  = block.timestamp + (VAR.BaseBuildTimestamp() * (landProps.wallLevel + 1));
        landProps.wallLevel ++;
        emit UpgradeWalls( landTokenId, landProps.wallLevel + 1 );
    }
    function buildTrainingCamp(uint256 landTokenId) public onlyLandOwner(landTokenId) isWorkerReady(landTokenId) {
        LandIdData storage landProps = landData[landTokenId];
        if (landProps.townhallLevel < landProps.trainingCampLevel +1) {
            revert TownhallUpgradeRequired();
        }
        _spendGoods(landTokenId,getRequiredGoods(BaseTrainingCampRequiredGoods, landProps.trainingCampLevel));
 
        landProps.latestBuildTimeStamp  = block.timestamp + (VAR.BaseBuildTimestamp() * (landProps.trainingCampLevel + 1));
        landProps.trainingCampLevel ++;
        emit UpgradeTrainingCamp( landTokenId, landProps.trainingCampLevel + 1 );
    }


    function finishNow(uint256 landTokenId) external onlyLandOwner(landTokenId){
        uint256 remainedTimestamp;
        uint256 requiredGold;
        if (landData[landTokenId].latestBuildTimeStamp > block.timestamp) {
            remainedTimestamp = landData[landTokenId].latestBuildTimeStamp - block.timestamp;
            requiredGold = (remainedTimestamp / 1 hours) * VAR.WorkerGoldPerHour();
            if (landData[landTokenId].goodsBalance[0] >= requiredGold) {
                landData[landTokenId].goodsBalance[1] -= requiredGold;
                landData[landTokenId].latestBuildTimeStamp = block.timestamp - 1 minutes;
                totalExistedGood[1] -= requiredGold;
            } else {
                revert InsufficientGoods(); 
            }
        } else {
            revert AlreadyFinished();
        }
        emit GoodsConsumption( [0,requiredGold], landTokenId);

    }

    // function recruit(uint256 landTokenId, uint256 typeIndex, uint256 amount) external onlyLandOwner(landTokenId){
    //     if (typeIndex >= warriorTypes().length) {
    //         revert InvalidItem();
    //     }
    //     if (typeIndex + 1 > landData[landTokenId].barracksLevel) {
    //         revert BarracksLevelLowerThanWarrior();
    //     }
    //     (,,,uint256 currentArmy) = getArmyInfo(landTokenId);

    //     if ((landData[landTokenId].trainingCampLevel > 0 ?(landData[landTokenId].trainingCampLevel * VAR.BaseArmyCapacity()) : 10) < currentArmy + amount) {
    //         revert MaxCapacity();
    //     }

    //     _spendGoods(landTokenId,[ VAR.BaseWarriorRequiredFood() * amount * (typeIndex == 5 ? 2 : 1), warriorTypes()[typeIndex].price * amount]);
    //     _addWarrior(typeIndex, amount, landTokenId);
    //     emit GoodsConsumption( [VAR.BaseWarriorRequiredFood() * amount, warriorTypes()[typeIndex].price * amount], landTokenId);
    // }

    function recruit(uint256 landTokenId,uint256[6] memory amounts) external onlyLandOwner(landTokenId){
        uint256 totalAmount;
        uint256 totalPrice;
        uint256 totalFood;
        for (uint i = 0; i < amounts.length; i++) {
            uint256 requiredBarracksLevel = i + 1;
            if (amounts[i] > 0 && landData[landTokenId].barracksLevel < requiredBarracksLevel) {
                revert BarracksLevelLowerThanWarrior();
            }
            totalAmount += amounts[i];
            totalPrice += warriorTypes()[i].price * amounts[i];
            totalFood += VAR.BaseWarriorRequiredFood() * totalAmount * (i == 5 ? 2 : 1);
            _addWarrior(i, amounts[i], landTokenId); 
        }
        (,,,uint256 currentArmy) = getArmyInfo(landTokenId);
        if ((landData[landTokenId].trainingCampLevel > 0 ?(landData[landTokenId].trainingCampLevel * VAR.BaseArmyCapacity()) : 10) < currentArmy + totalAmount) {
            revert MaxCapacity();
        }
        _spendGoods(landTokenId,[ totalFood, totalPrice]);

    }



    function claimRevenue(uint256 buildingTokenId) public belongToCaller(buildingTokenId){
        ResourceBuildingStatus memory buildingStatus = getStatus(buildingTokenId);
        ResourceBuildingInfo memory selecteduildingInfo = resourceBuildings[buildingStatus.buildingTypeIndex];
        uint256 revenueAmount = getCurrentRevenue(buildingTokenId);
        uint256[2] memory amounts;
        amounts[buildingStatus.buildingTypeIndex] += revenueAmount;
        landData[tokenIdStatus[buildingTokenId].attachedLand].goodsBalance[selecteduildingInfo.revTokenIndex] += revenueAmount ;
        totalExistedGood[buildingStatus.buildingTypeIndex] += revenueAmount;
        emit GoodsProduction(amounts , belongTo[buildingTokenId]);
    }
    function claimAll(uint256 landTokenId) public onlyLandOwner(landTokenId){
        uint256[] memory landBuildings = landData[landTokenId].buildedResourceBuildings;
        uint256[2] memory amounts;
        for (uint i = 0; i < resourceBuildings.length; i++) {
            uint256 typeIndex = getStatus(landBuildings[i]).buildingTypeIndex;
            uint256 currentRevenue = getCurrentRevenue(landBuildings[i]);
            landData[tokenIdStatus[landBuildings[i]].attachedLand].goodsBalance[typeIndex] += currentRevenue ;
            totalExistedGood[typeIndex] += currentRevenue;
            amounts[typeIndex] += currentRevenue;
        }
        emit GoodsProduction(amounts , landTokenId);
    }

    // function attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external onlyLandOwner(attackerId) {

    //     require(LANDS.ownerOf(targetId) != address(0), "");
    //     (bool success, uint256 winRate) = _attack(warriorsAmounts, attackerId, targetId, landData[targetId].wallLevel);
    //     uint256 [2] memory lootAmounts;
    //     if (success) {
    //         lootAmounts = _loot(attackerId, targetId, winRate);
    //     }
    //     emit Attack(attackerId, targetId, success, lootAmounts);
    // }
    function dispatchArmy(uint256[] memory warriorAmounts,uint256 from,  uint256 target) external onlyLandOwner(from) {
        require(warriorAmounts.length == warriorTypes().length, "Lengths does not match");
        (,uint256 remainingTime) =  Utils.calculateDistance(from, target,1);
        (,,,uint256 totalArmy) = getArmyInfo(from);
        _spendGoods(from, [totalArmy,0]);
        uint256 totalArmyAmount;
        uint256 totalPower;
        uint256 totalHp;
        for (uint i = 0; i < warriorAmounts.length; i++) {
            if (warriorAmounts[i] > 0) {
                landArmy[from][i] -= warriorAmounts[i];
            }
            totalArmyAmount += warriorAmounts[i];
            totalPower += warriorTypes()[i].attackPower * warriorAmounts[i];
            totalHp += warriorTypes()[i].hp * warriorAmounts[i];
        }
        dispatchedArmies[from].push(DispatchedArmy(warriorAmounts, totalArmyAmount, totalPower, totalHp, block.timestamp+remainingTime, target,[uint256(0),0], false, 100));
    }

    function retreat(uint256 landTokenId ,uint256 dispatchedArmyIndex) external onlyLandOwner(landTokenId) returns(bool, uint256, uint256) {
        DispatchedArmy storage dArmy = dispatchedArmies[landTokenId][dispatchedArmyIndex];
        require(dArmy.isReturning == false, "Army is returning");
        require(dArmy.remainedTime <= block.timestamp , "Not arrived yet");
        uint256 dispatchedArmyAmount ;
        for (uint i = 0; i < dArmy.amounts.length; i++) {
            dispatchedArmyAmount += dArmy.amounts[i];
        }
        uint256 retreatCost = VAR.RetreatCostPerWarrior() * dispatchedArmyAmount;
        require(landData[landTokenId].goodsBalance[1] >= retreatCost);
        landData[landTokenId].goodsBalance[1] -= retreatCost;
        landData[dArmy.target].goodsBalance[1] += retreatCost;
        dArmy.isReturning = true;
        (,uint256 remainingTime) =  Utils.calculateDistance(landTokenId, dArmy.target,1);
        dArmy.remainedTime = block.timestamp + remainingTime;
    }

    function war(uint256 landTokenId ,uint256 dispatchedArmyIndex) external onlyLandOwner(landTokenId) returns(bool, uint256, uint256){
        DispatchedArmy storage dArmy = dispatchedArmies[landTokenId][dispatchedArmyIndex];
        require(dArmy.isReturning == false, "Army is returning");
        require(dArmy.remainedTime <= block.timestamp , "Not arrived yet");

        (,uint256 defenderPower, uint256 defenderHp,) = getArmyInfo(dArmy.target);
        defenderPower += defenderPower * (landData[dArmy.target].wallLevel * 5 /100);
        (bool success, uint256 remainedAttackerArmy, uint256 remainedDefenderArmy) = Utils.calculateWar(dArmy.totalPower, dArmy.totalHp, defenderPower, defenderHp);

        // Updating Army of each user condsidering losses.
        _reduceBatchWarriorByPercent(remainedDefenderArmy, dArmy.target);
        dArmy.isReturning = true;
        dArmy.remainedArmybyPercent =  remainedAttackerArmy;
        (,uint256 remainingTime) =  Utils.calculateDistance(landTokenId, dArmy.target,1);
        dArmy.remainedTime = block.timestamp + remainingTime;
        if (success) {
            uint256 maxLootCapacity = (dArmy.totalArmyAmount * remainedAttackerArmy/ 100) * VAR.BaseWarriorLootCapacity(); 
            uint256[2] memory amounts = _removeDefenderGoods(dArmy.target, remainedAttackerArmy-remainedDefenderArmy,maxLootCapacity);
            dArmy.lootedAmounts = amounts;
        }
  
        emit Attack(landTokenId, dArmy.target,success, dArmy.lootedAmounts);
        return (success, remainedAttackerArmy , remainedDefenderArmy );
    }

    function joinDispatchedArmy(uint256 landTokenId, uint256 dispatchedArmyIndex) external onlyLandOwner(landTokenId){
        DispatchedArmy storage dArmy =  dispatchedArmies[landTokenId][dispatchedArmyIndex];
        require(dArmy.isReturning == true, "Army has not returned");
        require(dArmy.amounts[0] > 0 || dArmy.amounts[1] > 0, "Dispatched Army does not exist");
        _addEnteredBatchWarriorByPercent(dArmy.amounts,dArmy.remainedArmybyPercent, landTokenId);
        landData[landTokenId].goodsBalance[0] += dArmy.lootedAmounts[0];
        landData[landTokenId].goodsBalance[1] += dArmy.lootedAmounts[1];
             for (uint i = 0; i < dArmy.amounts.length ; i++) {
            if (dArmy.amounts[i] > 0) {
                landArmy[landTokenId][i] += dArmy.amounts[i];
            }
    
        }
        dArmy = dispatchedArmies[landTokenId][dispatchedArmies[landTokenId].length - 1];
        dispatchedArmies[landTokenId].pop();
    }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *****************************   View functions  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    function getDispatchedArmies(uint256 landTokenId) view public returns (DispatchedArmy[] memory) {
        return dispatchedArmies[landTokenId] ;
    }
    function getDispatchTime(uint256 from, uint256 to) pure public returns (uint256 distance ,uint256 time) {
       return Utils.calculateDistance(from, to,1);
    }

    function getCurrentRevenue(uint256 buildingTokenId) public view returns(uint256) {
        ResourceBuildingStatus memory buildingStatus = getStatus(buildingTokenId);
        uint256 period = block.timestamp - (buildingStatus.latestActionTimestamp);
        uint256 baseRev = buildingStatus.buildingTypeIndex == 0 ? VAR.BaseFoodRevenuePer3hours() : VAR.BaseGoldRevenuePer3hours() ;
        uint256 rev = (period / 3 hours) * baseRev * (2 ** (buildingStatus.level - 1));
        if (rev > VAR.BaseGoodCapacityOfBuilding() * buildingStatus.level ) {
            rev = VAR.BaseGoodCapacityOfBuilding() * buildingStatus.level ;
        }
        return rev;
       
    }

    function getGoodsPrice() view public returns (uint256[2] memory ) {
        uint256[2] memory prices = [uint256(1 ether), 1 ether]; 
        uint256 sumTotalGoods = totalExistedGood[0] + totalExistedGood[1];
        for (uint i = 0; i < totalExistedGood.length; i++) {
            if (sumTotalGoods < 50000 ether || totalExistedGood[i] < 10000) {
                return [uint256(1 ether), 1 ether];
            }
            prices[i] =  (sumTotalGoods * 1 ether) / (totalExistedGood[i] * 2);
        }
        return prices;
    }

    function getStatus(uint256 tokenId) public view returns(ResourceBuildingStatus memory){
        return tokenIdStatus[tokenId];
    }


    function getLandIdData(uint256 landTokenId) public view returns(LandIdData memory) {
        return (landData[landTokenId]);
    }

    function getRemainedBuildTimestamp(uint256 landTokenId) view public returns (uint256 remainedTimestamp) {
        if (landData[landTokenId].latestBuildTimeStamp > block.timestamp ) {
            remainedTimestamp = (landData[landTokenId].latestBuildTimeStamp - block.timestamp)/ 1 minutes;
        }
    }
    function getRemainedDispatchTimestamp(uint256 landTokenId, uint256 dispatchIndex ) view public returns (uint256 remainedTimestamp) {
        uint256 time = dispatchedArmies[landTokenId][dispatchIndex].remainedTime;
        if (time > block.timestamp) {
            remainedTimestamp = (time - block.timestamp)/ 1 minutes;
        }
    }

    function getBMTbalance(address userAddress) external view returns(uint256) {
        return BMTBalance[userAddress];
    }


    function getRequiredGoods(uint256[2] memory baseAmounts, uint256 currentLevel) pure public returns (uint256[2] memory) {
        uint256[2] memory requiredComs;
         for (uint i = 0; i < baseAmounts.length; i++) 
        {
           requiredComs[i] = baseAmounts[i] * ( 2 ** currentLevel );
        }
        return requiredComs ;
        
    }

 


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***************************   Internal functions  ****************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function _spendGoods(uint256 landTokenId,
        uint256[2] memory amounts
        ) internal {
            for (uint i = 0; i < 2; i++) {
                if (getLandIdData(landTokenId).goodsBalance[i] < amounts[i]) {
                    revert InsufficientBalance();
                }
                landData[landTokenId].goodsBalance[i] -= amounts[i];
                if (totalExistedGood[i] >= amounts[i]) {
                totalExistedGood[i] -= amounts[i]; 
                }
            }
        emit GoodsConsumption( amounts,landTokenId);
    }


    function _removeDefenderGoods(uint256 targetLandId, uint256 lootPercentage, uint256 maxCap) internal returns (uint256[2] memory lootAmounts) {
        for (uint i = 0; i < 2; i++) {
            uint256 lootAmount = landData[targetLandId].goodsBalance[i] * lootPercentage / 100;
            if (lootAmount > maxCap/2) {
                lootAmount = maxCap/2;
            }
            lootAmounts[i] = lootAmount;
            landData[targetLandId].goodsBalance[i] -= lootAmount;
        } 
    }




}
