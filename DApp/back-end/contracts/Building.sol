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

    uint256 private constant baseRevenue = 10 ether;
    uint256 private constant baseCapacity = 80 ether;

    uint256 private currentTokenID = 1;

    uint256 private constant defaultLevel = 1;
    uint256 private constant defaultHealth = 100;

    struct Status {
        uint256 level;
        uint256 latestActionTimestamp;
        uint256 health;
    }

    mapping(uint256 => Status) private tokenIdStatus;

    // mapping(uint256 => string) private tokenIdData;

    mapping(uint256 => uint256) private attachedLand;

    constructor(address landsContractAddress, address _stone, address _wood, address _iron, address _gold, address _food) ERC721("STM", "Stone mine") {
        lands = Lands(landsContractAddress);
        stone = IERC20(_stone);
        wood = IERC20(_wood);
        iron = IERC20(_iron);
        gold = IERC20(_gold);
        food = IERC20(_food);
    }

    modifier belongToCaller(uint256 tokenId) {
        require(_ownerOf(tokenId) == msg.sender, "Not owned by you");
        _;
    }
    // modifier checkRequieGoods(uint256 tokenId) {
    //     uint256 wood = lands.getGoodsBal(tokenId, address(wood));
    //     uint256 stone = lands.getGoodsBal(tokenId).stoneBal;
    //     uint256 iron = lands.getGoodsBal(tokenId).woodBal;
    //     uint256 food = lands.getGoodsBal(tokenId).woodBal;
    //     require(wood > baseRequireWood, "Insufficient wood");
    //     require(stone > baseRequireStone, "Insufficient stone");
    //     require(iron > baseRequireIron, "Insufficient iron");
    //     require(wood > baseRequireFood, "Insufficient food");
    //     _;
    // }



    function _baseURI() internal view virtual override returns (string memory) {
        return "Set this string";
    }

    function build(uint256 landTokenId) external {
        uint256 woodBal = getBal(landTokenId, address(wood));
        uint256 ironBal = getBal(landTokenId, address(iron));
        uint256 foodBal = getBal(landTokenId, address(food));
        require(woodBal >= baseRequireWood && ironBal >= baseRequireIron && foodBal >= baseRequireFood, "Insufficient goods");
        lands.spendAsset(landTokenId, address(wood), baseRequireWood);
        lands.spendAsset(landTokenId, address(iron), baseRequireIron);
        lands.spendAsset(landTokenId, address(food), baseRequireFood);
        tokenIdStatus[currentTokenID] = Status(defaultLevel, block.timestamp, defaultHealth);
        _safeMint(msg.sender, currentTokenID);
        _attachToLand(landTokenId, currentTokenID);
        currentTokenID ++;
    }


    function upgrade(uint256 tokenId) external {

        tokenIdStatus[tokenId].level +=1 ;
    }

    function _attachToLand(uint256 landTokenId,uint256 buildingTokenId) internal {
        require(attachedLand[landTokenId] == 0, "Building is already attached to one land");
        require(lands.ownerOf(landTokenId) == msg.sender, "Land not owned by you");
        attachedLand[landTokenId] = buildingTokenId;
        lands.attach(address(this), buildingTokenId, landTokenId);
    }

    function claimRevenue(uint256 tokenId) external belongToCaller(tokenId){
        uint256 previousTimestamp = tokenIdStatus[tokenId].latestActionTimestamp;
        uint256 currentTimestamp = block.timestamp;
        uint256 elapsedTime = currentTimestamp - previousTimestamp;
        uint256 reward = (elapsedTime / (1 seconds)) * baseRevenue;
        if (reward > baseCapacity) {
            reward = baseCapacity;
        }
        tokenIdStatus[tokenId].latestActionTimestamp = block.timestamp;
        lands.claimItem(2,reward);
    }
        
    // function repair(uint256 tokenId) external {
    //     uint256 bal= lands.getLand(tokenId).woodBal;
    // }

    function getCurrentRevenue() external view {}

    function getLevel() external view {}

    function getBal(uint256 landTokenId,address goodsAddress) public view returns (uint256) {
        return lands.getItemBal(landTokenId,goodsAddress);
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
                        StringUtils.toString(tokenIdStatus[_tokenId].health) ,
                        StringUtils.toString(tokenIdStatus[_tokenId].latestActionTimestamp) ,
                        currentBaseURI
                        // ".json"
                    )
                )
                : "";
    }
}
