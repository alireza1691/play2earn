//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { Converter } from "./Converter.sol";
// import "./Strings.sol";
import "./Lands.sol";
import "./StringUtils.sol";
// import "./Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BuildingV1 is ERC721 {

    Lands lands;

    address[] private commoditiesAddress;
    uint256[] private baseRequireGoods;


    uint256 private immutable baseRevenue;
    address private immutable earnedCommodity;
    uint256 private constant baseCapacity = 80 ether;

    uint256 private tokenIdCounter = 1;

    uint256 private constant defaultLevel = 1;

    struct Status {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 attachedLand;
    }

    mapping(uint256 => Status) private tokenIdStatus;

    constructor(address landsAddress, address[] memory commoditiesTokenAddress, uint256[] memory baseRequireAmounts, uint256 baseBuildingRevenue, address revenueCommodityAddress) ERC721("STM", "Stone mine") {
        require(commoditiesTokenAddress.length == baseRequireAmounts.length, "Length does not match");
        lands = Lands(landsAddress);
        commoditiesAddress = commoditiesTokenAddress;
        baseRequireGoods = baseRequireAmounts;
        baseRevenue = baseBuildingRevenue;
        earnedCommodity = revenueCommodityAddress;
    }

    modifier onlyLandOwner(uint256 landTokenId) {
        require(lands.ownerOf(landTokenId) == msg.sender, "Land not owned by you");
        _;
    }

    modifier belongToCaller(uint256 tokenId) {
        require(_ownerOf(tokenId) == msg.sender, "Not owned by you");
        _;
    }

    modifier timestampLimitation (uint256 tokenId){
        uint256 latestActionTimestamp = tokenIdStatus[tokenId].latestActionTimestamp;
        uint256 period = block.timestamp - latestActionTimestamp;
        require(period < 1 days, "Sorry, revenue should claim before action");
        _;
    }


    function _baseURI() internal view virtual override returns (string memory) {
        return "Set this string";
    }

    function build(uint256 landTokenId) external onlyLandOwner(landTokenId){
        // uint256[] balance;
        for (uint i = 0; i < commoditiesAddress.length; i++) {
            uint256 bal = getBal(landTokenId, commoditiesAddress[i]);
            // balance[i] = bal;
            require(bal >= baseRequireGoods[i], "Insufficient commodities");
            // lands.spendAsset(landTokenId, address(wood), baseRequireWood);
        }

        lands.spendAssets(landTokenId, commoditiesAddress, baseRequireGoods);

        tokenIdStatus[tokenIdCounter] = Status(defaultLevel, block.timestamp, landTokenId);
        _safeMint(msg.sender, tokenIdCounter);
        _attachToLand(landTokenId, tokenIdCounter);
        tokenIdCounter ++;
    }


    function upgrade(uint256 buildingTokenId, uint256 landTokenId) external timestampLimitation(buildingTokenId){
        uint256[] memory requireUpgradeCommodities;
        uint256 currentLevel = tokenIdStatus[buildingTokenId].level;
        for (uint i = 0; i < commoditiesAddress.length; i++) {
            uint256 bal = getBal(landTokenId, commoditiesAddress[i]);
            uint256 requireUpgradeAmount =  baseRequireGoods[i] * (currentLevel + 1);
            require(bal >= requireUpgradeAmount, "Insufficient commodities");
            requireUpgradeCommodities[i] = requireUpgradeAmount;
        }

        lands.spendAssets(landTokenId,commoditiesAddress, requireUpgradeCommodities);
        tokenIdStatus[buildingTokenId].level +=1 ;
    }

    function _attachToLand(uint256 landTokenId,uint256 buildingTokenId) internal {
        require(tokenIdStatus[buildingTokenId].attachedLand == landTokenId, "Building is already attached to one land");
        lands.attach(address(this), buildingTokenId, landTokenId);
    }

    function claimRevenue(uint256 tokenId) external belongToCaller(tokenId){
        uint256 revenueAmount = getCurrentRevenue(tokenId);
        tokenIdStatus[tokenId].latestActionTimestamp = block.timestamp;
        lands.claimAsset(earnedCommodity, revenueAmount, tokenIdStatus[tokenId].attachedLand);
    }


    function getCurrentRevenue(uint256 tokenId) public view returns(uint256) {
        uint256 latestActionTimestamp = tokenIdStatus[tokenId].latestActionTimestamp;
        uint256 period = block.timestamp - latestActionTimestamp;
        uint256 revenuePerDay = tokenIdStatus[tokenId].level * baseRevenue;
        uint256 rev = (period / 1 days) * revenuePerDay;
        if (rev > baseCapacity * tokenIdStatus[tokenId].level) {
            rev = baseCapacity * tokenIdStatus[tokenId].level;
        }
        return rev;
    }

    function getStatus(uint256 tokenId) external view returns(Status memory){
        return tokenIdStatus[tokenId];
    }

    function getBal(uint256 landTokenId,address commodityTokenAddress) public view returns (uint256) {
        return lands.getAssetBal(landTokenId,commodityTokenAddress);
    }

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory currentBaseURI = _baseURI();

        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(    
                        StringUtils.toString(tokenIdStatus[_tokenId].level) ,
                        StringUtils.toString(tokenIdStatus[_tokenId].attachedLand),
                        StringUtils.toString(tokenIdStatus[_tokenId].latestActionTimestamp) ,
                        currentBaseURI
                        // ".json"
                    )
                )
                : "";
    }
}
