"use client"
import { ethers } from "ethers";
import { landsAddress } from "./blockchainData";
import { abi as landsABI} from "../abis/landsABI.json"
import { useAddress, useChain, useChainId, useSigner } from "@thirdweb-dev/react";

export const provider =  new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
);
export const address = useAddress()
export const signer = useSigner()
export const chainId = useChainId()

export const landsPInst = new ethers.Contract(landsAddress, landsABI, provider )
export const landsSInst = new ethers.Contract(landsAddress, landsABI, signer )