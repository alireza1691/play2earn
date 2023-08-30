//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

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
    // function getFirstTwoLetters(string memory input) internal pure returns (uint8) {
    //     bytes memory inputBytes = bytes(input);
        
    //     require(inputBytes.length >= 2, "Input string should have at least two characters");
        
    //     bytes2 firstTwoBytes;
    //     assembly {
    //         firstTwoBytes := mload(add(inputBytes, 32))
    //     }

    //     uint8 firstLetter = uint8(firstTwoBytes[0]);
    //     uint8 secondLetter = uint8(firstTwoBytes[1]);
    //     uint8 combinedLetters = (firstLetter << 4) | secondLetter;

        
    //     return combinedLetters;
    // }

    // function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
    //     bytes memory strBytes = bytes(str);
    //     require(startIndex <= endIndex && endIndex < strBytes.length, "Invalid substring range");

    //     bytes memory result = new bytes(endIndex - startIndex + 1);
    //     for (uint i = startIndex; i <= endIndex; i++) {
    //         result[i - startIndex] = strBytes[i];
    //     }

    //     return string(result);
    // }
    // function substring(string memory str, uint startIndex) internal pure returns (string memory) {
    //     return substring(str, startIndex, bytes(str).length - 1);
    // }

    // function convertFirstLetterToUint8(string memory input) internal pure returns (uint8) {
    //     require(bytes(input).length > 0, "Empty string");

    //     bytes memory firstLetterBytes = bytes(input);
    //     uint8 firstLetterAscii = uint8(firstLetterBytes[0]);
    //     uint8 firstLetterNumeric = firstLetterAscii - 48;


    //     return firstLetterNumeric;
    // }
    // function convertTimestampLettersToUint(string memory input) internal pure returns (uint256) {
    //     require(bytes(input).length >= 4, "Input string should have at least 4 characters");

    //     bytes memory inputBytes = bytes(input);
    //     uint256 convertedUint;

    //     for (uint256 i = 3; i < inputBytes.length; i++) {
    //         uint8 charValue = uint8(inputBytes[i]) - 48; // Convert ASCII value to numeric value
    //         convertedUint = convertedUint * 10 + charValue;
    //     }

    //     return convertedUint;
    // }

    // function replaceFirstLetterWithNumber(string memory input, uint8 number) internal pure returns (string memory) {
    //     require(bytes(input).length > 0, "Empty string");

    //     // string memory numberStr = toString(number);
    //     bytes memory inputBytes = bytes(input);

    //     inputBytes[0] = bytes1(number);

    //     // bytes memory result = new bytes(inputBytes.length);
    //     // result[0] = bytes1(numberStr[0]);

    //     return string(inputBytes);
    // }
    // function removeCharacterAtIndex(string memory input, uint index) internal pure returns (string memory) {
    //     require(index < bytes(input).length, "Invalid index");

    //     bytes memory inputBytes = bytes(input);
    //     bytes memory result = new bytes(inputBytes.length - 1);

    //     for (uint i = 0; i < index; i++) {
    //         result[i] = inputBytes[i];
    //     }

    //     for (uint i = index + 1; i < inputBytes.length; i++) {
    //         result[i - 1] = inputBytes[i];
    //     }

    //     return string(result);
    // }

// function attachLetterAtIndex(string memory input, uint index, string memory letter) internal pure returns (string memory) {
//     require(index <= bytes(input).length, "Invalid index");

//     bytes memory inputBytes = bytes(input);
//     bytes memory letterBytes = bytes(letter);
//     bytes memory result = new bytes(inputBytes.length + letterBytes.length);

//     for (uint i = 0; i < index; i++) {
//         result[i] = inputBytes[i];
//     }

//     for (uint i = 0; i < letterBytes.length; i++) {
//         result[index + i] = letterBytes[i];
//     }

//     for (uint i = index; i < inputBytes.length; i++) {
//         result[i + letterBytes.length] = inputBytes[i];
//     }

//     return string(result);
// }

}