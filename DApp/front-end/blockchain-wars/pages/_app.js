import { ThirdwebProvider, useAddress } from "@thirdweb-dev/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { ethers } from 'ethers';
import TestABI from "../Blockchain/Test.json"
import { useEffect, useState } from "react";
import { landsSepolia } from "../Blockchain/Addresses";
import Lands from "../Blockchain/LandsV1.json";

// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = "ethereum";

function MyApp({ Component, pageProps }) {

	const [address, setAddress] = useState()
	const [provider, setProvider] = useState()
	const [signer, setSigner] = useState()
	const [lands, setLands] = useState()
	const [castle, setCastle] = useState()
	const [landTokenId, setLandTokenId] = useState()
	const [landImgUrl, setLandImgUrl] = useState();
	const [landsInstance, setLandsInstance] = useState();
	const [isOwnedLand, setIsOwnedLand] = useState(false)
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
	  setLandsInstance(lands)
      const imgURL = await lands.URI();
      setLandImgUrl(imgURL);
	  if (address) {
		const landBalance = await lands.balanceOf(address)
		if (landBalance > 0) {
			setIsOwnedLand(true)
			console.log(`User owned ${landBalance.toString()} land`);
		}
	  }

    };
    fetchData();
  }, [ address]);

//   const address = useAddress();
//   useEffect(() => {
//     console.log(address);
//   }, []);

  
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
    >
      <Navbar setAddress={setAddress} setIsOwnedLand={setIsOwnedLand}/>
      <Component {...pageProps} connectReq={connectReq} provider={provider} landImgUrl={landImgUrl} />
    </ThirdwebProvider>
  );
}

export default MyApp;
