//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { Converter } from "./Converter.sol";
// import "./Strings.sol";
import "./Lands.sol";
import "./StringUtils.sol";
import "./Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Building is ERC721 {

    Lands lands;

    uint256 private constant baseRequireWood = 200 ether;
    uint256 private constant baseRequireStone = 150 ether;
    uint256 private constant baseRequireIron = 50 ether;
    uint256 private constant baseRequireGold = 0 ether;
    uint256 private constant baseRequireFood = 15 ether;

    uint256 private constant baseRevenue = 10 ether;
    uint256 private constant baseCapacity = 80 ether;

    uint256 private currentTokenID = 1;

    string private constant defaultLevel = "1";
    string private constant defaultHealth = "100";

    // struct Status {
    //     uint256 level;
    //     uint256 latestActionTimestamp;
    //     uint8 health;
    //     uint256 maxCapacity;
    // }

    // mapping(uint256 => Status) private tokenIdStatus;

    mapping(uint256 => string) private tokenIdData;

    mapping(uint256 => uint256) private attachedLand;

    constructor(address landsContractAddress) ERC721("STM", "Stone mine") {
        lands = Lands(landsContractAddress);
    }

    modifier belongToCaller(uint256 tokenId) {
        require(_ownerOf(tokenId) == msg.sender, "Not owned by you");
        _;
    }
    modifier checkRequieGoods(uint256 tokenId) {
        uint256 wood = lands.getGoodsBal(tokenId).woodBal;
        uint256 stone = lands.getGoodsBal(tokenId).stoneBal;
        uint256 iron = lands.getGoodsBal(tokenId).woodBal;
        uint256 food = lands.getGoodsBal(tokenId).woodBal;
        require(wood > baseRequireWood, "Insufficient wood");
        require(stone > baseRequireStone, "Insufficient stone");
        require(iron > baseRequireIron, "Insufficient iron");
        require(wood > baseRequireFood, "Insufficient food");
        _;
    }



    function _baseURI() internal view virtual override returns (string memory) {
        return "Set this string";
    }

    function build(uint256 landTokenId) external checkRequieGoods(landTokenId){
        lands.spendGoods(landTokenId, baseRequireWood, baseRequireStone, baseRequireIron, baseRequireGold, baseRequireFood);
        string memory latestActionTimestamp = StringUtils.toString(block.timestamp);
        tokenIdData[currentTokenID] = string.concat(
            defaultLevel,
            defaultHealth,
            latestActionTimestamp
        );

        _safeMint(msg.sender, currentTokenID);
        _attachToLand(landTokenId, currentTokenID);
    }


    function upgrade(uint256 tokenId) external {
        string memory data = tokenIdData[tokenId];
        uint8 level = StringUtils.convertFirstLetterToUint8(tokenIdData[tokenId]);
        string memory dataWithoutLevel = StringUtils.removeCharacterAtIndex(data,1);
        string memory newData = StringUtils.attachLetterAtIndex(dataWithoutLevel,0,StringUtils.toString(level+1));
        tokenIdData[tokenId] = newData;
    }

    // function test_() view public returns (uint8, string memory, string memory ,string memory, string memory) {
    //     return (test, dataa,newDataa, StringUtils.removeCharacterAtIndex("Hello",1), StringUtils.attachLetterAtIndex("Hello",1,"C"));
    // }

    function _attachToLand(uint256 landTokenId,uint256 buildingTokenId) internal {
        require(attachedLand[landTokenId] == 0, "Building is already attached to one land");
        require(lands.ownerOf(landTokenId) == msg.sender, "Land not owned by you");
        attachedLand[landTokenId] = buildingTokenId;
        lands.attach(address(this), buildingTokenId, landTokenId);
    }

    function claimRevenue(uint256 tokenId) external belongToCaller(tokenId){
        string memory data = tokenIdData[tokenId];
        uint256 currentTimestamp = block.timestamp;
        uint256 previousTimestamp = StringUtils.convertTimestampLettersToUint(data);
        uint256 elapsedTime = currentTimestamp - previousTimestamp;
        uint256 reward = (elapsedTime / (1 seconds)) * baseRevenue;
        if (reward > baseCapacity) {
            reward = baseCapacity;
        }
    }
        
    // function repair(uint256 tokenId) external {
    //     uint256 bal= lands.getLand(tokenId).woodBal;
    // }

    function getCurrentRevenue() external view {}

    function getLevel() external view {}

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
                        tokenIdData[_tokenId],
                        currentBaseURI
                        // ".json"
                    )
                )
                : "";
    }
}
