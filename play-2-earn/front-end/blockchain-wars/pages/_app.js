import { ThirdwebProvider, useAddress, useSigner } from "@thirdweb-dev/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Head from 'next/head';

import { ethers } from "ethers";
import {
  Mumbai,
  Polygon,
  Sepolia,
  Ethereum,
  Arbitrum,
  Linea,
  LineaTestnet
} from "@thirdweb-dev/chains";

import { useEffect, useState } from "react";
import {barracks, lands, landsV2, town, townV1, townV2 } from "../Blockchain/Addresses";
import LandsV2 from "../Blockchain/LandsV2.json";
import TownV2 from "../Blockchain/TownV2.json";
import axios from "axios";
import { config } from 'dotenv';
config();

import {
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  trustWallet,
  safeWallet,
  rainbowWallet
} from "@thirdweb-dev/react";
import Footer from "../components/Footer"
import { apiCall, fetchLandsData, getMintedLandsFromEvents } from "../utils";
// require("dotenv").config()
// dotenv.config();
// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
// const activeChain = "ethereum";

function MyApp({ Component, pageProps }) {
  // const apiKey = process.env.ETHERSCAN_SEPOLIA_API_KEY;
  const apiKey = "7XZM1XPQTW8WHHCW7KUY8BPUUSKPHPSE6T"
  // const apiKey = process.env.LINEA_API_KEY;
  // const infuraApiKey = process.env.INFURA_API_KEY;
  const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
  );
  // const provider = new ethers.providers.JsonRpcProvider(
  //   `https://linea-goerli.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
  // );

  const [address, setAddress] = useState();
  const [landImgUrl, setLandImgUrl] = useState();
  const [ownedLands, setOwnedLands] = useState();
  const [landObj, setLandObj] = useState([]);
  const [mintedLands, setMintedLands] = useState();
  const [response, setResponse] = useState();
  const [target, setTarget] = useState(0)
  const [existedWarriors, setExistedWarriors] = useState()

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


 
  useEffect( () => {

    const fetchData = async () => {
      console.log(provider);
      const events = await apiCall()
      const mintedLands = await getMintedLandsFromEvents(events)
      setMintedLands(mintedLands)
      // if (address) {
      //   const landsInst = new ethers.Contract(landsV2, LandsV2.abi, provider);
      //   // const townInst = new ethers.Contract(townV2, TownV2.abi, provider);
      //   const landBalance = await landsInst.balanceOf(address);
      //   if (landBalance > 0) {
      //     const connectedAddressLands = await connectedAddressLands(events, address)
      //     setLandObj(connectedAddressLands)
      //   }
      // }

    };
    fetchData();
  }, []);

  return (
    <ThirdwebProvider
      //   activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      supportedWallets={[metamaskWallet(), coinbaseWallet(), walletConnect(), trustWallet(), safeWallet(), rainbowWallet()]}
      supportedChains={[Sepolia, LineaTestnet ]}
      dAppMeta={{
        name: "Blockchain wars",
        description: "Stategic & decentralized play to earn game based on nft",
        logoUrl: "https://example.com/logo.png",
        url: "https://example.com",
        isDarkMode: false,
      }}
    >
            <Head>
  <link rel="icon" href="/BlockdomLogo.ico" />
</Head>
      <Navbar setAddress={setAddress}/>

      <Component
        {...pageProps}
        // connectReq={connectReq}
        provider={provider}
        landImgUrl={landImgUrl}
        ownedLands={ownedLands}
        landObj={landObj}
        mintedLands={mintedLands}
        // dataLoad={dataLoad}
        target={target}
        setTarget={setTarget}
        existedWarriors={existedWarriors}
      />
      <Footer/>
    </ThirdwebProvider>
  );
}

export default MyApp;
