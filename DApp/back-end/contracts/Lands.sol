//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { Converter } from "./Converter.sol";
// import "./Strings.sol";
import "./StringUtils.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

error Lands__InvalidCoordinate();
error Lands__LandAlreadyMinted();

contract Lands is ERC721, Ownable {

    IERC20 stone;
    IERC20 wood ;
    IERC20 iron ;
    IERC20 gold ;
    IERC20 food ;

    address[] private items;

    uint256 private tokenIdCounter;
    uint8 private constant coordinateMax = 100;

    mapping (uint256 => Land) public tokenIdLand;
    mapping(uint => string) public  landsData ;
    // mapping(uint256 => LandGoods) private landGoodsBalance;
    mapping(uint256 => Building[]) private landItems;
    mapping(uint256 => mapping(address => uint256)) private balances;

    struct Building {
        address buildingContractAddress;
        uint256 tokenId;
    }

    struct Land {
        uint8 coordinateX;
        uint8 coordinateY;
        uint8 level;
    }
    Land private defaultLand = Land(100,100,1);

    // struct LandGoods {
    //     uint256 woodBal;
    //     uint256 stoneBal;
    //     uint256 ironBal;
    //     uint256 goldBal;
    //     uint256 foodBal;
    // }


    constructor(address _stone, address _wood, address _iron, address _gold, address _food) ERC721("Polygon wars land","PWL"){
        stone = IERC20(_stone);
        wood = IERC20(_wood);
        iron = IERC20(_iron);
        gold = IERC20(_gold);
        food = IERC20(_food);
    }
    // Check if land with this coordinate is already minted or not.
    modifier isExist (uint8 x, uint8 y){
        uint256 tokenId = StringUtils.concatenate(x, y);
        if ( _ownerOf(tokenId) != address(0)) {
            revert Lands__LandAlreadyMinted(); 
        }
        _;
    }
    // Check if range of location coordinate is in authorized range.
    modifier isCorrectCoordinate (uint8 x, uint8 y) {
        if (x < 100 || x > 999 || y < 100 || y > 999) {
            revert Lands__InvalidCoordinate();
        }
        _;
    }
    // Making sure if one of added items calls this function.
    modifier onlyItems() {
        bool exist = false;
        for (uint i = 0; i < items.length; i++) {
            if (msg.sender == items[i]) {
                exist = true;
                break;
            }
        }
        require(exist == true, "Address not authorized");
        _;
    }

    // Mint new land by coordinate in x and y dimension
    function mintLand(uint8 x, uint8 y) external payable isExist(x,y) isCorrectCoordinate(x,y){
        // uint256 tokenId = Converter.concatenate(x, y);
         uint256 tokenId = StringUtils.concatenate(x, y);
        _mint(msg.sender, tokenId);
        tokenIdLand[tokenId] = defaultLand;
    }

    function deposit( uint256 landTokenId) external {
        balances[landTokenId][address(wood)] += 10000 ether;
        balances[landTokenId][address(stone)] += 10000 ether;
        balances[landTokenId][address(iron)] += 10000 ether;
        balances[landTokenId][address(gold)] += 10000 ether;
        balances[landTokenId][address(food)] += 10000 ether;
    }
    function withdraw(address goodsTokenAddress, uint256 amount) external {}
    function spendAsset(uint256 landTokenId,
        address assetAddress,
        uint256 amount
        ) external onlyItems{
            balances[landTokenId][assetAddress] -= amount;

    }
    // Attach item to the land
    function attach(address buildingContractAddress, uint256 buildingTokenId, uint256 landTokenId)external{
        landItems[landTokenId].push(Building(buildingContractAddress,buildingTokenId));
    }

    // Add new attachable building or item to the land.
    function addItem(address newItem)external onlyOwner{
        items.push(newItem);
    }

    function claimItem(uint256 itemIndex, uint256 amount) external onlyItems {

    }

    // function getLand(uint256 tokenId) external view returns(Land memory) {
    //     return tokenIdLand[tokenId];
    // }

    function getItemBal(uint256 tokenId, address tokenAddress) external view returns(uint256) {
        return balances[tokenId][tokenAddress];
    }

 

    // function assignMetadatas(
    //     uint64[] memory _playerIds,
    //     uint64[] memory _playerTypes,
    //     uint64[] memory _mintAmounts
    //     ) private {
    //     uint256 currentTokenID = _currentIndex;
    //     uint256 index;
    //     uint256 length =  _playerIds.length;

    //     while (index < length) {
    //     uint256 lastSupply = getSupply(_playerIds[index], _playerTypes[index],_mintAmounts[index]);
    //     uint64 mintAmount = _mintAmounts[index];
    //      string memory _typeOfPlayer =  Strings.toString(_playerTypes[index]);
    //      string memory _idOfPlayer =  makeNumbers(Strings.toString(_playerIds[index]));
       
    //     for (uint i = 0; i < mintAmount; i = unsafe_inc(i)) {
    //         lastSupply = lastSupply + 1;
           
    //         cardsData[currentTokenID]=string.concat(
    //             _idOfPlayer,
    //            _typeOfPlayer,
    //             Strings.toString(lastSupply));
            
    //         currentTokenID = currentTokenID + 1;
    //     }
    //      totalSupply[_playerIds[index]][_playerTypes[index]] += _mintAmounts[index];
    //      publicTotalSupply += _mintAmounts[index];
    //     index = unsafe_inc(index);
    //     }
    // }
    // function tokenURI(
    //     uint256 _tokenId
    //     ) public view virtual override returns (string memory) {
    //     require(
    //         _exists(_tokenId),
    //         "ERC721Metadata: URI query for nonexistent token"
    //     );

    //     string memory currentBaseURI = _baseURI();

    //     return
    //         bytes(currentBaseURI).length > 0
    //                        ? string(abi.encodePacked(currentBaseURI, cardsData[_tokenId], ".json"))

    //             : "";
    // }
}
