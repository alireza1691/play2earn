//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { Town } from "./Town.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Lands } from "./Lands.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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
interface IBarracks {
        struct WarriorInfo {
        uint8 attackPower;
        uint8 defPower;
        uint8 hp;
        uint8 requiredLevel;
        string name;
        uint256 price;
    }
    function addWarrior_(uint256 warriorType, uint256 amount, uint256 landId) external;
    function attack_(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external  returns(bool, uint256);
    function getWarriorTypes() view external  returns (WarriorInfo[] memory);
    function getArmy(uint256 landId) view external returns (uint256[] memory);
}


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



contract TownV1 is Ownable, Lands{
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Events  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    event Build( uint256 buildingTypeIndex, uint256 indexed buildingId, uint256 indexed landTokenId);
    event Upgrade( uint256 indexed buildingId, uint256 level);
    event Claim( uint256 indexed buildingId, uint256 indexed landTokenId, uint256 amount, uint256 commodityIndex);



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Vairables  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    IBarracks barracks;
    IERC20 BKC;


    // address[] private items;

    uint256[5] private baseBararcksRequiredCommodities = [50 ether, 50 ether, 50 ether, 50 ether, 100 ether];

    // uint256 private constant defaultLandPrice = 20000000 gwei; // Equal 0.02 ether

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

    mapping (uint256 => LandIdData) internal  landData;

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

    constructor(address BlockchainsKingdomToken ,address barracksContract) Lands() {
        BKC = IERC20(BlockchainsKingdomToken);
        buildings.push(Info(0,200 ether,150 ether,0, 25 ether,0/*,"https://ipfs.io/ipfs/QmPNnffNtgiXHhbFFKpzJG6FwgWTRgpWVv7FJza5hK7V7o"*/,"Stone mine"));
        buildings.push(Info(50 ether,50 ether,250 ether,0, 25 ether,1/*,"https://ipfs.io/ipfs/QmU99dxpwMoFAGSoQPLxB6YVAoYSk1iwbDoKj2CuM2pKyB"*/,"Lumber mill"));
        buildings.push(Info(100 ether, 100 ether, 100 ether, 0, 25 ether, 2/*, "Url"*/,"Iron mine"));
        buildings.push(Info(2500 ether, 250 ether, 250 ether, 0, 50 ether, 3/*, "Url"*/,"Gold mine"));
        buildings.push(Info( 250 ether, 50 ether, 0, 0, 100 ether, 4/*,"Replace this with image url"*/,"ranchHouse"));
        barracks = IBarracks(barracksContract);
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
        if (_ownerOf(landTokenId) != msg.sender) {
            revert CallerIsNotOwner();
        } 
        _;
    }


    /// @notice Making sure caller of token is owner of entered toeknId.
    modifier belongToCaller(uint256 tokenId) {
        if (_ownerOf(belongTo[tokenId]) != msg.sender) {
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

    function deposit(uint256 amount, uint256 landTokenId) external landOwner(landTokenId){
        if (_ownerOf(landTokenId) == address(0)) {
            revert InvalidLand();
        }
        TransferHelper.safeTransferFrom(address(BKC),msg.sender,address(this),amount);
        landData[landTokenId].commoditiesBalance[4] += amount;
    }
    function withdraw(uint256 amount, uint256 landTokenId) external landOwner(landTokenId){
        if (landData[landTokenId].commoditiesBalance[4] < amount) {
            revert InsufficientCommodity();
        }
        landData[landTokenId].commoditiesBalance[4] -= amount;
        TransferHelper.safeTransfer(address(BKC), msg.sender, amount);
    }



    function build(uint256 landTokenId, uint8 buildingIndex) external onlyLandOwner(landTokenId){
        if (buildingIndex >= buildings.length) {
            revert InvalidItem();
        }
        if (maxBuildingsCapacity <= landData[landTokenId].buildedBuildings.length) {
            revert MaxCapacity();
        }
        // require(buildingIndex < buildings.length, "Building is not valid");
        // require(maxBuildingsCapacity > buildedBuildings[landTokenId].length, "Building capacity limit. Upgrade your land");
        // require(block.timestamp - latestBuildTimeStamp[landTokenId] > 0, "Worker is busy");
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
        if (block.timestamp - landData[landTokenId].latestBuildTimeStamp < 0) {
            revert TimeLimitation();
        }
        claimRevenue(buildingTokenId);
        // require(block.timestamp - latestBuildTimeStamp[landTokenId] > 0, "Worker is busy");
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
        // if (block.timestamp - landData[landTokenId].latestBuildTimeStamp  < 0) {
        //     revert TimeLimitation();
        // }
        uint256[5] memory balArray = getAssetsBal(landTokenId);
        require(balArray[0] >= baseBararcksRequiredCommodities[0] &&
        balArray[1] >= baseBararcksRequiredCommodities[1] && 
        balArray[2] >= baseBararcksRequiredCommodities[2] &&
        balArray[3] >= baseBararcksRequiredCommodities[3] &&
        balArray[4] >= baseBararcksRequiredCommodities[4] 
        , "Insufficient commodities");
        _spendCommodities(landTokenId,baseBararcksRequiredCommodities);
        // landData[landTokenId].latestBuildTimeStamp  = block.timestamp + (6 hours * (landData[landTokenId].barracksLevel+1));
        landData[landTokenId].barracksLevel ++;
    }

    function recruit(uint256 landTokenId, uint256 typeIndex, uint256 amount) external onlyLandOwner(landTokenId){
        if (typeIndex >= barracks.getWarriorTypes().length) {
            revert InvalidItem();
        }
        // require(typeIndex < _getWarriorTypes().length, "Type is not valid");
        uint256[] memory currentWarriors = barracks.getArmy(landTokenId);
        uint256 currentArmy;
        for (uint i = 0; i < currentWarriors.length; i++) {
            currentArmy += currentWarriors[i];
        }
        if (landData[landTokenId].barracksLevel * baseArmyCapacity < currentArmy + amount) {
            revert MaxCapacity();
        }
        if (barracks.getWarriorTypes()[typeIndex].requiredLevel > landData[landTokenId].barracksLevel) {
            revert LevelLessThanMin();
        }
        if (barracks.getWarriorTypes()[typeIndex].price * amount > getAssetsBal(landTokenId)[4]) {
            revert InsufficientCommodity();
        }
        // require(barracksLevel[landTokenId] * baseArmyCapacity > currentArmy + amount, "Army > maximum capacity, Upgrade your land");
        // require(_getWarriorTypes()[typeIndex].requiredLevel <= barracksLevel[landTokenId] && barracksLevel[landTokenId] != 0, "Upgrade barracks needed");
        // require(_getWarriorTypes()[typeIndex].price * amount <= getAssetsBal(landTokenId)[4], "Insufficient gold");
        _spendCommodities(landTokenId,[0,0,0,0,barracks.getWarriorTypes()[typeIndex].price * amount]);
        barracks.addWarrior_(typeIndex, amount, landTokenId);
        // commoditiesBalance[landId][_convertIndexToAddress()] += amount;
    }



    function claimRevenue(uint256 buildingTokenId) public belongToCaller(buildingTokenId){
        Status memory buildingStatus = getStatus(buildingTokenId);
        Info memory selecteduildingInfo = buildings[buildingStatus.buildingTypeIndex];
        uint256 revenueAmount = getCurrentRevenue(buildingTokenId);
        tokenIdStatus[buildingTokenId].latestActionTimestamp = block.timestamp;
        landData[tokenIdStatus[buildingTokenId].attachedLand].commoditiesBalance[selecteduildingInfo.revTokenIndex] += revenueAmount ;

        // _claimAsset(selecteduildingInfo.revTokenIndex, revenueAmount, tokenIdStatus[buildingTokenId].attachedLand);
        emit Claim(buildingTokenId, buildingStatus.attachedLand , revenueAmount, selecteduildingInfo.revTokenIndex); // find land id and add here....
    }

    function attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external onlyLandOwner(attackerId) {
        require(_ownerOf(targetId) != address(0), "Invalid land");
        (bool success, uint256 winRate) = barracks.attack_(warriorsAmounts, attackerId, targetId);

        if (success) {
            _loot(attackerId, targetId, winRate);
        }
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

    // Changing difficulty of commodity extraction. 
    // Use case of this function is managing tokenomics of commodities.
    // function setDifficulty(uint256 commodityIndex, uint8 newAmount) external onlyOwner{
    //     require(commodityIndex < 0, "Invalid index");
    //     require(newAmount <= 90 , "Bigger than maximum difficulty");
    //     difficultyCost[_convertIndexToAddress(commodityIndex)] = newAmount;
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
        uint256 rev = (period / 3 hours) * buildingStatus.level ;
        if (rev > baseCapacity * buildingStatus.level) {
            rev = baseCapacity * buildingStatus.level;
        }
        return rev;
    }

    function getStatus(uint256 tokenId) public view returns(Status memory){
        return tokenIdStatus[tokenId];
    }

    function getBuildings() view public returns (Info[] memory) {
        return buildings;
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

    // function _claimAsset(uint256 assetIndex, uint256 amount, uint256 landTokenId) internal {
    //     uint8 difficulty = difficultyCost[_convertIndexToAddress(assetIndex)];
    //     uint256 netAmount = amount * (100 - difficulty) / 100;
    //     commoditiesBalance[landTokenId][_convertIndexToAddress(assetIndex)] += netAmount;
    // }

    // function _convertIndexToAddress (uint256 commodityIndex) internal view returns(address commodityContractAddress){
    //     require(commodityIndex < 5, "Invalid index");
    //     if (commodityIndex == 0) {
    //         return address(stone);
    //     }
    //     if (commodityIndex == 1) {
    //         return address(wood);
    //     }
    //     if (commodityIndex == 2) {
    //         return address(iron);
    //     }
    //     if (commodityIndex == 3) {
    //         return address(food);
    //     }        
    //     if (commodityIndex == 4) {
    //         return address(gold);
    //     }
    // } 

    function _loot(uint256 attackerLandId, uint256 targetLandId, uint256 lootPercentage) internal returns(uint256[] memory lootAmounts) {
        for (uint i = 0; i < 5; i++) {
            // uint256 lootAmount = commoditiesBalance[targetLandId][_convertIndexToAddress(i)] * lootPercentage / 100;
            uint256 lootAmount = landData[targetLandId].commoditiesBalance[i] * lootPercentage / 100;
            lootAmounts[i] = lootAmount;
            landData[targetLandId].commoditiesBalance[i] -= lootAmount;
            landData[attackerLandId].commoditiesBalance[i] += lootAmount;
        }    
    }




}
