// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.23;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Plot War's game token.
///
/// @dev The whole supply is minted once, to the deployer, and there is deliberately
///      no mint function afterwards — the supply can only ever shrink or sit still.
///      The previous version had no mint at all, so totalSupply was zero and
///      `Town.deposit` could never succeed.
///
///      The original also had name and symbol swapped.
contract PLOT is ERC20 {
    uint256 public constant InitialSupply = 1_000_000_000 ether;

    constructor(address treasury) ERC20("Plot War Token", "PLOT") {
        require(treasury != address(0), "PLOT: zero treasury");
        _mint(treasury, InitialSupply);
    }
}
