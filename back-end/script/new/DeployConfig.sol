// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

/// @notice Per-network deployment settings, keyed by chain id.
///
/// @dev Kept out of the script so the numbers that differ between Base and
///      Sepolia sit in one readable place, and so `Deploy.t.sol` can assert on
///      them without running a broadcast.
library DeployConfig {
    struct NetworkConfig {
        string name;
        /// @dev Stocks 101101/105105/109109 with goods and level-2 buildings.
        ///      Testnet only: on a live chain these are an unearned head start
        ///      for whoever mints those three coordinates first.
        bool seedTestLands;
        /// @dev Price of a land, in the chain's native token.
        uint256 landPrice;
        /// @dev Opening pool depth. goods = 2x plot puts the starting rate at
        ///      1 PLOT = 2 goods; the AMM moves it from there.
        uint256 poolPlot;
        uint256 poolGoods;
        /// @dev Turns on the guards that stop a testnet-shaped deploy from
        ///      reaching a chain where the mistake costs real money.
        bool isProduction;
    }

    uint256 internal constant BASE = 8453;
    uint256 internal constant BASE_SEPOLIA = 84532;
    uint256 internal constant SEPOLIA = 11155111;
    uint256 internal constant ANVIL = 31337;

    error UnsupportedChain(uint256 chainId);

    function forChain(uint256 chainId) internal pure returns (NetworkConfig memory) {
        if (chainId == BASE) {
            return NetworkConfig({
                name: "base",
                seedTestLands: false,
                // Base is an L2 on ETH: 0.002 ETH is a few dollars a land.
                landPrice: 0.002 ether,
                poolPlot: 25_000_000 ether,
                poolGoods: 50_000_000 ether,
                isProduction: true
            });
        }
        if (chainId == BASE_SEPOLIA) {
            return NetworkConfig({
                name: "base-sepolia",
                seedTestLands: true,
                landPrice: 0.002 ether,
                poolPlot: 25_000_000 ether,
                poolGoods: 50_000_000 ether,
                isProduction: false
            });
        }
        if (chainId == SEPOLIA) {
            return NetworkConfig({
                name: "sepolia",
                seedTestLands: true,
                // A quarter of the old 0.02: minting is the first thing a
                // tester does, and a Sepolia faucet does not go far.
                landPrice: 0.005 ether,
                poolPlot: 25_000_000 ether,
                poolGoods: 50_000_000 ether,
                isProduction: false
            });
        }
        if (chainId == ANVIL) {
            return NetworkConfig({
                name: "anvil",
                seedTestLands: true,
                landPrice: 0.005 ether,
                poolPlot: 25_000_000 ether,
                poolGoods: 50_000_000 ether,
                isProduction: false
            });
        }
        revert UnsupportedChain(chainId);
    }
}
