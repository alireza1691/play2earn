// //SPDX-License-Identifier: MIT
// pragma solidity ^0.8.17;


// import "./LandsV1.sol";
// import "./StringUtils.sol";
// import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// // import { ICommodity } from "./ICommodity.sol";

//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ********************************   Errors  ***********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************




// contract Building is ERC721, Ownable {
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ********************************   Events  ***********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************



//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  *******************************   Vairables  *********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************


//     LandsV1 lands;

//     // address stone;
//     // address wood ;
//     // address iron ;
//     // address gold ;
//     // address food ;

//     // uint256 private immutable baseRequireStone ;
//     // uint256 private immutable baseRequireWood ;
//     // uint256 private immutable baseRequireIron ;
//     // uint256 private immutable baseRequireGold ;
//     // uint256 private immutable baseRequireFood ;

//     // string[] private commodities = ["Stone","Wood","Iron","Gold","Food"];

//     // uint256 private immutable baseRevenue;
//     // uint256 private constant baseCapacity = 80 ether;

//     uint256 private tokenIdCounter = 1;
//     // uint8 private buildingCounter ;

//     uint256 private constant defaultLevel = 1;

//     struct Info {
//         uint256 requiredStone;
//         uint256 requiredWood;
//         uint256 requiredIron;
//         uint256 requiredGold;
//         uint256 requiredFood;
//         uint256 baseRev;
//         uint256 baseCapacity;
//         uint256 revTokenIndex;
//         string imageURL;
//         string biuldingName;
//     }

//     Info[] private buildings;

//     struct Status {
//         uint256 level;
//         uint256 latestActionTimestamp;
//         uint256 attachedLand;
//         uint8 buildingTypeIndex;
//     }

//     mapping (uint256 => Status) private tokenIdStatus;
//     // mapping (uint8 => Info) private buildingInfo;


//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************   Constructor  ********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************


//     constructor(address landsContractAddress/*, address[5] memory commodities*/) ERC721("Buildings", "BDG") {
//         lands = LandsV1(landsContractAddress);
//         // stone = commodities[0];
//         // wood = commodities[1];
//         // iron = commodities[2];
//         // gold = commodities[3];
//         // food = commodities[4];
//     }


//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  *******************************   Modifiers  *********************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************


//     modifier onlyLandOwner(uint256 landTokenId) {
//         require(lands.ownerOf(landTokenId) == msg.sender, "Land not owned by you");
//         _;
//     }

//     modifier belongToCaller(uint256 tokenId) {
//         require(_ownerOf(tokenId) == msg.sender, "Not owned by you");
//         _;
//     }

//     modifier timestampLimitation (uint256 tokenId){
//         uint256 latestActionTimestamp = tokenIdStatus[tokenId].latestActionTimestamp;
//         uint256 period = block.timestamp - latestActionTimestamp;
//         require(period < 1 days, "Sorry, revenue should claim before action");
//         _;
//     }



//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ***********************   External & public functions  ***********************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************


//     function build(uint256 landTokenId, uint8 buildingIndex) external onlyLandOwner(landTokenId){
//         require(buildingIndex < buildings.length, "Building is not valid");
//         // Info memory selecteduilding = buildingInfo[buildingIndex];
//         Info[] memory selecteduilding = getBuildings();
//         uint256 stoneBal = getBal(landTokenId, 0);
//         uint256 woodBal = getBal(landTokenId, 1);
//         uint256 ironBal = getBal(landTokenId, 2);
//         uint256 foodBal = getBal(landTokenId, 3);
//         uint256 goldBal = getBal(landTokenId, 4);
//         require(stoneBal >= selecteduilding[buildingIndex].requiredStone &&
//         woodBal >= selecteduilding[buildingIndex].requiredWood && 
//         ironBal >= selecteduilding[buildingIndex].requiredIron &&
//         foodBal >= selecteduilding[buildingIndex].requiredFood &&
//         goldBal >= selecteduilding[buildingIndex].requiredGold
//         , "Insufficient commodities");


//         lands.spendCommodities(landTokenId, [
//             selecteduilding[buildingIndex].requiredStone,
//             selecteduilding[buildingIndex].requiredWood,
//             selecteduilding[buildingIndex].requiredIron,
//             selecteduilding[buildingIndex].requiredFood,
//             selecteduilding[buildingIndex].requiredGold
//             ]);
//         // lands.spendAsset(landTokenId, address(iron), baseRequireIron);
//         // lands.spendAsset(landTokenId, address(food), baseRequireFood);
//         tokenIdStatus[tokenIdCounter] = Status(defaultLevel, block.timestamp, landTokenId,buildingIndex);
//         _safeMint(msg.sender, tokenIdCounter);
//         _attachToLand(landTokenId, tokenIdCounter);
//         tokenIdCounter ++;
//     }


//     function upgrade(uint256 buildingTokenId, uint256 landTokenId) external timestampLimitation(buildingTokenId){
//         Status memory buildingStatus = getStatus(buildingTokenId);
//         Info[] memory selecteduilding = getBuildings();
//         // Info memory selecteduilding = getBuilding(buildingStatus.buildingTypeIndex);
//         uint8 index = buildingStatus.buildingTypeIndex;
//         uint256 currentLevel = buildingStatus.level;
//         uint256 stoneBal = getBal(landTokenId, 0);
//         uint256 woodBal = getBal(landTokenId, 1);
//         uint256 ironBal = getBal(landTokenId, 2);
//         uint256 foodBal = getBal(landTokenId, 3);
//         uint256 goldBal = getBal(landTokenId, 4);
//         require(stoneBal >= selecteduilding[index].requiredStone * (currentLevel+1) &&
//         woodBal >= selecteduilding[index].requiredWood * (currentLevel+1) && 
//         ironBal >= selecteduilding[index].requiredIron * (currentLevel+1) &&
//         foodBal >= selecteduilding[index].requiredFood * (currentLevel+1) &&
//         goldBal >= selecteduilding[index].requiredGold * (currentLevel+1)
//         , "Insufficient commodities");
//         lands.spendCommodities(landTokenId, [
//             selecteduilding[index].requiredStone * (currentLevel+1),
//             selecteduilding[index].requiredWood * (currentLevel+1),
//             selecteduilding[index].requiredIron * (currentLevel+1),
//             selecteduilding[index].requiredFood * (currentLevel+1),
//             selecteduilding[index].requiredGold * (currentLevel+1)
//             ]);
//         tokenIdStatus[buildingTokenId].level +=1 ;
//     }



//     function claimRevenue(uint256 buildingTokenId) external belongToCaller(buildingTokenId){
//         Status memory buildingStatus = getStatus(buildingTokenId);
//         Info[] memory selecteduilding = getBuildings();
//         uint8 index = buildingStatus.buildingTypeIndex;
//         // Info memory selecteduildingInfo = buildingInfo[buildingStatus.buildingTypeIndex];
//         uint256 revenueAmount = getCurrentRevenue(buildingTokenId);
//         tokenIdStatus[buildingTokenId].latestActionTimestamp = block.timestamp;
//         lands.claimAsset(selecteduilding[index].revTokenIndex, revenueAmount, tokenIdStatus[buildingTokenId].attachedLand);
//     }


//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  **************************   Only owner functions  ***************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************

//     function addNewBuilding(uint256[7] memory requiredCommodities, string memory imgUrl, string memory name) external onlyOwner {

//         //         uint8 requiredStone;
//         // uint8 requiredWood;
//         // uint8 requiredIron;
//         // uint8 requiredGold;
//         // uint8 requiredFood;
//         // uint8 baseRev;
//         // uint8 baseCapacity;
//         // uint8 revTokenIndex;
//         // string imageURL;
//         buildings.push(Info(
//                         requiredCommodities[0],
//             requiredCommodities[1],
//             requiredCommodities[2],
//             requiredCommodities[3],
//             requiredCommodities[4],
//             requiredCommodities[5],
//             requiredCommodities[6],
//             buildings.length,
//             imgUrl,
//             name
//         ));
//         // buildingInfo[buildingCounter] = Info(
//         //     requiredCommodities[0],
//         //     requiredCommodities[1],
//         //     requiredCommodities[2],
//         //     requiredCommodities[3],
//         //     requiredCommodities[4],
//         //     requiredCommodities[5],
//         //     requiredCommodities[6],
//         //     buildingCounter,
//         //     imgUrl,
//         //     name
//         // );
//         // buildingCounter++;
//     }


//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  *****************************   View functions  ******************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************


//     function getCurrentRevenue(uint256 buildingTokenId) public view returns(uint256) {
//         Status memory buildingStatus = getStatus(buildingTokenId);
//          Info[] memory selecteduilding = getBuildings();
//          uint8 index = buildingStatus.buildingTypeIndex;
//         // Info memory selecteduilding = getBuilding(buildingStatus.buildingTypeIndex);
//         uint256 latestActionTimestamp = buildingStatus.latestActionTimestamp;
//         uint256 period = block.timestamp - latestActionTimestamp;
//         uint256 revenuePerDay = buildingStatus.level * selecteduilding[index].baseRev;
//         uint256 rev = (period / 1 days) * revenuePerDay;
//         if (rev > selecteduilding[index].baseCapacity * buildingStatus.level) {
//             rev = selecteduilding[index].baseCapacity * buildingStatus.level;
//         }
//         return rev;
//     }

//     function getStatus(uint256 tokenId) public view returns(Status memory){
//         return tokenIdStatus[tokenId];
//     }

//     // function getBuilding(uint8 typeIndex) view public returns (Info memory) {
//     //     return buildings[typeIndex];
//     // }
//      function getBuildings() view public returns (Info[] memory) {
//         return buildings;
//     }


//     function getBal(uint256 landTokenId,uint8 commodityTokenIndex) public view returns (uint256) {
//         return lands.getAssetBal(landTokenId,commodityTokenIndex);
//     }

//     function tokenURI(
//         uint256 _tokenId
//     ) public view virtual override returns (string memory) {
//         require(
//             _exists(_tokenId),
//             "ERC721Metadata: URI query for nonexistent token"
//         );

//         Status memory buildingStatus = tokenIdStatus[_tokenId];
//         Info[] memory selecteduilding = getBuildings();
//          uint8 index = buildingStatus.buildingTypeIndex;
//         // Info memory thisBuildingInfo = buildingInfo[thisTokenIdStatus.buildingTypeIndex];
//         // string memory currentBaseURI = _baseURI();

//         return  selecteduilding[index].imageURL;

//         // return
//         //     bytes(currentBaseURI).length > 0
//         //         ? string(
//         //             abi.encodePacked(    
//         //                 StringUtils.toString(thisTokenIdStatus.level) ,
//         //                 StringUtils.toString(thisTokenIdStatus.attachedLand),
//         //                 StringUtils.toString(thisTokenIdStatus.latestActionTimestamp) ,
                        
//         //                 currentBaseURI
//         //                 // ".json"
//         //             )
//         //         )
//         //         : "";
//     }

//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ****************************   Internal functions  ***************************
//     //  ******************************************************************************
//     //  ******************************************************************************
//     //  ******************************************************************************

//     function _baseURI() internal view virtual override returns (string memory) {
//         return "Set this string";
//     }

//     function _attachToLand(uint256 landTokenId,uint256 buildingTokenId) internal {
//         require(tokenIdStatus[buildingTokenId].attachedLand == landTokenId, "Building is already attached to one land");
//         lands.attach( buildingTokenId, landTokenId);
//     }

// }
