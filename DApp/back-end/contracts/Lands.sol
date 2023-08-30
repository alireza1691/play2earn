//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import { Converter } from "./Converter.sol";
// import "./Strings.sol";
import { StringUtils } from "./StringUtils.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { TransferHelper } from "./TransferHelper.sol";
import { ICommodity } from "./ICommodity.sol";

error Lands__InvalidCoordinate();
error Lands__LandAlreadyMinted();

contract Lands is ERC721, Ownable {

    ICommodity stone;
    ICommodity wood ;
    ICommodity iron ;
    ICommodity gold ;
    ICommodity food ;

    address[] private items;
    uint8 private constant baseCapacity = 6;

    enum LandStatus {
        normal,
        attacked
    }
    enum AttackStatus {
        onTheWay,
        atLocation,
        done
    }

    mapping (uint256 => Land) public tokenIdLand;
    mapping (uint256 => Building[]) private landItems;
    mapping (uint256 => mapping(address => uint256)) private balances;
    mapping (address => uint8) private difficultyCost;
    // mapping (uint256 => AttackStatus[]) attacksSatus;


    struct WarInfo {
        AttackStatus status;
        uint256 targetId;
        address[] armyTokenAddresses;
        uint256[] armyAmounts;
    }

    struct Building {
        address buildingContractAddress;
        uint256 tokenId;
    }

    struct Land {
        uint8 coordinateX;
        uint8 coordinateY;
        uint8 level;
        LandStatus defence;
    }
    Land private defaultLand = Land(100,100,1,LandStatus.normal);


    constructor(address _stone, address _wood, address _iron, address _gold, address _food) ERC721("Polygon wars land","PWL"){
        stone = ICommodity(_stone);
        wood = ICommodity(_wood);
        iron = ICommodity(_iron);
        gold = ICommodity(_gold);
        food = ICommodity(_food);
    }

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

    // Mint new land by coordinate in x and y dimension
    function mintLand(uint8 x, uint8 y) external payable isExist(x,y) isCorrectCoordinate(x,y){
        // uint256 tokenId = Converter.concatenate(x, y);
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
    function buy(address commodityTokenAddress, uint256 amount) external isCommodity(commodityTokenAddress) {

    }
    function deposit(address commodityTokenAddress, uint256 amount) external {
        TransferHelper.safeTransferFrom(commodityTokenAddress, msg.sender, address(this),amount);
    }
    function withdraw(address commodityTokenAddress, uint256 amount) external {}
    function transferCommodities(address[] memory assets, uint256[] memory amounts) external {}
    function spendAsset(uint256 landTokenId,
        address assetAddress,
        uint256 amount
        ) external onlyItems{
            balances[landTokenId][assetAddress] -= amount;

    }
    // Attach item to the land
    function attach(address buildingContractAddress, uint256 buildingTokenId, uint256 landTokenId)external{
        require(tokenIdLand[landTokenId].level * baseCapacity >= landItems[landTokenId].length, "You have not enough capacity. Please upgrade your land.");
        landItems[landTokenId].push(Building(buildingContractAddress,buildingTokenId));
    }

    // Add new attachable building or item to the land.
    function addItem(address newItem)external onlyOwner{
        items.push(newItem);
    }
    // Claiming collected amount of an asset
    function claimAsset(address assetTokenAddress, uint256 amount, uint256 landTokenId) external onlyItems {
        uint8 difficulty = difficultyCost[assetTokenAddress];
        uint256 netAmount = amount * (100 - difficulty) / 100;
        balances[landTokenId][assetTokenAddress] += netAmount;
    }
    // Changing difficulty of commodity extraction. 
    // Use case of this function is managing tokenomics of commodities.
    function setDifficulty(address assetAddress, uint8 newAmount) external onlyOwner{
        require(newAmount <= 90 , "Bigger than maximum difficulty");
        difficultyCost[assetAddress] = newAmount;
    }

    function dispatchArmy(address[] memory armyAddresses,uint256[] memory armyAmounts,uint256 attackerId, uint256 targetId) external landOwner(attackerId){
        require(armyAddresses.length == armyAmounts.length, "Lengths does not match");
        for (uint i = 0; i < armyAddresses.length; i++) {
            require(getAssetBal(attackerId, armyAddresses[i]) > armyAmounts[i], "InsufficientArmy");
            balances[attackerId][armyAddresses[i]] -= armyAmounts[i];
        }
    }
    function attack(/*uint256 attacketTokenId, uint256 defenderTokenId*/) external view returns(uint, uint){
        uint speed = 10;
        // (uint distance, uint time) = StringUtils.calculateDistanceAndEstimateTime(
        //     tokenIdLand[attacketTokenId].coordinateX,
        //     tokenIdLand[attacketTokenId].coordinateY,
        //     tokenIdLand[defenderTokenId].coordinateX,
        //     tokenIdLand[defenderTokenId].coordinateY,
        //     speed
        //     );
        (uint distance, uint time) = StringUtils.calculateDistanceAndEstimateTime(
            110,
            111,
            240,
            101,
            speed
            );
            return(distance, time);
    }
    function swap() external {}
    function calculateTimestamp() external {}
    function repair() external {}
    function calculateWarResult() external {}


    // function getLand(uint256 tokenId) external view returns(Land memory) {
    //     return tokenIdLand[tokenId];
    // }

    function getAssetBal(uint256 tokenId, address tokenAddress) public view returns(uint256) {
        return balances[tokenId][tokenAddress];
    }

    // function _getAddressByIndex(uint256 index) view internal returns (address indexAddress) {
    //     if (index == 1) {
    //         return address(stone);
    //     }
    //     if (index == 2) {
    //         return address(wood);
    //     }
    //     if (index == 3) {
    //         return address(iron);
    //     }
    //     if (index == 4) {
    //         return address(gold);
    //     }
    //     if (index == 5) {
    //         return address(food);
    //     }
    // }

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
