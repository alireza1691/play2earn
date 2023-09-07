import { ThirdwebProvider, useAddress, useSigner } from "@thirdweb-dev/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { ethers } from 'ethers';
import TestABI from "../Blockchain/Test.json"
import { useEffect, useState } from "react";
import { landsSepolia } from "../Blockchain/Addresses";
import Lands from "../Blockchain/LandsV1.json";
import axios from "axios";
import dotenv from "dotenv"
dotenv.config();
// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = "ethereum";

function MyApp({ Component, pageProps }) {

	const apiKey = process.env.SEPOLIA_API_KEY

	const [address, setAddress] = useState()
	const [provider, setProvider] = useState()
	const [signer, setSigner] = useState()
	const [lands, setLands] = useState()
	const [castle, setCastle] = useState()
	const [landTokenId, setLandTokenId] = useState()
	const [landImgUrl, setLandImgUrl] = useState();
	const [ownedLands, setOwnedLands] = useState()
	const [commoditiesBalance, setCommoditiesBalance] = useState([{}])
	const [connectedAddressLands, setConnectedAddressLands] = useState([])
	const [mintedLands, setMintedLands] = useState([])
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
		const zeros = '000000000000000000000000';
		return prefix + zeros + suffix;
		}
	}


	const connectReq = async () => {
		if (typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const network = await provider.getNetwork();
	
		if (network.chainId !== Polygon.chainId) {
			const mainnetHexStringChainId =
			"0x" + parseInt(Polygon.chainId).toString(16);
			await window.ethereum.request({
			method: "wallet_addEthereumChain",
			params: [
				{
				chainId: mainnetHexStringChainId,
				rpcUrls: ["https://polygon.llamarpc.com"],
				chainName: "Polygon Mainnet",
				},
			],
			});
			if (network.chainId == Polygon.chainId) {
			location.reload();
			}
		}
		console.log("Connected!");
		return provider;
		} else {
		return null;
		}
	};

  useEffect(() => {
    const fetchData = async () => {
		const infuraProvider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/39df69a3ab1e421fb82c438fac837565');
		setProvider(infuraProvider)
      const lands = new ethers.Contract(
        landsSepolia,
        Lands.abi,
        infuraProvider
      );
      const imgURL = await lands.URI();
      setLandImgUrl(imgURL);
	  if (address) {
		console.log(convertAddress(address));
		const landBalance = await lands.balanceOf(address)
		setOwnedLands(landBalance)
		if (landBalance > 0) {
	
			console.log(`User owned ${landBalance.toString()} land`);
			let mintedLands = []
			let tokenIds = []
			let commoditiesBal = []
			try {
				const response = await axios.get(
					// `https://api-testnet.polygonscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${contractsWithBalance[i].contractAddress}&apikey=${apiKey}`
					`https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsSepolia}&topic2=${convertAddress(address)}&apikey=${apiKey}`
				);
				console.log("Fetched events");
				// console.log(response);
				const events = response.data.result;
				for (let index = 0; index < events.length; index++) {
					const topics = events[index].topics
					// console.log(topics);
					if (topics.length === 4
						 && topics[2] == convertAddress(address.toLowerCase())
						 ) {
						// console.log(parseInt(topics[3],16));
						tokenIds.push(parseInt(topics[3],16))
						const stoneBal = await lands.getAssetBal(parseInt(topics[3],16),0)
						const woodBal = await lands.getAssetBal(parseInt(topics[3],16),1)
						const ironBal = await lands.getAssetBal(parseInt(topics[3],16),2)
						const goldBal = await lands.getAssetBal(parseInt(topics[3],16),3)
						const foodBal = await lands.getAssetBal(parseInt(topics[3],16),4)
						const landBalances = {stone: ethers.utils.formatEther(stoneBal.toString()), wood: ethers.utils.formatEther(woodBal.toString()), iron: ethers.utils.formatEther(ironBal.toString()), gold: ethers.utils.formatEther(goldBal.toString()), food: ethers.utils.formatEther(foodBal.toString())}
						commoditiesBal.push(landBalances)
						// console.log(landBalances);
					}
					if (topics.length === 4 &&
						topics[1] == "0x0000000000000000000000000000000000000000000000000000000000000000" &&
						100 <= parseInt(topics[3],16) <= 200
						) {
							mintedLands.push(parseInt(topics[3],16).toString())
					}
				}
			} catch (error) {
				console.error("Error fetching contract events:", error);
			}
			// console.log(commoditiesBal);
			setConnectedAddressLands(tokenIds)
			setCommoditiesBalance(commoditiesBal)
			setMintedLands(mintedLands)
		}
	  }

    };
    fetchData();
  }, [ address]);


  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
    >
      <Navbar setAddress={setAddress} />
      <Component {...pageProps} connectReq={connectReq} provider={provider} landImgUrl={landImgUrl} ownedLands={ownedLands} commoditiesBalance={commoditiesBalance} mintedLands={mintedLands}/>
    </ThirdwebProvider>
  );
}

export default MyApp;
