import { ThirdwebProvider, useAddress, useSigner } from "@thirdweb-dev/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { ethers } from "ethers";
import { Mumbai, Polygon, Sepolia, Ethereum, Arbitrum} from "@thirdweb-dev/chains"
import TestABI from "../Blockchain/Test.json";
import { useEffect, useState } from "react";
import { landsSepolia } from "../Blockchain/Addresses";
import Lands from "../Blockchain/Lands.json";
import axios from "axios";
import dotenv from "dotenv";
import {
	metamaskWallet,
	coinbaseWallet,
	walletConnect,
  } from "@thirdweb-dev/react";

// dotenv.config();
require("dotenv").config();
// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
// const activeChain = "ethereum";

function MyApp({ Component, pageProps }) {
  const apiKey = process.env.SEPOLIA_API_KEY;
  const infuraApiKey = process.env.INFURA_API_KEY;

  const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/39df69a3ab1e421fb82c438fac837565`
  );

  const [address, setAddress] = useState();
  const [signer, setSigner] = useState();
  const [lands, setLands] = useState();
  const [castle, setCastle] = useState();
  const [landTokenId, setLandTokenId] = useState();
  const [landImgUrl, setLandImgUrl] = useState();
  const [ownedLands, setOwnedLands] = useState();
  const [landObj, setLandObj] = useState([]);
//   const [connectedAddressLands, setConnectedAddressLands] = useState([]);
  const [mintedLands, setMintedLands] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [response, setResponse] = useState()

  // const contract = new ethers.Contract("0xB223692473310018eD9Aec48cBAE98f99484a0E4", TestABI, infuraProvider);

  // async function callViewFunction() {
  // 	try {
  // 	  const result = await contract.store(1);
  // 	  console.log('View function result:', result);
  // 	} catch (error) {
  // 	  console.error('Error A:', error);
  // 	}
  //   }

  //   callViewFunction()

  const convertAddress = (input) => {
    if (input.length > 3) {
      const prefix = input.substring(0, 2);
      const suffix = input.substring(2);
      const zeros = "000000000000000000000000";
      return prefix + zeros + suffix;
    }
  };

//   const connectReq = async () => {
//     if (typeof window.ethereum !== "undefined") {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const network = await provider.getNetwork();

//       if (network.chainId !== Sepolia.chainId) {
//         const hexStringChainId =
//           "0x" + parseInt(Sepolia.chainId).toString(16);
//         await window.ethereum.request({
//           method: "wallet_addEthereumChain",
//           params: [
//             {
//             //   chainId: hexStringChainId,
//             //   rpcUrls: ["https://polygon.llamarpc.com"],
//             //   chainName: "Polygon Mainnet",
// 			chainId: hexStringChainId,
// 			rpcUrls: ["https://sepolia.infura.io/v3/"],
// 			chainName: "Sepolia test network",
//             },
//           ],
//         });
//         if (network.chainId == Sepolia.chainId) {
//           location.reload();
//         }
//       }
//       console.log("Connected!");
//       return provider;
//     } else {
//       return null;
//     }
//   };


const dataLoad = async () => {
	let events = []
	let mintedLands = [];
	try {
	  const response = await axios.get(
		`https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsSepolia}&apikey=${apiKey}`
	  );
	  console.log(response);
	  setResponse(response)
	  events = response.data.result;
	  console.log(events);
	  for (let index = 0; index < events.length; index++) {
		const topics = events[index].topics;
  
		if (
		  Array.isArray(topics) &&
		  topics.length === 4 &&
		  topics[1] ===
			"0x0000000000000000000000000000000000000000000000000000000000000000" &&
		  100 <= parseInt(topics[3], 16) <= 200
		) {
			let ownerAddress = topics[2].replace("000000000000000000000000", "");
			console.log("Onwer of land with token id:",(topics[3], 16).toString(),"is:",ownerAddress);
		  mintedLands.push({tokenId: parseInt(topics[3], 16).toString(), owner: ownerAddress});
		}
	  }
	  setMintedLands(mintedLands);
	  console.log(mintedLands);
	} catch (error) {
	  console.error("Error fetching contract events:", error);
	}
  };

  useEffect(() => {
    const fetchData = async () => {
      const lands = new ethers.Contract(landsSepolia, Lands.abi, provider);
      const imgURL = await lands.URI();
      setLandImgUrl(imgURL);
      if (address) {
		// dataLoad()
        // console.log(convertAddress(address));
        const landBalance = await lands.balanceOf(address);
        setOwnedLands(landBalance);
        if (landBalance > 0) {
          console.log(`User owned ${landBalance.toString()} land`);
          let mintedLands = [];
        //   let tokenIds = [];
          let landObject = [];
		  let counter = 1
          try {
            const response = await axios.get(
              // `https://api-testnet.polygonscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${contractsWithBalance[i].contractAddress}&apikey=${apiKey}`
              `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsSepolia}&apikey=${apiKey}`
            );
            console.log("Fetched events");
            // setIsDataLoaded(true);
				console.log(response);
            // console.log(response);
            const events = response.data.result;
            for (let index = 0; index < events.length; index++) {
              const topics = events[index].topics;
              // console.log(topics);
              if (Array.isArray(topics) &&
                topics.length === 4 &&
                topics[2] == convertAddress(address.toLowerCase())
              ) {
                // console.log(parseInt(topics[3],16));
                // tokenIds.push(parseInt(topics[3], 16));
				const commoditiesBalance = await lands.getAssetsBal(parseInt(topics[3], 16))
   
                const landInfo = {
                  stone: ethers.utils.formatEther(commoditiesBalance[0].toString()),
                  wood: ethers.utils.formatEther(commoditiesBalance[1].toString()),
                  iron: ethers.utils.formatEther(commoditiesBalance[2].toString()),
                  gold: ethers.utils.formatEther(commoditiesBalance[3].toString()),
                  food: ethers.utils.formatEther(commoditiesBalance[4].toString()),
				  coordinate: parseInt(topics[3], 16)
                };
                landObject.push(landInfo);
                // console.log(landBalances);
				counter ++
              }
              if (Array.isArray(topics) &&
                topics.length === 4 &&
                topics[1] ==
                  "0x0000000000000000000000000000000000000000000000000000000000000000" &&
                100 <= parseInt(topics[3], 16) <= 200
              ) {
				let ownerAddress = topics[2].replace("000000000000000000000000", "");
                mintedLands.push({tokenId: parseInt(topics[3], 16).toString(),owner: ownerAddress});
                console.log(topics[2]);
              }
		
            }
          } catch (error) {
            console.error("Error fetching contract events:", error);
          }
        //   console.log(landObject);
        //   setConnectedAddressLands(tokenIds);
		//   console.log("Connected address owned these lands:",tokenIds);
          setLandObj(landObject);
          setMintedLands(mintedLands);
		  console.log("Here is minted lands:",mintedLands);
		  console.log("Connected address owned these lands:",landObject);
        }
	}
    };
    fetchData();
  }, [address]);

  return (
    <ThirdwebProvider
    //   activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
	  supportedWallets={[metamaskWallet(), coinbaseWallet(), walletConnect()]}
	  supportedChains={[Sepolia]}
	  dAppMeta={{
        name: "Blockchain wars",
        description: "Stategic & decentralized play to earn game based on nft",
        logoUrl: "https://example.com/logo.png",
        url: "https://example.com",
        isDarkMode: false,
      }}
    >
      <Navbar setAddress={setAddress} />
      <Component
        {...pageProps}
        // connectReq={connectReq}
        provider={provider}
        landImgUrl={landImgUrl}
        ownedLands={ownedLands}
        landObj={landObj}
        mintedLands={mintedLands}
		dataLoad={dataLoad}
		// connectedAddressLands={connectedAddressLands}
      />
    </ThirdwebProvider>
  );
}

export default MyApp;
