//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import "./Lands.sol";
import "./StringUtils.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Lands } from "./Lands.sol";

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Errors  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************




contract Kingdom is Ownable, Lands {
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Events  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    event Build( uint256 buildingTypeIndex, uint256 indexed tokenId, uint256 indexed landTokenId);
    event Upgrade( uint256 indexed tokenId, uint256 level);
    event Claim( uint256 indexed tokenId, uint256 amount, uint256 commodityIndex);


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Vairables  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    Lands lands;



    uint8 private constant maxBuildingsCapacity = 12;
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

    /// @notice Token id => status of token id
    mapping (uint256 => Status) private tokenIdStatus;
    /// @notice Land token id => owned token ids
    mapping (uint256 => uint256[]) private buildedBuildings;
    /// @notice token ID => landId
    mapping (uint256 => uint256) private belongTo;


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //    Info ironMine = Info( 100, 100, 100, 0, 25, 8, 80, iron,"Replace this with image url");
    // Info ranchHouse = Info( 250 ether, 50 ether, 0, 0, 100 ether, 10, 100, food,"Replace this with image url");

    constructor(address[5] memory tokenAddresses,address landsContractAddress) Lands(tokenAddresses[0],tokenAddresses[1],tokenAddresses[2],tokenAddresses[3],tokenAddresses[4]) {
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
        require(lands.ownerOf(landTokenId) == msg.sender, "Land not owned by you");
        _;
    }


    /// @notice Making sure caller of token is owner of entered toeknId.
    modifier belongToCaller(uint256 tokenId) {
        require(lands.ownerOf(belongTo[tokenId]) == msg.sender, "Not owned by you");
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



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***********************   External & public functions  ***********************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    function build(uint256 landTokenId, uint8 buildingIndex) external onlyLandOwner(landTokenId){
        require(buildingIndex < buildings.length, "Building is not valid");
        require(maxBuildingsCapacity > buildedBuildings[landTokenId].length, "Building capacity limit. Upgrade your land");
        Info memory selecteduilding = buildings[buildingIndex];
        require(lands.getAssetsBal(landTokenId)[0] >= selecteduilding.requiredStone &&
        lands.getAssetsBal(landTokenId)[1] >= selecteduilding.requiredWood && 
        lands.getAssetsBal(landTokenId)[2] >= selecteduilding.requiredIron &&
        lands.getAssetsBal(landTokenId)[3] >= selecteduilding.requiredFood &&
        lands.getAssetsBal(landTokenId)[4] >= selecteduilding.requiredGold
        , "Insufficient commodities");

        lands.spendCommodities(landTokenId, [
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
        require(lands.getAssetsBal(landTokenId)[0] >= requiredStone &&
        lands.getAssetsBal(landTokenId)[1] >= requiredWood && 
        lands.getAssetsBal(landTokenId)[2] >= requiredIron &&
        lands.getAssetsBal(landTokenId)[3] >= requiredGold &&
        lands.getAssetsBal(landTokenId)[4] >= requiredFood
        , "Insufficient commodities");
        lands.spendCommodities(landTokenId, [
            requiredStone,
            requiredWood,
            requiredIron,
            requiredGold,
            requiredFood
            ]);
        tokenIdStatus[buildingTokenId].level = currentLevel+1 ;
        emit Upgrade(buildingTokenId, currentLevel+1);
    }



    function claimRevenue(uint256 buildingTokenId) external belongToCaller(buildingTokenId){
        Status memory buildingStatus = getStatus(buildingTokenId);
        Info memory selecteduildingInfo = buildings[buildingStatus.buildingTypeIndex];
        uint256 revenueAmount = getCurrentRevenue(buildingTokenId);
        tokenIdStatus[buildingTokenId].latestActionTimestamp = block.timestamp;
        lands.claimAsset(selecteduildingInfo.revTokenIndex, revenueAmount, tokenIdStatus[buildingTokenId].attachedLand);
        emit Claim(buildingTokenId, revenueAmount, selecteduildingInfo.revTokenIndex);
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  **************************   Only owner functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

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

    function landBuildings(uint256 landTokenId) view public returns (uint256[] memory) {
        return buildedBuildings[landTokenId];
    }


    // function tokenURI(
    //     uint256 _tokenId
    //     ) public view returns (string memory) {

    //     Status memory thisTokenIdStatus = tokenIdStatus[_tokenId];
    //     Info memory thisBuildingInfo = buildings[thisTokenIdStatus.buildingTypeIndex];
    //     // string memory currentBaseURI = _baseURI();

    //     return  thisBuildingInfo.imageURL;

    //     // return
    //     //     bytes(currentBaseURI).length > 0
    //     //         ? string(
    //     //             abi.encodePacked(    
    //     //                 StringUtils.toString(thisTokenIdStatus.level) ,
    //     //                 StringUtils.toString(thisTokenIdStatus.attachedLand),
    //     //                 StringUtils.toString(thisTokenIdStatus.latestActionTimestamp) ,
                        
    //     //                 currentBaseURI
    //     //                 // ".json"
    //     //             )
    //     //         )
    //     //         : "";
    // }

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ****************************   Internal functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    // function _baseURI() internal view returns (string memory) {
    //     return "Set this string";
    // }


}
