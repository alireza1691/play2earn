//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// import { LandsV2 } from "./LandsV2.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/interfaces/IERC721.sol";
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

        // IHeroes HEROES;

    /// @notice Land token id => type of warrior => amount
    mapping (uint256 => mapping(uint256 => uint256)) internal landArmy;
    /// @notice Land id => Barracks level
    /// *** Note that since defaul level is 0 it means barracks has not builed yet.
    /// After each 'buildBararcks' barrack will upgrade to next level and new kind of army will unlock for user.

    /// @notice Land Id => Hero token ID
    mapping (uint256 => uint256) private attachedHero;

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


    constructor(/*address heroesContract*/) Ownable(msg.sender){
        // HEROES = IHeroes(heroesContract);
        warriorTypes.push(WarriorInfo( 40, 80, 140, 1,"Spearman",5 ether));
        warriorTypes.push(WarriorInfo( 85, 60, 200, 2,"Swordsman",8 ether));
        warriorTypes.push(WarriorInfo( 70, 80, 90, 3,"Archer",7 ether));
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

    function addWarriorType(uint8[3] memory physicalInfo,uint8 requiredLevel, string memory name, uint256 price) external onlyOwner{
        
    }

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


    function _attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId, uint256 wallsLevel) internal  returns(bool, uint256){
        require(warriorsAmounts.length == warriorTypes.length, "Lengths does not match");
        uint256 attackerPower;
        uint256 attackerHp;
        uint256 defenderPower;
        uint256 defenderHp;
        uint256[] memory defenderWarriorsAmounts = getArmy(targetId);

        for (uint i = 0; i < warriorsAmounts.length; i++) {
            require(landArmy[attackerId][i] >= warriorsAmounts[i], "Insufficient army");
            landArmy[attackerId][i] -= warriorsAmounts[i];

            attackerPower += warriorTypes[i].attackPower * warriorsAmounts[i];
            attackerHp += warriorTypes[i].hp * warriorsAmounts[i];
            defenderPower += warriorTypes[i].defPower * defenderWarriorsAmounts[i];
            defenderHp += warriorTypes[i].hp * defenderWarriorsAmounts[i];
        }
        defenderPower += defenderPower * (wallsLevel * 5 /100);

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



contract TownV3 is Ownable, Barracks{

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
    event Attack( uint256 indexed attackerLandId, uint256 indexed defenderLandId, bool success , uint256[2] lootAmounts);
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




    uint256[2] private BaseBararcksRequiredGoods = [ 250 ether, 250 ether];
    uint256[2] private BaseWallRequiredGoods = [ 50 ether, 200 ether];
    uint8 private constant MaxBuildingsCapacity = 8;
    uint8 private constant BaseArmyCapacity = 50;
    uint256 private constant BaseGoodCapacityOfBuilding = 80 ether;
    uint256 private constant BaseWarriorRequiredFood = 3 ether;
    uint256 private tokenIdCounter = 1;
    uint256[] private totalExistedGood;
    uint256 private constant TrnasferCostPercentage = 5;

    struct Info {
        uint256 requiredFood;
        uint256 requiredGold;
        uint256 revTokenIndex;
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
        uint256[2] goodsBalance;
        uint256 latestBuildTimeStamp;
        uint256[] buildedBuildings;
        uint256 barracksLevel;
        uint256 wallLevel;
    }

    mapping (uint256 => LandIdData) internal landData;

    mapping (uint256 => Status) private tokenIdStatus;

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

    constructor(address BlockchainsKingdomToken ,address landsContract/*, address heroes*/){
        BMT = IERC20(BlockchainsKingdomToken);
        LANDS = ILands(landsContract);
        buildings.push(Info( 250 ether, 100 ether, 0,"Farm"));
        buildings.push(Info( 200 ether, 200 ether, 1,"Gold mine"));
        for (uint i = 0; i<2; i++) 
        {
        landData[101101].goodsBalance[i] += 10000 ether;
        landData[105105].goodsBalance[i] += 10000 ether;
        landData[109109].goodsBalance[i] += 10000 ether;
        }
        landData[101101].barracksLevel = 1;
        landData[105105].barracksLevel = 1;
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
        uint256[] memory buildedBuildings = landData[landId].buildedBuildings;
        uint256 count;
        for (uint i = 0; i < buildedBuildings.length; i++) {
           uint256 buildingType = tokenIdStatus[buildedBuildings[i]].buildingTypeIndex;
           if (buildingType == typeIndex) {
            count ++;
           }
        }
        if (count + 1 > MaxBuildingsCapacity / 2) {
            revert MaxCapacity();
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
        uint256 goodAmount = (amount * getGoodsPrice()[goodIndex])/ 1 ether;
        BMTBalance[msg.sender] -= amount;
        landData[landTokenId].goodsBalance[goodIndex] += goodAmount;
        totalExistedGood[goodIndex] += goodAmount;
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
        landData[landTokenId].goodsBalance[toIndex] += amountOut * 9 / 10; // Including 10% burn
        totalExistedGood[fromIndex] -= amountOut;
        totalExistedGood[toIndex] += amountOut;
        uint256[2] memory amounts;
        amounts[toIndex] = amountOut * 1 / 10;
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
        BMTBalance[msg.sender] += totalAmount*95/100;
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
        TransferHelper.safeTransfer(address(BMT), msg.sender, amount * 95 /100); // Including 5% withdrawal burn
        emit Withdraw( msg.sender, amount);
    }



    function build(uint256 landTokenId, uint8 buildingIndex) external onlyLandOwner(landTokenId) typeLimit(landTokenId, buildingIndex){
        if (buildingIndex >= buildings.length ) {
            revert InvalidItem();
        }
        if (getRemainedBuildTimestamp(landTokenId) != 0) {
            revert WorkerIsBusy();
        }
        Info memory selecteduilding = buildings[buildingIndex];
        _spendGoods(landTokenId, [
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
        if (getRemainedBuildTimestamp(landTokenId) != 0) {
            revert WorkerIsBusy();
        }
        if (belongTo[buildingTokenId] != landTokenId ) {
            revert InvalidItem();
        }
        claimRevenue(buildingTokenId);
        uint256 typeIndex = tokenIdStatus[buildingTokenId].buildingTypeIndex;
        uint256 currentLevel = tokenIdStatus[buildingTokenId].level;
        Info memory selecteduilding = buildings[typeIndex];

        _spendGoods(landTokenId, [
            selecteduilding.requiredGold * (2 ** currentLevel),
            selecteduilding.requiredFood * (2 ** currentLevel)
        ]);
        tokenIdStatus[buildingTokenId].level = currentLevel+1 ;
        landData[landTokenId].latestBuildTimeStamp  = block.timestamp + (6 hours * (currentLevel+1));
        emit Upgrade(buildingTokenId, currentLevel+1);
    }

    function buildBarracks(uint256 landTokenId) public onlyLandOwner(landTokenId) {
        if (getRemainedBuildTimestamp(landTokenId) != 0) {
            revert WorkerIsBusy();
        }
        uint256 lvl = landData[landTokenId].barracksLevel;
        _spendGoods(landTokenId,getRequiredGoods(BaseBararcksRequiredGoods,lvl));
        landData[landTokenId].latestBuildTimeStamp  = block.timestamp + (6 hours * (lvl + 1));
        landData[landTokenId].barracksLevel ++;
        emit UpgradeBarracks( landTokenId, lvl + 1 );
    }

    function buildWalls(uint256 landTokenId) public onlyLandOwner(landTokenId) {
        if (getRemainedBuildTimestamp(landTokenId) != 0) {
            revert WorkerIsBusy();
        }
        uint256 lvl = landData[landTokenId].wallLevel;
        _spendGoods(landTokenId,getRequiredGoods(BaseWallRequiredGoods, lvl));
 
        landData[landTokenId].latestBuildTimeStamp  = block.timestamp + (6 hours * (lvl + 1));
        landData[landTokenId].wallLevel ++;
        emit UpgradeWalls( landTokenId, lvl + 1 );
    }


    function finishNow(uint256 landTokenId) external onlyLandOwner(landTokenId){
        uint256 remainedTimestamp;
        uint256 requiredGold;
        if (landData[landTokenId].latestBuildTimeStamp > block.timestamp) {
            remainedTimestamp = landData[landTokenId].latestBuildTimeStamp - block.timestamp;
            requiredGold = (remainedTimestamp / 1 hours) * 10 ether;
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

    function recruit(uint256 landTokenId, uint256 typeIndex, uint256 amount) external onlyLandOwner(landTokenId){
        if (typeIndex >= getWarriorTypes().length) {
            revert InvalidItem();
        }
        if (getWarriorTypes()[typeIndex].requiredLevel > landData[landTokenId].barracksLevel) {
            revert BarracksLevelLowerThanWarrior();
        }

        uint256[] memory currentWarriors = getArmy(landTokenId);
        uint256 currentArmy;
        for (uint i = 0; i < currentWarriors.length; i++) {
            currentArmy += currentWarriors[i];
        }
        if (landData[landTokenId].barracksLevel * BaseArmyCapacity < currentArmy + amount) {
            revert MaxCapacity();
        }

        _spendGoods(landTokenId,[BaseWarriorRequiredFood * amount, getWarriorTypes()[typeIndex].price * amount]);
        _addWarrior(typeIndex, amount, landTokenId);
        emit GoodsConsumption( [BaseWarriorRequiredFood * amount, getWarriorTypes()[typeIndex].price * amount], landTokenId);
    }



    function claimRevenue(uint256 buildingTokenId) public belongToCaller(buildingTokenId){
        Status memory buildingStatus = getStatus(buildingTokenId);
        Info memory selecteduildingInfo = buildings[buildingStatus.buildingTypeIndex];
        uint256 revenueAmount = getCurrentRevenue(buildingTokenId);
        uint256[2] memory amounts;
        amounts[buildingStatus.buildingTypeIndex] += revenueAmount;
        landData[tokenIdStatus[buildingTokenId].attachedLand].goodsBalance[selecteduildingInfo.revTokenIndex] += revenueAmount ;
        totalExistedGood[buildingStatus.buildingTypeIndex] += revenueAmount;
        emit GoodsProduction(amounts , belongTo[buildingTokenId]);
    }

    function attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external onlyLandOwner(attackerId) {

        require(LANDS.ownerOf(targetId) != address(0), "");
        (bool success, uint256 winRate) = _attack(warriorsAmounts, attackerId, targetId, landData[targetId].wallLevel);
        uint256 [2] memory lootAmounts;
        if (success) {
            lootAmounts = _loot(attackerId, targetId, winRate);
        }
        emit Attack(attackerId, targetId, success, lootAmounts);
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ****************************   Update features  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    // function hideArmy() external {}
    // function createStoreHouse() external {}
    // function createHouse() external {}
    // function createHiddenStoreHouse() external {}
    // function attachHero() external {}
    // function dispatchSupport() external {}
    // function returnArmy() external {}
    // function dispatchAttack() external {}
    // function attack() external {}
    // function calculateDispatchTime() view public returns (uint256) {}
    // function tradeOrder() external {}
    // function cancelOrder() external {}
    // function fulfillOrder() external {}


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  **************************   Only owner functions  ***************************
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

    function getCurrentRevenue(uint256 buildingTokenId) public view returns(uint256) {
        Status memory buildingStatus = getStatus(buildingTokenId);
        uint256 period = block.timestamp - (buildingStatus.latestActionTimestamp);
        uint256 rev = (period / 3 hours) * 1 ether * (2 ** (buildingStatus.level - 1));
        if (rev > BaseGoodCapacityOfBuilding * buildingStatus.level ) {
            rev = BaseGoodCapacityOfBuilding * buildingStatus.level ;
        }
        return rev;
    }

    function getGoodsPrice() view public returns (uint256[2] memory ) {
        uint256[2] memory prices = [uint256(1 ether), 1 ether]; 
        uint256 sumTotalGoods = prices[0] + prices[1];
        for (uint i = 0; i < totalExistedGood.length; i++) {
            if (sumTotalGoods < 50000 ether || totalExistedGood[i] < 10000) {
                return [uint256(1 ether), 1 ether];
            }
            prices[i] =  (sumTotalGoods * 1 ether) / (totalExistedGood[i] * 2);
        }
        return prices;
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

    function getRemainedBuildTimestamp(uint256 landTokenId) view public returns (uint256) {
        uint256 remainedTimestamp;
        if (landData[landTokenId].latestBuildTimeStamp > block.timestamp ) {
            remainedTimestamp = (landData[landTokenId].latestBuildTimeStamp - block.timestamp)/ 1 minutes;
        }
        return remainedTimestamp;
    }
    function getGoodsBal(uint256 landTokenId) view public returns (uint256[2] memory) {
        return landData[landTokenId].goodsBalance;
    }



    // function getBarracksRequiredGoods(uint256 landId) view public returns (uint256[2] memory) {
    //     uint256[2] memory requiredComs;
    //     for (uint i = 0; i < baseBararcksRequiredGoods.length; i++) 
    //     {
    //        requiredComs[i] = baseBararcksRequiredGoods[i] * ( 2 ** landData[landId].barracksLevel );
    //     }
    //     return requiredComs ;
    // }

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
                if (getGoodsBal(landTokenId)[i] < amounts[i]) {
                    revert InsufficientBalance();
                }
                landData[landTokenId].goodsBalance[i] -= amounts[i];
                totalExistedGood[i] -= amounts[i];
            }
        emit GoodsConsumption( amounts,landTokenId);
    }

    function _loot(uint256 attackerLandId, uint256 targetLandId, uint256 lootPercentage) internal returns(uint256[2] memory) {
        uint256[2] memory lootAmounts;
        for (uint i = 0; i < 2; i++) {
            uint256 lootAmount = landData[targetLandId].goodsBalance[i] * lootPercentage / 100;
            lootAmounts[i] = lootAmount;
            landData[targetLandId].goodsBalance[i] -= lootAmount;
            landData[attackerLandId].goodsBalance[i] += lootAmount * 85 / 100; // We have considered 15% of loot to burn as damage of war in order to resemble real war. On the other hand, keeping the value of the token by burning.
            totalExistedGood[i] -= lootAmount * 15 / 100;
        } 
        emit GoodsConsumption( lootAmounts,targetLandId);
        return lootAmounts;
    }




}
