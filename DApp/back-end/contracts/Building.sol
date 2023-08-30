//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { Converter } from "./Converter.sol";
// import "./Strings.sol";
import "./Lands.sol";
import "./StringUtils.sol";
// import "./Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";


contract Building is ERC721 {

    Lands lands;

    IERC20 stone;
    IERC20 wood ;
    IERC20 iron ;
    IERC20 gold ;
    IERC20 food ;

    uint256 private constant baseRequireWood = 200 ether;
    uint256 private constant baseRequireStone = 0 ether;
    uint256 private constant baseRequireIron = 150 ether;
    uint256 private constant baseRequireGold = 0 ether;
    uint256 private constant baseRequireFood = 20 ether;

    uint256 private constant baseRevenue = 8 ether;
    uint256 private constant baseCapacity = 80 ether;

    uint256 private currentTokenID = 1;

    uint256 private constant defaultLevel = 1;

    struct Status {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 attachedLand;
    }

    mapping(uint256 => Status) private tokenIdStatus;

    constructor(address landsContractAddress, address _stone, address _wood, address _iron, address _gold, address _food) ERC721("STM", "Stone mine") {
        lands = Lands(landsContractAddress);
        stone = IERC20(_stone);
        wood = IERC20(_wood);
        iron = IERC20(_iron);
        gold = IERC20(_gold);
        food = IERC20(_food);
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
        uint256 woodBal = getBal(landTokenId, address(wood));
        uint256 ironBal = getBal(landTokenId, address(iron));
        uint256 foodBal = getBal(landTokenId, address(food));
        require(woodBal >= baseRequireWood && ironBal >= baseRequireIron && foodBal >= baseRequireFood, "Insufficient commodities");
        lands.spendAsset(landTokenId, address(wood), baseRequireWood);
        lands.spendAsset(landTokenId, address(iron), baseRequireIron);
        lands.spendAsset(landTokenId, address(food), baseRequireFood);
        tokenIdStatus[currentTokenID] = Status(defaultLevel, block.timestamp, landTokenId);
        _safeMint(msg.sender, currentTokenID);
        _attachToLand(landTokenId, currentTokenID);
        currentTokenID ++;
    }


    function upgrade(uint256 buildingTokenId, uint256 landTokenId) external timestampLimitation(buildingTokenId){
        uint256 currentLevel = tokenIdStatus[buildingTokenId].level;
        uint256 woodBal = getBal(landTokenId, address(wood));
        uint256 ironBal = getBal(landTokenId, address(iron));
        uint256 foodBal = getBal(landTokenId, address(food));
        require(woodBal >= baseRequireWood * (currentLevel + 1) 
        && ironBal >= baseRequireIron * (currentLevel + 1) 
        && foodBal >= baseRequireFood * (currentLevel + 1) 
        , "Insufficient commodities");
        lands.spendAsset(landTokenId, address(wood), (baseRequireWood * (currentLevel + 1) ));
        lands.spendAsset(landTokenId, address(iron), (baseRequireIron * (currentLevel + 1) ));
        lands.spendAsset(landTokenId, address(food), (baseRequireFood * (currentLevel + 1) ));
        tokenIdStatus[buildingTokenId].level +=1 ;
    }

    function _attachToLand(uint256 landTokenId,uint256 buildingTokenId) internal {
        require(tokenIdStatus[buildingTokenId].attachedLand == landTokenId, "Building is already attached to one land");
        lands.attach(address(this), buildingTokenId, landTokenId);
    }

    function claimRevenue(uint256 tokenId) external belongToCaller(tokenId){
        uint256 revenueAmount = getCurrentRevenue(tokenId);
        tokenIdStatus[tokenId].latestActionTimestamp = block.timestamp;
        lands.claimAsset(address(wood), revenueAmount, tokenIdStatus[tokenId].attachedLand);
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
