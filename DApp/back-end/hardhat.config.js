require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy")
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_SEPOLIA_API_KEY2
const PRIVATE_KEY = process.env.PRIVATE_KEY
const SEPOLIA_RPC_URL = process.env.ALCHEMY_SEPOLIA_RPC

const MAINNET_CHAINID = ""
const MAINNET_RPC_URL = ""

// || "https://eth-sepolia.g.alchemy.com/v2/tL-Nt86AOAa-kjgZH5Nrk96ONotIjRvm"
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: 
  {
    sepolia: {
      url: SEPOLIA_RPC_URL ,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      //   accounts: {
      //     mnemonic: MNEMONIC,
      //   },
      saveDeployments: true,
      chainId: 11155111,
  },

//   mainnet: {
//     url: MAINNET_RPC_URL,
//     accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
//     //   accounts: {
//     //     mnemonic: MNEMONIC,
//     //   },
//     saveDeployments: true,
//     chainId: 1,
// },
  },

  etherscan: {
    // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
        sepolia: ETHERSCAN_API_KEY,
    },
},
};
