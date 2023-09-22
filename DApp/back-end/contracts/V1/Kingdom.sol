//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { Town } from "./Town.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Lands } from "./Lands.sol";
import { Barracks } from "./Barracks.sol";
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
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Errors  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************




contract Kingdom is Ownable, Lands, Barracks{
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


    IERC20 stone;
    IERC20 wood ;
    IERC20 iron ;
    IERC20 food ;
    IERC20 gold ;


    address[] private items;

    uint256[5] private baseBararcksRequiredCommodities = [50 ether, 50 ether, 50 ether, 50 ether, 100 ether];

    uint256 private constant defaultLandPrice = 20000000 gwei; // Equal 0.02 ether

    uint256 private transferCost = 3;
    uint8 private constant maxBuildingsCapacity = 12;
    uint8 private constant baseArmyCapacity = 50;
    uint256 private tokenIdCounter = 1;
    uint256 private constant baseCapacity = 80 ether;
    uint256 private constant baseRev = 2 ether; // Revenue per 6 hours
    uint256 private constant defaultLevel = 1;

    struct Info {
        uint256 requiredStone;
        uint256 requiredWood;
        uint256 requiredIron;
        uint256 requiredGold;
        uint256 requiredFood;
        uint256 revTokenIndex;
        string imageURL;
        string buildingName;
    }
 

    Info[] private buildings;

    struct Status {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 attachedLand;
        uint8 buildingTypeIndex;
    }
    // mapping (uint256 => mapping (uint256 => uint256)) private landArmy;
    /// Commodity token address => dificulty percent
    mapping (address => uint8) private difficultyCost;
    /// @notice Land id => Commodity token address => Balance
    mapping (uint256 => mapping(address => uint256)) private commoditiesBalance;
    /// @notice Token id => status of token id
    mapping (uint256 => Status) private tokenIdStatus;
    /// @notice Land token id => owned token ids
    mapping (uint256 => uint256[]) private buildedBuildings;
    /// @notice token ID => landId
    mapping (uint256 => uint256) private belongTo;

     mapping (uint256 => uint256) internal barracksLevel;


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //    Info ironMine = Info( 100, 100, 100, 0, 25, 8, 80, iron,"Replace this with image url");
    // Info ranchHouse = Info( 250 ether, 50 ether, 0, 0, 100 ether, 10, 100, food,"Replace this with image url");

    constructor(address[5] memory tokenAddresses,address landsContractAddress) Lands() {
        stone = IERC20(tokenAddresses[0]);
        wood = IERC20(tokenAddresses[1]);
        iron = IERC20(tokenAddresses[2]);
        food = IERC20(tokenAddresses[3]);
        gold = IERC20(tokenAddresses[4]);
        buildings.push(Info(0,200 ether,150 ether,0, 25 ether,0,"https://ipfs.io/ipfs/QmPNnffNtgiXHhbFFKpzJG6FwgWTRgpWVv7FJza5hK7V7o","Stone mine"));
        buildings.push(Info(50 ether,50 ether,250 ether,0, 25 ether,1,"https://ipfs.io/ipfs/QmU99dxpwMoFAGSoQPLxB6YVAoYSk1iwbDoKj2CuM2pKyB","Lumber mill"));
        buildings.push(Info(100 ether, 100 ether, 100 ether, 0, 25 ether, 2, "Url","Iron mine"));
        buildings.push(Info(2500 ether, 250 ether, 250 ether, 0, 50 ether, 3, "Url","Gold mine"));
        buildings.push(Info( 250 ether, 50 ether, 0, 0, 100 ether, 4,"Replace this with image url","ranchHouse"));
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
        require(_ownerOf(landTokenId) == msg.sender, "Land not owned by you");
        _;
    }


    /// @notice Making sure caller of token is owner of entered toeknId.
    modifier belongToCaller(uint256 tokenId) {
        require(_ownerOf(belongTo[tokenId]) == msg.sender, "Not owned by you");
        _;
    }

    /// @notice Modofier to prevent upgrade and actions that change variable x times.
    /// Imagine a building that extracted 80 amounts of a commodity, if users do not claim them and upgrade the building, then they can claim  160, this modifier prevents it by checking last action time.
    /// @dev If last timestamp action > 1 day => revert
    modifier timestampLimitation (uint256 tokenId){
        uint256 latestActionTimestamp = tokenIdStatus[tokenId].latestActionTimestamp;
        uint256 period = block.timestamp - latestActionTimestamp;
        require(period < 6 hours, "Sorry, revenue should claim before action");
        _;
    }


    modifier isCommodity (address enteredAddress) {
        require( enteredAddress == address(stone) ||
        enteredAddress == address(wood) ||
        enteredAddress == address(iron) ||
        enteredAddress == address(gold) ||
        enteredAddress == address(food),
        "Address is not commodity"
        );
        _;
    }

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***********************   External & public functions  ***********************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function deposit(address commodityTokenAddress, uint256 amount, uint256 landId) external isCommodity(commodityTokenAddress) landOwner(landId){
        require(_ownerOf(landId) != address(0), "Invalid land");
        TransferHelper.safeTransferFrom(commodityTokenAddress,msg.sender,address(this),amount);
        // IERC20(commodityTokenAddress).use(msg.sender, amount);
        commoditiesBalance[landId][commodityTokenAddress] += amount;
    }
    function withdraw(address commodityTokenAddress, uint256 amount, uint256 landId) external isCommodity(commodityTokenAddress) landOwner(landId){
        require(commoditiesBalance[landId][commodityTokenAddress] >= amount, "Insufficient balance");
        commoditiesBalance[landId][commodityTokenAddress] -= amount;
        TransferHelper.safeTransfer(commodityTokenAddress, msg.sender, amount);
        // IERC20(commodityTokenAddress).withdraw(msg.sender, amount);
    }



    function testDeposit( uint256 landTokenId) external {
        commoditiesBalance[landTokenId][address(wood)] += 10000 ether;
        commoditiesBalance[landTokenId][address(stone)] += 10000 ether;
        commoditiesBalance[landTokenId][address(iron)] += 10000 ether;
        commoditiesBalance[landTokenId][address(gold)] += 10000 ether;
        commoditiesBalance[landTokenId][address(food)] += 10000 ether;
    }


    function build(uint256 landTokenId, uint8 buildingIndex) external onlyLandOwner(landTokenId){
        require(buildingIndex < buildings.length, "Building is not valid");
        require(maxBuildingsCapacity > buildedBuildings[landTokenId].length, "Building capacity limit. Upgrade your land");
        Info memory selecteduilding = buildings[buildingIndex];
        require( commoditiesBalance[landTokenId][_convertIndexToAddress(0)] >= selecteduilding.requiredStone && 
        commoditiesBalance[landTokenId][_convertIndexToAddress(1)] >= selecteduilding.requiredWood &&
        commoditiesBalance[landTokenId][_convertIndexToAddress(2)] >= selecteduilding.requiredIron &&
        commoditiesBalance[landTokenId][_convertIndexToAddress(3)] >= selecteduilding.requiredFood &&
        commoditiesBalance[landTokenId][_convertIndexToAddress(4)] >= selecteduilding.requiredGold
        , "Insufficient commodities");

        _spendCommodities(landTokenId, [
            selecteduilding.requiredStone,
            selecteduilding.requiredWood,
            selecteduilding.requiredIron,
            selecteduilding.requiredFood,
            selecteduilding.requiredGold
            ]);
        belongTo[tokenIdCounter] = landTokenId;
        tokenIdStatus[tokenIdCounter] = Status(defaultLevel, block.timestamp, landTokenId,buildingIndex);
        buildedBuildings[landTokenId].push(tokenIdCounter);
        tokenIdCounter ++;
        emit Build(buildingIndex, tokenIdCounter-1, landTokenId);
    }


    function upgrade(uint256 buildingTokenId, uint256 landTokenId) external timestampLimitation(buildingTokenId){
        uint256 typeIndex = tokenIdStatus[buildingTokenId].buildingTypeIndex;
        uint256 currentLevel = tokenIdStatus[buildingTokenId].level;
        Info memory selecteduilding = buildings[typeIndex];
        uint256 requiredStone = selecteduilding.requiredStone * (currentLevel+1);
        uint256 requiredWood = selecteduilding.requiredWood * (currentLevel+1);
        uint256 requiredIron = selecteduilding.requiredIron * (currentLevel+1);
        uint256 requiredGold = selecteduilding.requiredGold * (currentLevel+1);
        uint256 requiredFood = selecteduilding.requiredFood * (currentLevel+1);
        require( commoditiesBalance[landTokenId][_convertIndexToAddress(0)]  >= requiredStone && 
        commoditiesBalance[landTokenId][_convertIndexToAddress(1)]  >= requiredWood &&
        commoditiesBalance[landTokenId][_convertIndexToAddress(2)]  >= requiredIron &&
        commoditiesBalance[landTokenId][_convertIndexToAddress(3)]  >= requiredFood &&
        commoditiesBalance[landTokenId][_convertIndexToAddress(4)]  >= requiredGold
        , "Insufficient commodities");
        _spendCommodities(landTokenId, [
            requiredStone,
            requiredWood,
            requiredIron,
            requiredFood,
            requiredGold

            ]);
        tokenIdStatus[buildingTokenId].level = currentLevel+1 ;
        emit Upgrade(buildingTokenId, currentLevel+1);
    }
        function buildBarracks(uint256 landId) public {
        uint256 currentLevel = barracksLevel[landId];
        uint256[5] memory requiredComs;
        for (uint i = 0; i < baseBararcksRequiredCommodities.length; i++) {
            requiredComs[i] = baseBararcksRequiredCommodities[i] * (currentLevel+1);
        }
        uint256[5] memory balArray = getAssetsBal(landId);
        require(balArray[0] >= requiredComs[0] &&
        balArray[1] >= requiredComs[1] && 
        balArray[2] >= requiredComs[2] &&
        balArray[3] >= requiredComs[3] &&
        balArray[4] >= requiredComs[4] 
        , "Insufficient commodities");
        _spendCommodities(landId,requiredComs);
        barracksLevel[landId] ++;
    }

    function recruit(uint256 landId, uint256 typeIndex, uint256 amount) external{
        require(msg.sender == _ownerOf(landId), "Callerr is not land owner");
        require(typeIndex < getWarriorTypes().length, "Type is not valid");
        (,uint256 currentArmy) = getArmy(landId);
        require(barracksLevel[landId] * baseArmyCapacity > currentArmy + amount, "Army > maximum capacity, Upgrade your land");
        require(getWarriorTypes()[typeIndex].requiredLevel <= barracksLevel[landId] && barracksLevel[landId] != 0, "Upgrade barracks needed");
        require(getWarriorTypes()[typeIndex].price * amount <= getAssetsBal(landId)[4], "Insufficient gold");
        _spendCommodities(landId,[0,0,0,0,getWarriorTypes()[typeIndex].price * amount]);
        addArmy(typeIndex, amount, landId);
        // commoditiesBalance[landId][_convertIndexToAddress()] += amount;
    }



    function claimRevenue(uint256 buildingTokenId) external belongToCaller(buildingTokenId){
        Status memory buildingStatus = getStatus(buildingTokenId);
        Info memory selecteduildingInfo = buildings[buildingStatus.buildingTypeIndex];
        uint256 revenueAmount = getCurrentRevenue(buildingTokenId);
        tokenIdStatus[buildingTokenId].latestActionTimestamp = block.timestamp;
        commoditiesBalance[tokenIdStatus[buildingTokenId].attachedLand][_convertIndexToAddress(selecteduildingInfo.revTokenIndex)] += revenueAmount ;
        // _claimAsset(selecteduildingInfo.revTokenIndex, revenueAmount, tokenIdStatus[buildingTokenId].attachedLand);
        emit Claim(buildingTokenId, buildingStatus.attachedLand , revenueAmount, selecteduildingInfo.revTokenIndex); // find land id and add here....
    }

    function attack(uint256[] memory warriorsAmounts, uint256 attackerId, uint256 targetId) external onlyLandOwner(attackerId) returns(bool){
        require(_ownerOf(targetId) != address(0), "Invalid land");
        (bool success, uint256 winRate) = _attack(warriorsAmounts, attackerId, targetId);
        if (success) {
            _loot(attackerId, targetId, winRate);
        }

    }


    // function calculateWar( uint256[] memory warriorsAmounts, uint256 targetLandId) internal view returns ( bool, uint256, uint256) {
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




    function transferCommodity(uint256 commodityIndex, uint256 amount, uint256 fromId, uint256 toId) external isCommodity(_convertIndexToAddress(commodityIndex)) landOwner(fromId){
        require(getAssetsBal(fromId)[commodityIndex] >= amount, "Insufficient balance");
        commoditiesBalance[toId][_convertIndexToAddress(commodityIndex)] += amount * (100-transferCost) / 100;
    }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  **************************   Only owner functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    // function updateWarriorType(uint8[3] memory physicalInfo,uint8 requiredLevel, string memory imageURL, string memory name, uint256 price, uint256 typeIndex) external onlyOwner{
    //     getWarriorTypes()[typeIndex] = Info( physicalInfo[0], physicalInfo[1], physicalInfo[2], requiredLevel, imageURL,name,price );
    // }

    function updateBuilding(uint256 index, uint256[5] memory requiredCommodities, string memory imgUrl, string memory name) external onlyOwner {
        buildings[index] = (Info(
            requiredCommodities[0],
            requiredCommodities[1],
            requiredCommodities[2],
            requiredCommodities[3],
            requiredCommodities[4],
            index,
            imgUrl,
            name
        ));
    }

    // Changing difficulty of commodity extraction. 
    // Use case of this function is managing tokenomics of commodities.
    function setDifficulty(uint256 commodityIndex, uint8 newAmount) external onlyOwner{
        require(commodityIndex < 0, "Invalid index");
        require(newAmount <= 90 , "Bigger than maximum difficulty");
        difficultyCost[_convertIndexToAddress(commodityIndex)] = newAmount;
    }

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *****************************   View functions  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function getCurrentRevenue(uint256 buildingTokenId) public view returns(uint256) {
        Status memory buildingStatus = getStatus(buildingTokenId);
        uint256 latestActionTimestamp = buildingStatus.latestActionTimestamp;
        uint256 period = block.timestamp - latestActionTimestamp;
        uint256 revenuePer6Hours = buildingStatus.level * baseRev;
        uint256 rev = (period / 6 hours) * revenuePer6Hours;
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


    function getAssetsBal(uint256 tokenId) view public returns (uint256[5] memory) {
        uint256[5] memory balancesArray;
        for (uint i = 0; i < 5; i++) {
            uint256 thisIndexBalance = commoditiesBalance[tokenId][_convertIndexToAddress(i)];
            balancesArray[i] = thisIndexBalance;
        }
        return balancesArray;
    }



    function getRequiredCommodities() view public returns (uint256[5] memory) {
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
                commoditiesBalance[landTokenId][_convertIndexToAddress(i)] -= amounts[i];
            }
            // balances[landTokenId][assetAddress] -= amount;

    }
        function _claimAsset(uint256 assetIndex, uint256 amount, uint256 landTokenId) internal {
        uint8 difficulty = difficultyCost[_convertIndexToAddress(assetIndex)];
        uint256 netAmount = amount * (100 - difficulty) / 100;
        commoditiesBalance[landTokenId][_convertIndexToAddress(assetIndex)] += netAmount;
    }

        function _convertIndexToAddress (uint256 commodityIndex) internal view returns(address commodityContractAddress){
        require(commodityIndex < 5, "Invalid index");
        if (commodityIndex == 0) {
            return address(stone);
        }
        if (commodityIndex == 1) {
            return address(wood);
        }
        if (commodityIndex == 2) {
            return address(iron);
        }
        if (commodityIndex == 3) {
            return address(food);
        }        
        if (commodityIndex == 4) {
            return address(gold);
        }
    } 

    function _loot(uint256 attackerLandId, uint256 targetLandId, uint256 lootPercentage) internal {
        for (uint i = 0; i < 5; i++) {
            uint256 lootAmount = commoditiesBalance[targetLandId][_convertIndexToAddress(i)] * lootPercentage / 100;
            commoditiesBalance[targetLandId][_convertIndexToAddress(i)] -= lootAmount;
            commoditiesBalance[attackerLandId][_convertIndexToAddress(i)] += lootAmount;
        }    
    }




}
