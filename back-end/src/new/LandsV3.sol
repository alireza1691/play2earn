//SPDX-License-Identifier: MIT
pragma solidity 0.8.23;


// import { Town } from "./Town.sol";
import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

library StringUtils {
     bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(
        uint256 value,
        uint256 length
    ) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

       function concatenate(uint8 x, uint8 y) internal pure returns (uint256) {
        string memory strX = toString(x);
        string memory strY = toString(y);
        string memory concatenated = string(abi.encodePacked(strX, strY));
        // return concatenated;
        uint256 concatenatedUint = convertToUint(concatenated);
        return concatenatedUint;
    }
    function convertToUint(string memory str) internal pure returns (uint256) {
        uint256 result = 0;
        bytes memory strBytes = bytes(str);
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            uint256 digit = uint256(uint8(strBytes[i])) - 48;
            result = result * 10 + digit;
        }
        
        return result;
    }

    function calculateDistanceAndEstimateTime(uint8 coordinate1X, uint8 coordinate1Y, uint8 coordinate2X, uint8 coordinate2Y, uint speed) internal pure returns (uint distance, uint estimatedTime) {
        // Calculate the Euclidean distance between the two coordinates using the Pythagorean theorem
        uint deltaX = coordinate2X > coordinate1X ? coordinate2X - coordinate1X : coordinate1X - coordinate2X;
        uint deltaY = coordinate2Y > coordinate1Y ? coordinate2Y - coordinate1Y : coordinate1Y - coordinate2Y;
        distance = sqrt(deltaX**2 + deltaY**2);

        // Estimate the time based on the predefined speed (distance / speed)
        estimatedTime = distance / speed;

        return (distance, estimatedTime);
    }
    

    function sqrt(uint x) internal pure returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }


}

error Lands__InvalidCoordinate();
error Lands__LandAlreadyMinted();
error Lands__InsufficientPrice();
error Lands__IncorrectPrice();
error Lands__MintLimitReached();
error Lands__LandNotForSale();
error Lands__LandAlreadyOwned();

contract Lands is ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {

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


    /// @notice What a parcel is. Type decides whether players may buy it and, in
    ///         Town, how it behaves once they do.
    /// @dev Appended-only: never reorder or remove members, since `typeOverride`
    ///      stores the numeric value.
    enum LandType { Town, Jungle }

    event LandTypeChanged(uint256 indexed tokenId, LandType landType);

    uint256 private defaultLandPrice; // Equal 0.02 ether

    /// @notice Lands one address may mint. A determined buyer can still spread the
    ///         purchase across wallets — this raises the cost of hoarding, it does
    ///         not prevent it.
    uint256 public constant MaxLandsPerAddress = 20;

    /// @notice Share of the map that starts as Jungle, in percent. The map is exactly
    ///         100x100 parcels, so this is about 1,000 of them.
    uint256 public constant JunglePercent = 10;

    mapping (address => uint256) public mintedPerAddress;

    string private baseURI;

    /// @notice Owner overrides of the natural type, stored as `type + 1` so that a
    ///         zero — the mapping default — means "no override" rather than Town.
    /// @dev Appended after baseURI on purpose: Lands sits behind a proxy, so new
    ///      state can only go at the end of the layout.
    mapping (uint256 => uint8) private typeOverride;
    // mapping (uint256 => Land) public tokenIdLand;
    // mapping (address => uint8) private difficultyCost;


    // struct Land {
    //     uint8 coordinateX;
    //     uint8 coordinateY;
    // }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************   Constructor  ********************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************




    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // Only the proxy may hold state; the implementation must stay uninitialised.
        _disableInitializers();
    }

    /// @dev Was a constructor. Behind a proxy the constructor runs against the
    ///      implementation's storage, so ERC721's name/symbol and the land price
    ///      would all have read back as empty through the proxy.
    function initialize(uint256 defaultPrice, address initialOwner) public initializer {
        __ERC721_init("Plot War Lands", "PWL");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        defaultLandPrice = defaultPrice;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}



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
    // modifier isExist (uint8 x, uint8 y){
    //     uint256 tokenId = StringUtils.concatenate(x, y);
    //     if ( _ownerOf(tokenId) != address(0)) {
    //         revert Lands__LandAlreadyMinted(); 
    //     }
    //     _;
    // }
    // Check if range of location coordinate is in authorized range.
    modifier isCorrectCoordinate (uint8 x, uint8 y) {
        if (x < 100 || x > 199 || y < 100 || y > 199) {
            revert Lands__InvalidCoordinate();
        }
        _;
    }


    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ***********************   External & public functions  ***********************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    /// @notice The parcel's type: an owner override if one was set, else the type
    ///         the map was born with.
    function landType(uint256 tokenId) public view returns (LandType) {
        uint8 overridden = typeOverride[tokenId];
        if (overridden != 0) {
            return LandType(overridden - 1);
        }
        return naturalType(tokenId);
    }

    /// @notice The type a parcel has before anyone touches it.
    /// @dev Pure, so the whole map is known before a single land is minted and the
    ///      frontend can colour it without one chain call. Roughly a tenth of the
    ///      10,000 parcels come out as Jungle.
    function naturalType(uint256 tokenId) public pure returns (LandType) {
        if (uint256(keccak256(abi.encode(tokenId))) % 100 < JunglePercent) {
            return LandType.Jungle;
        }
        return LandType.Town;
    }

    /// @notice Whether a player may buy this parcel right now.
    function isForSale(uint256 tokenId) public view returns (bool) {
        return landType(tokenId) == LandType.Town && _ownerOf(tokenId) == address(0);
    }

    /// @notice Owner of a parcel, or the zero address when nobody has minted it.
    /// @dev ERC721.ownerOf reverts for an unminted token in OpenZeppelin v5, so
    ///      callers that need to ask "does anyone own this?" cannot use it.
    function ownerOfOrZero(uint256 tokenId) external view returns (address) {
        return _ownerOf(tokenId);
    }

    // Mint new land by coordinate in x and y dimension
    function mintLand(uint8 x, uint8 y) external payable isCorrectCoordinate(x,y){
        // Exact payment, so overpayment can never be stranded in the contract and no
        // refund call has to run inside the mint path.
        if (msg.value != defaultLandPrice) {
            revert Lands__IncorrectPrice();
        }
        if (mintedPerAddress[msg.sender] + 1 > MaxLandsPerAddress) {
            revert Lands__MintLimitReached();
        }
        mintedPerAddress[msg.sender] += 1;

        uint256 tokenId = StringUtils.concatenate(x, y);
        // Wild parcels are not on the market until the owner unlocks them.
        if (landType(tokenId) != LandType.Town) {
            revert Lands__LandNotForSale();
        }
        _mint(msg.sender, tokenId);
        // tokenIdLand[tokenId] = Land(x,y);
    }







    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  **************************   Only owner functions  ***************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************

    /// @notice Retypes a parcel. Setting it to Town is what "unlocking" means: the
    ///         parcel joins the sellable supply.
    /// @dev Only ever reaches land nobody owns. Once a parcel is minted its type is
    ///      frozen for good, because Lands has no burn — so this is a one-way door
    ///      and no buyer can have the ground changed under them.
    function setLandType(uint256 tokenId, LandType newType) public onlyOwner {
        if (_ownerOf(tokenId) != address(0)) {
            revert Lands__LandAlreadyOwned();
        }
        typeOverride[tokenId] = uint8(newType) + 1;
        emit LandTypeChanged(tokenId, newType);
    }

    /// @notice Retypes several parcels at once. The caller picks the batch size, so
    ///         the block gas limit is the only bound.
    function setLandTypes(uint256[] calldata tokenIds, LandType newType) external onlyOwner {
        uint256 length = tokenIds.length;
        for (uint256 i = 0; i < length; i++) {
            setLandType(tokenIds[i], newType);
        }
    }

    function withdraw(address payable _to) external onlyOwner {
         uint256 balance = address(this).balance;
         require(balance > 0, "No balance to withdraw");
         // transfer() caps the callee at 2300 gas, which breaks withdrawals to
         // multisigs and smart wallets.
         (bool sent, ) = _to.call{value: balance}("");
         require(sent, "Withdraw failed");
    }

    function changePrice(uint256 price) external  onlyOwner{
        defaultLandPrice = price;
    }



    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  *****************************   View functions  ******************************
    //  ******************************************************************************
    //  ******************************************************************************
    //  ******************************************************************************


    // function getLand(uint256 tokenId) external view returns(Land memory) {
    //     return tokenIdLand[tokenId];
    // }

    function getPrice() view public returns (uint256) {
        return defaultLandPrice;
    }



    function URI () public view returns (string memory){
        return _baseURI();
    }

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        require(
            ownerOf(_tokenId) != address(0),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory currentBaseURI = _baseURI();

        // The token id must be part of the URI, otherwise every land shares one
        // metadata document and no marketplace can tell them apart.
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        "/",
                        StringUtils.toString(_tokenId),
                        ".json"
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

    // Claiming collected amount of an asset


    /// @notice Metadata root. Settable so the collection can be re-pinned without
    ///         shipping a new implementation.
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    function _baseURI() internal  view virtual override   returns (string memory) {
        return bytes(baseURI).length > 0
            ? baseURI
            : "https://gateway.pinata.cloud/ipfs/QmQjVmvqXn3qVTEZo1U6tJfvCAB85Uj5DnBaSbZRrNy7NE";
    }


receive() external payable {}
   
}
