//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { Converter } from "./Converter.sol";
// import "./Strings.sol";
import "./Strings.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

error Lands__InvalidCoordinate();
error Lands__LandAlreadyMinted();

contract Lands is ERC721, Ownable {
    // using Converter for uint256;
    address private immutable stone ;
    address private immutable wood ;
    address private immutable iron ;
    address private immutable gold ;
    address private immutable food ;

    address[] private items;

    uint256 private tokenIdCounter;
    uint8 private constant coordinateMax = 100;

    mapping (uint256 => Land) public tokenIdLand;
    mapping(uint => string) public  landsData ;
    mapping(uint256 => LandGoods) private landGoodsBalance;
    mapping(uint256 => Building[]) private landItems;

    struct Building {
        address buildingContractAddress;
        uint256 tokenId;
    }

    struct Land {
        uint8 coordinateX;
        uint8 coordinateY;
        uint8 level;
    }
    Land private defaulLand = Land(100,100,1);

    struct LandGoods {
        uint256 woodBal;
        uint256 stoneBal;
        uint256 ironBal;
        uint256 goldBal;
        uint256 foodBal;
    }


    constructor(address _stone, address _wood, address _iron, address _gold, address _food) ERC721("Polygon wars land","PWL"){
        stone = _stone;
        wood = _wood;
        iron = _iron;
        gold = _gold;
        food = _food;
    }
    // Check if land with this coordinate is already minted or not.
    modifier isExist (uint8 x, uint8 y){
        uint256 tokenId = concatenate(x, y);
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
         uint256 tokenId = concatenate(x, y);
        _mint(msg.sender, tokenId);
        // tokenIdLand[tokenId] = Land(x, y, 1, 0, 0, 0, 0, 0);
        tokenIdLand[tokenId] = defaulLand;
    }

    function deposit( uint256 landTokenId) external {
        landGoodsBalance[landTokenId].woodBal += 10000 ether;
        landGoodsBalance[landTokenId].stoneBal += 10000 ether;
        landGoodsBalance[landTokenId].ironBal += 10000 ether;
        landGoodsBalance[landTokenId].goldBal += 10000 ether;
        landGoodsBalance[landTokenId].foodBal += 10000 ether;
    }
    function withdraw(address goodsTokenAddress, uint256 amount) external {}
    function spendGoods(uint256 landTokenId,
        uint256 woodAmount,
        uint256 stoneAmount,
        uint256 ironAmount,
        uint256 goldAmount,
        uint256 foodAmount
        ) external onlyItems{
            landGoodsBalance[landTokenId].woodBal -= woodAmount;
            landGoodsBalance[landTokenId].stoneBal -= stoneAmount;
            landGoodsBalance[landTokenId].ironBal -= ironAmount;
            landGoodsBalance[landTokenId].goldBal -= goldAmount;
            landGoodsBalance[landTokenId].foodBal -= foodAmount;
    }
    // Attach item to the land
    function attach(address buildingContractAddress, uint256 buildingTokenId, uint256 landTokenId)external{
        landItems[landTokenId].push(Building(buildingContractAddress,buildingTokenId));
    }

    // Add new attachable building or item to the land.
    function addItem(address newItem)external onlyOwner{
        items.push(newItem);
    }

    function getLand(uint256 tokenId) external view returns(Land memory) {
        return tokenIdLand[tokenId];
    }

    function getGoodsBal(uint256 tokenId) external view returns(LandGoods memory) {
        return landGoodsBalance[tokenId];
    }

    function concatenate(uint8 x, uint8 y) public pure returns (uint256) {
        string memory strX = Strings.toString(x);
        string memory strY = Strings.toString(y);
        string memory concatenated = string(abi.encodePacked(strX, strY));
        // return concatenated;
        uint256 concatenatedUint = convertToUint(concatenated);
        return concatenatedUint;
    }
    function convertToUint(string memory str) public pure returns (uint256) {
        uint256 result = 0;
        bytes memory strBytes = bytes(str);
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            uint256 digit = uint256(uint8(strBytes[i])) - 48;
            result = result * 10 + digit;
        }
        
        return result;
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
