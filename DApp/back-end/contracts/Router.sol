// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
pragma abicoder v2;
// @Author: Alireza Haghshenas 
// This contract is not completed yet ,is just an idea to make swaps with an stable price whithout care about liquidity or reserve
// Also ,in addition of USDC and MYTOKEN ,you can swap with ETH


import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { TransferHelper } from "./TransferHelper.sol";

contract StableDex is Ownable{

    AggregatorV3Interface internal nativeCoinPriceFeed;

    // *** Note that price should be amount with 8 decimals.
    uint256 private initialPrice = 5e6;
    bool private isExpired = false;
    address[] private assetsAddresses;

    IERC20[] commodities ;

    constructor( address priceFeedAddress) {
        nativeCoinPriceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier isExist(address enteredAddress) {
        bool isValid = false;
        for (uint i = 0; i < assetsAddresses.length; i++) {
            if (assetsAddresses[i] == enteredAddress) {
            isValid = true;
            break;
            }
        }
        require(isValid == true, "Invalid token");
        _;
    }

    modifier checkExpiration {
        require(isExpired == false, "Presale expired");
        _;
    }

    function switchExpiration() external onlyOwner {
        isExpired = !isExpired;
    }

    function changePrice(uint256 _newPrice) external onlyOwner{
        initialPrice = _newPrice;
    }

    function addToken(address newTokenAddress) external onlyOwner {
        assetsAddresses.push(newTokenAddress);
    }

    function buy (address tokenOut) external payable isExist(tokenOut) checkExpiration returns(uint256 amountOut) {
        require(msg.value > 0 , "Amount zero");
        uint256 nativeCoinPrice = getNativeCoinPrice();
        uint256 value = uint256(nativeCoinPrice) * msg.value;
        require(amountOut <= balanceOf(tokenOut), "Sold out");
        // Transfer token out to msg.sender
        IERC20(tokenOut).transfer(msg.sender, value/initialPrice);
    }

    function getNativeCoinPrice()public view returns (uint256) {
        (,int answer, , ,) = nativeCoinPriceFeed.latestRoundData();
        return uint256(answer);
    }
    
    function balanceOf(address tokenAddress) view public isExist(tokenAddress) returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
        
    }

    function validTokens() external view returns (address[] memory) {
        return (assetsAddresses);
    }

    function withdraw() external onlyOwner {
        TransferHelper.safeTransferETH(msg.sender,address(this).balance);
    }

    receive() external payable {}
   
}