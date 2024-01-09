//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


// import { Town } from "./Town.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

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

abstract contract Lands is ERC721, Ownable {

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


    uint256 private constant defaultLandPrice = 1 gwei; 
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




    constructor() ERC721("Blockdom lands","BML") {
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


    // Mint new land by coordinate in x and y dimension
    function mintLand(uint8 x, uint8 y) external payable isCorrectCoordinate(x,y){
        if (msg.value < defaultLandPrice) {
            revert Lands__InsufficientPrice();
        }

        uint256 tokenId = StringUtils.concatenate(x, y);
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

    function getPrice() pure public returns (uint256) {
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

        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(    
                        // StringUtils.toString(tokenIdLand[_tokenId].coordinateX) ,
                        // StringUtils.toString(tokenIdLand[_tokenId].coordinateY),
                        // StringUtils.toString(tokenIdLand[_tokenId].level) ,
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

    // Claiming collected amount of an asset


    function _baseURI() internal  view virtual override   returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/QmQjVmvqXn3qVTEZo1U6tJfvCAB85Uj5DnBaSbZRrNy7NE";
    }


   
}
