//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { StringUtils } from "./StringUtils.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { TransferHelper } from "./TransferHelper.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ********************************   Errors  ***********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************




error Lands__InvalidCoordinate();
error Lands__LandAlreadyMinted();

contract Lands is ERC721, Ownable {

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


    IERC20 stone;
    IERC20 wood ;
    IERC20 iron ;
    IERC20 gold ;
    IERC20 food ;

    address[] private items;
    uint8 private constant baseCapacity = 6;
    uint256 private transferCost = 3;
    uint256 private constant defaultLandPrice = 20000000 gwei; // Equal 0.02 ether


    mapping (uint256 => Land) public tokenIdLand;
    mapping (uint256 => uint256[]) private landBuildings;
    mapping (uint256 => mapping(address => uint256)) private balances;
    mapping (address => uint8) private difficultyCost;


    struct Land {
        uint8 coordinateX;
        uint8 coordinateY;
        uint8 level;
    }
    Land private defaultLand = Land(100,100,1);



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************




    constructor(address _stone, address _wood, address _iron, address _gold, address _food) ERC721("Polygon wars land","PWL"){
        stone = IERC20(_stone);
        wood = IERC20(_wood);
        iron = IERC20(_iron);
        gold = IERC20(_gold);
        food = IERC20(_food);
    }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *******************************   Modifiers  *********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    modifier landOwner (uint256 id ) {
        require(msg.sender == ownerOf(id), "Not owner");
        _;
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


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***********************   External & public functions  ***********************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    // Mint new land by coordinate in x and y dimension
    function mintLand(uint8 x, uint8 y) external payable isExist(x,y) isCorrectCoordinate(x,y){
        require(msg.value >= defaultLandPrice, "msg.value less than land price");
        uint256 tokenId = StringUtils.concatenate(x, y);
        _mint(msg.sender, tokenId);
        tokenIdLand[tokenId] = defaultLand;
    }

    function testDeposit( uint256 landTokenId) external {
        balances[landTokenId][address(wood)] += 10000 ether;
        balances[landTokenId][address(stone)] += 10000 ether;
        balances[landTokenId][address(iron)] += 10000 ether;
        balances[landTokenId][address(gold)] += 10000 ether;
        balances[landTokenId][address(food)] += 10000 ether;
    }

    function deposit(address commodityTokenAddress, uint256 amount, uint256 landId) external isCommodity(commodityTokenAddress) landOwner(landId){
        require(_ownerOf(landId) != address(0), "Invalid land");
        TransferHelper.safeTransferFrom(commodityTokenAddress,msg.sender,address(this),amount);
        // IERC20(commodityTokenAddress).use(msg.sender, amount);
        balances[landId][commodityTokenAddress] += amount;
    }
    function withdraw(address commodityTokenAddress, uint256 amount, uint256 landId) external isCommodity(commodityTokenAddress) landOwner(landId){
        require(balances[landId][commodityTokenAddress] >= amount, "Insufficient balance");
        balances[landId][commodityTokenAddress] -= amount;
        TransferHelper.safeTransfer(commodityTokenAddress, msg.sender, amount);
        // IERC20(commodityTokenAddress).withdraw(msg.sender, amount);
    }
    // function transferCommodities(address[] memory assets, uint256[] memory amounts) external {}
    function spendAsset(uint256 landTokenId,
        address assetAddress,
        uint256 amount
        ) external onlyItems{
            balances[landTokenId][assetAddress] -= amount;

    }
    function spendCommodities(uint256 landTokenId,
        uint256[5] memory amounts
        ) external onlyItems{
            // require(amounts.length == 5, "Length does not match");
            for (uint i = 0; i < 5; i++) {
                balances[landTokenId][convertIndexToAddress(i)] -= amounts[i];
            }
            // balances[landTokenId][assetAddress] -= amount;

    }

    // Claiming collected amount of an asset
    function claimAsset(uint256 assetIndex, uint256 amount, uint256 landTokenId) external onlyItems {
        uint8 difficulty = difficultyCost[convertIndexToAddress(assetIndex)];
        uint256 netAmount = amount * (100 - difficulty) / 100;
        balances[landTokenId][convertIndexToAddress(assetIndex)] += netAmount;
    }


    function loot(uint256 attackerLandId, uint256 targetLandId, uint256 lootPercentage) external onlyItems {
        for (uint i = 0; i < 5; i++) {
            uint256 lootAmount = balances[targetLandId][convertIndexToAddress(i)] * lootPercentage / 100;
            balances[targetLandId][convertIndexToAddress(i)] -= lootAmount;
            balances[attackerLandId][convertIndexToAddress(i)] += lootAmount;
        }    
    }


    function transferCommodity(uint256 commodityIndex, uint256 amount, uint256 fromId, uint256 toId) external isCommodity(convertIndexToAddress(commodityIndex)) landOwner(fromId){
        require(getAssetsBal(fromId)[commodityIndex] >= amount, "Insufficient balance");
        balances[toId][convertIndexToAddress(commodityIndex)] += amount * (100-transferCost) / 100;
    }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  **************************   Only owner functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    // Add new attachable item to land.
    function addItem(address newItem)external onlyOwner{
        items.push(newItem);
    }
    // Changing difficulty of commodity extraction. 
    // Use case of this function is managing tokenomics of commodities.
    function setDifficulty(uint256 commodityIndex, uint8 newAmount) external onlyOwner{
        require(commodityIndex < 0, "Invalid index");
        require(newAmount <= 90 , "Bigger than maximum difficulty");
        difficultyCost[convertIndexToAddress(commodityIndex)] = newAmount;
    }

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *****************************   View functions  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    function getLand(uint256 tokenId) external view returns(Land memory) {
        return tokenIdLand[tokenId];
    }


    function getAssetsBal(uint256 tokenId) view public returns (uint256[5] memory) {
        uint256[5] memory balancesArray;
        for (uint i = 0; i < 5; i++) {
            uint256 thisIndexBalance = balances[tokenId][convertIndexToAddress(i)];
            balancesArray[i] = thisIndexBalance;
        }
        return balancesArray;
    }


    function URI () public view returns (string memory){
        return _baseURI();
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
                        StringUtils.toString(tokenIdLand[_tokenId].coordinateX) ,
                        StringUtils.toString(tokenIdLand[_tokenId].coordinateY),
                        StringUtils.toString(tokenIdLand[_tokenId].level) ,
                        currentBaseURI
                        // ".json"
                    )
                )
                : "";
    }

    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ****************************   Internal functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    function _baseURI() internal  view virtual override   returns (string memory) {
        return "https://ipfs.io/ipfs/Qmaz1NiFrfiXS9BckHNySzdmkpq5GTirU2RoTt4Sji8hdm";
    }


    function convertIndexToAddress (uint256 commodityIndex) internal view returns(address commodityContractAddress){
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
            return address(gold);
        }
        if (commodityIndex == 4) {
            return address(food);
        }
    } 

   
}
