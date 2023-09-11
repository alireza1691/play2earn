//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import "./LandsV1.sol";
import "./StringUtils.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// import { ICommodity } from "./ICommodity.sol";

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Errors  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************




contract Building is ERC721, Ownable {
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Events  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Vairables  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    LandsV1 lands;

    // address stone;
    // address wood ;
    // address iron ;
    // address gold ;
    // address food ;

    // uint256 private immutable baseRequireStone ;
    // uint256 private immutable baseRequireWood ;
    // uint256 private immutable baseRequireIron ;
    // uint256 private immutable baseRequireGold ;
    // uint256 private immutable baseRequireFood ;

    // string[] private commodities = ["Stone","Wood","Iron","Gold","Food"];

    // uint256 private immutable baseRevenue;
    // uint256 private constant baseCapacity = 80 ether;

    uint256 private tokenIdCounter = 1;
    uint8 private buildingCounter ;

    uint256 private constant defaultLevel = 1;

    struct Info {
        uint256 requiredStone;
        uint256 requiredWood;
        uint256 requiredIron;
        uint256 requiredGold;
        uint256 requiredFood;
        uint256 baseRev;
        uint256 baseCapacity;
        uint256 revTokenIndex;
        string imageURL;
        string biuldingName;
    }

    Info[] private buildings;

    struct Status {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 attachedLand;
        uint8 buildingTypeIndex;
    }

    mapping (uint256 => Status) private tokenIdStatus;
    // mapping (uint8 => Info) private buildingInfo;


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    constructor(address landsContractAddress/*, address[5] memory commodities*/) ERC721("Buildings", "BDG") {
        lands = LandsV1(landsContractAddress);
        buildings.push(Info(0,200 ether,150 ether,0, 25 ether,8 ether,80 ether,0,"https://ipfs.io/ipfs/QmPNnffNtgiXHhbFFKpzJG6FwgWTRgpWVv7FJza5hK7V7o","StoneMine"));
        buildings.push(Info(50 ether,50 ether,250 ether,0, 25 ether,8 ether,80 ether,1,"https://ipfs.io/ipfs/QmPNnffNtgiXHhbFFKpzJG6FwgWTRgpWVv7FJza5hK7V7o","StoneMine"));
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
        require(_ownerOf(tokenId) == msg.sender, "Not owned by you");
        _;
    }

    /// @notice Modofier to prevent upgrade and actions that change variable x times.
    /// Imagine a building that extracted 80 amounts of a commodity, if users do not claim them and upgrade the building, then they can claim  160, this modifier prevents it by checking last action time.
    /// @dev If last timestamp action > 1 day => revert
    modifier timestampLimitation (uint256 tokenId){
        uint256 latestActionTimestamp = tokenIdStatus[tokenId].latestActionTimestamp;
        uint256 period = block.timestamp - latestActionTimestamp;
        require(period < 1 days, "Sorry, revenue should claim before action");
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
        require(buildingIndex < buildingCounter, "Building is not valid");
        Info memory selecteduilding = buildings[buildingIndex];
        uint256 stoneBal = getBal(landTokenId, 0);
        uint256 woodBal = getBal(landTokenId, 1);
        uint256 ironBal = getBal(landTokenId, 2);
        uint256 foodBal = getBal(landTokenId, 3);
        uint256 goldBal = getBal(landTokenId, 4);
        require(stoneBal >= selecteduilding.requiredStone &&
        woodBal >= selecteduilding.requiredWood && 
        ironBal >= selecteduilding.requiredIron &&
        foodBal >= selecteduilding.requiredFood &&
        goldBal >= selecteduilding.requiredGold
        , "Insufficient commodities");


        lands.spendCommodities(landTokenId, [
            selecteduilding.requiredStone,
            selecteduilding.requiredWood,
            selecteduilding.requiredIron,
            selecteduilding.requiredFood,
            selecteduilding.requiredGold
            ]);
        tokenIdStatus[tokenIdCounter] = Status(defaultLevel, block.timestamp, landTokenId,buildingIndex);
        _safeMint(msg.sender, tokenIdCounter);
        _attachToLand(landTokenId, tokenIdCounter);
        tokenIdCounter ++;
    }


    function upgrade(uint256 buildingTokenId, uint256 landTokenId) external timestampLimitation(buildingTokenId){
        uint256 typeIndex = tokenIdStatus[buildingTokenId].buildingTypeIndex;
        uint256 currentLevel = tokenIdStatus[buildingTokenId].level;
        // Status memory buildingStatus = getStatus(buildingTokenId);
        Info memory selecteduilding = buildings[typeIndex];
        // uint256 currentLevel = buildingStatus.level;
        uint256 requiredStone = selecteduilding.requiredStone * (currentLevel+1);
        uint256 requiredWood = selecteduilding.requiredWood * (currentLevel+1);
        uint256 requiredIron = selecteduilding.requiredIron * (currentLevel+1);
        uint256 requiredGold = selecteduilding.requiredGold * (currentLevel+1);
        uint256 requiredFood = selecteduilding.requiredFood * (currentLevel+1);
        require(getBal(landTokenId, 0) >= requiredStone &&
        getBal(landTokenId, 1) >= requiredWood && 
        getBal(landTokenId, 2) >= requiredIron &&
        getBal(landTokenId, 3) >= requiredGold &&
        getBal(landTokenId, 4) >= requiredFood
        , "Insufficient commodities");
        lands.spendCommodities(landTokenId, [
            requiredStone,
            requiredWood,
            requiredIron,
            requiredGold,
            requiredFood
            ]);
        tokenIdStatus[buildingTokenId].level = currentLevel+1 ;
    }



    function claimRevenue(uint256 buildingTokenId) external belongToCaller(buildingTokenId){
        Status memory buildingStatus = getStatus(buildingTokenId);
        Info memory selecteduildingInfo = buildings[buildingStatus.buildingTypeIndex];
        uint256 revenueAmount = getCurrentRevenue(buildingTokenId);
        tokenIdStatus[buildingTokenId].latestActionTimestamp = block.timestamp;
        lands.claimAsset(selecteduildingInfo.revTokenIndex, revenueAmount, tokenIdStatus[buildingTokenId].attachedLand);
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  **************************   Only owner functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function addNewBuilding(uint256[7] memory requiredCommodities, string memory imgUrl, string memory name) external onlyOwner {
        buildings.push(Info(
                        requiredCommodities[0],
            requiredCommodities[1],
            requiredCommodities[2],
            requiredCommodities[3],
            requiredCommodities[4],
            requiredCommodities[5],
            requiredCommodities[6],
            buildings.length,
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
        Info memory selecteduilding = buildings[buildingStatus.buildingTypeIndex];
        uint256 latestActionTimestamp = buildingStatus.latestActionTimestamp;
        uint256 period = block.timestamp - latestActionTimestamp;
        uint256 revenuePerDay = buildingStatus.level * selecteduilding.baseRev;
        uint256 rev = (period / 1 days) * revenuePerDay;
        if (rev > selecteduilding.baseCapacity * buildingStatus.level) {
            rev = selecteduilding.baseCapacity * buildingStatus.level;
        }
        return rev;
    }

    function getStatus(uint256 tokenId) public view returns(Status memory){
        return tokenIdStatus[tokenId];
    }

    function getBuildings() view public returns (Info[] memory) {
        return buildings;
    }
    // remove this and get balance directly
    function getBal(uint256 landTokenId,uint8 commodityTokenIndex) public view returns (uint256) {
        return lands.getAssetBal(landTokenId,commodityTokenIndex);
    }

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        Status memory thisTokenIdStatus = tokenIdStatus[_tokenId];
        Info memory thisBuildingInfo = buildings[thisTokenIdStatus.buildingTypeIndex];
        // string memory currentBaseURI = _baseURI();

        return  thisBuildingInfo.imageURL;

        // return
        //     bytes(currentBaseURI).length > 0
        //         ? string(
        //             abi.encodePacked(    
        //                 StringUtils.toString(thisTokenIdStatus.level) ,
        //                 StringUtils.toString(thisTokenIdStatus.attachedLand),
        //                 StringUtils.toString(thisTokenIdStatus.latestActionTimestamp) ,
                        
        //                 currentBaseURI
        //                 // ".json"
        //             )
        //         )
        //         : "";
    }

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ****************************   Internal functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    function _baseURI() internal view virtual override returns (string memory) {
        return "Set this string";
    }

    function _attachToLand(uint256 landTokenId,uint256 buildingTokenId) internal {
        require(tokenIdStatus[buildingTokenId].attachedLand == landTokenId, "Building is already attached to one land");
        lands.attach( buildingTokenId, landTokenId);
    }

}
