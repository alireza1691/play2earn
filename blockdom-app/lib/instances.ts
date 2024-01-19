"use client";
import { ethers} from "ethers";
import { landsAddress, landsMainnetAddress, townAddress, townMainnetAddress, tokenAddress } from "./blockchainData";
import  landsAbiJsonFile  from "../abis/landsABI.json";
import  townAbiJsonFile from "../abis/townAbi.json";
import tokenABI from "../abis/BMT.json"



type Signer = ethers.Signer;
export const provider = new ethers.providers.JsonRpcProvider(
  // `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
  `https://sepolia.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
);

export const mainnetProvider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mainnet.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
)
// export const address = useAddress()
// export const signer = useSigner()
// export const chainId = useChainId()

export const landsABI = landsAbiJsonFile.abi
export const townABI = townAbiJsonFile.abi
export const BMTABI = tokenABI.abi

export const bmtPInst = new ethers.Contract(tokenAddress, BMTABI, provider);

export const landsPInst = new ethers.Contract(landsAddress, landsABI, provider);
export const landsMainnetPInst = new ethers.Contract(landsMainnetAddress, landsABI, mainnetProvider);

export const townPInst = new ethers.Contract(townAddress, townABI, provider);
export const townMainnetPInst = new ethers.Contract(townMainnetAddress, townABI, provider);


export const landsMainnetSInst = (signer: Signer) => {
  const instance =new ethers.Contract(landsMainnetAddress, landsABI, signer);
return instance
};
export const landsSInst = (signer: Signer) => {
    const instance =new ethers.Contract(landsAddress, landsABI, signer);
  return instance
};
export const townMainnetSInst = (signer: Signer) => {
  const instance = new ethers.Contract(townMainnetAddress, townABI, signer);
return instance
};
export const townSInst = (signer: Signer) => {
  const instance = new ethers.Contract(townAddress, townABI, signer);
return instance
};

export const BMTSInst = (signer: Signer) => {
  const instance = new ethers.Contract(tokenAddress, BMTABI, signer);
return instance
};

