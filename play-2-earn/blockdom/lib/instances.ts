"use client";
import { ethers } from "ethers";
import { landsAddress } from "./blockchainData";
import  landsAbiJsonFile  from "../abis/landsABI.json";
import  townAbiJsonFile from "../abis/townAbi.json";



type Signer = ethers.Signer;
export const provider = new ethers.providers.JsonRpcProvider(
  // `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
  `https://sepolia.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
);
// export const address = useAddress()
// export const signer = useSigner()
// export const chainId = useChainId()

export const landsPInst = new ethers.Contract(landsAddress, landsAbiJsonFile.abi, provider);

export const landsSInst = (signer: Signer) => {
    const instance =new ethers.Contract(landsAddress, landsAbiJsonFile.abi, signer);
  return instance
};
