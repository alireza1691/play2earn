//SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @notice Proxy for the UUPS `Lands` and `Town` implementations.
///
/// @dev Replaces the previous TransparentUpgradeableProxy wrapper, which had three
///      separate problems:
///        1. it declared `address private implementation`, putting a state variable
///           in slot 0 of the proxy where it collided with the implementation's own
///           slot 0;
///        2. it passed `abi.encodeWithSignature("initialize()")` as the constructor
///           call, but `Lands` had no such function, so deployment reverted;
///        3. its own `initialize()` was `internal` and lived on the proxy rather
///           than the implementation, so it could never have run.
///
///      Upgrade authority now sits in the implementations themselves
///      (`_authorizeUpgrade` is `onlyOwner`), so no ProxyAdmin is involved and this
///      contract deliberately holds no storage of its own.
contract LandsProxy is ERC1967Proxy {
    /// @param implementation Address of the `Lands` (or `Town`) logic contract.
    /// @param initData ABI-encoded call to the implementation's `initialize`,
    ///        executed against this proxy's storage during construction.
    constructor(address implementation, bytes memory initData)
        ERC1967Proxy(implementation, initData)
    {}
}
