import { ThirdwebProvider, useAddress, useSigner } from "@thirdweb-dev/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Head from 'next/head';

import { ethers } from "ethers";
import {
  Sepolia,

  LineaTestnet
} from "@thirdweb-dev/chains";

import { useEffect, useState } from "react";
import {landsV2, LandsABI, townV2, TownABI} from "../Blockchain/index";
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
import { apiCall, getMintedLandsFromEvents, getConnectedAddressLands, getTypes } from "../utils";
// require("dotenv").config()
// dotenv.config();


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


  const [landImgUrl, setLandImgUrl] = useState();
  const [ownedLands, setOwnedLands] = useState();
  const [landObj, setLandObj] = useState([]);
  const [mintedLands, setMintedLands] = useState();
  const [response, setResponse] = useState();
  const [target, setTarget] = useState(0)
  const [existedWarriors, setExistedWarriors] = useState()
  const [existedBuildings, setExistedBuildings] = useState()
 


 

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
      <Navbar setOwnedLands={setOwnedLands} setLandObj={setLandObj} setMintedLands={setMintedLands} setExistedWarriors={setExistedWarriors} provider={provider} />

      <Component
        {...pageProps}
        // connectReq={connectReq}
        provider={provider}
        landImgUrl={landImgUrl}
        ownedLands={ownedLands}
        landObj={landObj}
        mintedLands={mintedLands}
        target={target}
        setTarget={setTarget}
        existedWarriors={existedWarriors}
        existedBuildings={existedBuildings}
      />
      <Footer/>
    </ThirdwebProvider>
  );
}

export default MyApp;
