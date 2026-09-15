"use client";
import { ethers} from "ethers";
import { landsAddress, landsMainnetAddress, townAddress, townMainnetAddress, tokenAddress } from "./blockchainData";
import  landsAbiJsonFile  from "../abis/landsABI.json";
import  townAbiJsonFile from "../abis/townAbi.json";
import tokenABI from "../abis/BMT.json"
import townV4Abi from "../abis/v4/townAbi.json";
import landsV4Abi from "../abis/v4/landsABI.json";
import plotV4Abi from "../abis/v4/PLOT.json";
import townV5Abi from "../abis/v5/townAbi.json";
import landsV5Abi from "../abis/v5/landsABI.json";
import plotV5Abi from "../abis/v5/PLOT.json";
import { Deployment } from "./deployments";
import { landsV4Address, tokenV4Address, townV4Address } from "./blockchainData";
import { landsV5Address, tokenV5Address, townV5Address, v5Deployed } from "./blockchainData";



type Signer = ethers.Signer;
export const provider = new ethers.providers.JsonRpcProvider(
  // `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
  `https://sepolia.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
);

export const mainnetProvider = new ethers.providers.JsonRpcProvider(
  `https://base-mainnet.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
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



/*  ****************************************************************
                              v4 deployment
    ****************************************************************  */

/**
 * The rewritten contracts, live on Sepolia at their own addresses. Kept beside
 * the v3 instances rather than replacing them so both deployments stay usable:
 * /explore and /testnet/explore keep talking to the old ones, /v4/... to these.
 */
/**
 * Selectors the live v4 deployment still answers to but `src/new` has since
 * renamed. The contracts on Sepolia were deployed before the PLOT rebrand, so
 * they expose `getBMTbalance`; the source now calls it `getPlotBalance`.
 *
 * Carrying both means the app works either side of the redeploy. Delete this once
 * v4 has been redeployed from current source.
 */
const LEGACY_V4_FRAGMENTS = [
  {
    type: "function",
    name: "getBMTbalance",
    stateMutability: "view",
    inputs: [{ name: "userAddress", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

export const townV4ABI = [
  ...((townV4Abi as { abi: unknown[] }).abi),
  ...LEGACY_V4_FRAGMENTS,
] as ethers.ContractInterface;
export const landsV4ABI = (landsV4Abi as { abi: unknown }).abi as ethers.ContractInterface;
export const PLOTV4ABI = (plotV4Abi as { abi: unknown }).abi as ethers.ContractInterface;

export const townV4PInst = new ethers.Contract(townV4Address, townV4ABI, provider);
export const landsV4PInst = new ethers.Contract(landsV4Address, landsV4ABI, provider);
export const plotV4PInst = new ethers.Contract(tokenV4Address, PLOTV4ABI, provider);

export const townV4SInst = (signer: Signer) =>
  new ethers.Contract(townV4Address, townV4ABI, signer);
export const landsV4SInst = (signer: Signer) =>
  new ethers.Contract(landsV4Address, landsV4ABI, signer);
export const PLOTV4SInst = (signer: Signer) =>
  new ethers.Contract(tokenV4Address, PLOTV4ABI, signer);

/*  ****************************************************************
                              v5 deployment
    ****************************************************************  */

/**
 * v5: the rewrite carried forward. Same shape as v4, its own addresses and its
 * own ABI — the trade functions gained a fourth argument, so the two ABIs are
 * genuinely not interchangeable and each deployment must use its own.
 *
 * No legacy fragments here: v5 is deployed from current source, so the getter
 * names match. (v4 still needs its shim because it predates the PLOT rebrand.)
 */
export const townV5ABI = (townV5Abi as { abi: unknown }).abi as ethers.ContractInterface;
export const landsV5ABI = (landsV5Abi as { abi: unknown }).abi as ethers.ContractInterface;
export const PLOTV5ABI = (plotV5Abi as { abi: unknown }).abi as ethers.ContractInterface;

/**
 * Until v5 is broadcast its addresses are empty strings, which ethers would
 * turn into the zero address — a contract that answers every read with zero
 * rather than failing. Falling back to the v4 address keeps the routes usable
 * and honest: `v5Deployed` is false, the switcher says so, and nothing silently
 * reports an empty world as real.
 */
const v5Or4 = (v5: string, v4: string) => (v5Deployed && v5 ? v5 : v4);

export const townV5PInst = new ethers.Contract(
  v5Or4(townV5Address, townV4Address),
  v5Deployed ? townV5ABI : townV4ABI,
  provider
);
export const landsV5PInst = new ethers.Contract(
  v5Or4(landsV5Address, landsV4Address),
  v5Deployed ? landsV5ABI : landsV4ABI,
  provider
);
export const plotV5PInst = new ethers.Contract(
  v5Or4(tokenV5Address, tokenV4Address),
  v5Deployed ? PLOTV5ABI : PLOTV4ABI,
  provider
);

export const townV5SInst = (signer: Signer) =>
  new ethers.Contract(
    v5Or4(townV5Address, townV4Address),
    v5Deployed ? townV5ABI : townV4ABI,
    signer
  );
export const landsV5SInst = (signer: Signer) =>
  new ethers.Contract(
    v5Or4(landsV5Address, landsV4Address),
    v5Deployed ? landsV5ABI : landsV4ABI,
    signer
  );
export const PLOTV5SInst = (signer: Signer) =>
  new ethers.Contract(
    v5Or4(tokenV5Address, tokenV4Address),
    v5Deployed ? PLOTV5ABI : PLOTV4ABI,
    signer
  );

/*  ****************************************************************
                        Resolving by deployment
    ****************************************************************  */

/**
 * One place that turns "which deployment is this route on" into a contract.
 *
 * Callers used to write `isTestnet ? townPInst : townMainnetPInst` inline, which
 * meant a third deployment would have had to be threaded through eighteen
 * files by hand. These do it once.
 */
export const townRead = (deployment: Deployment) =>
  deployment === "v5-testnet"
    ? townV5PInst
    : deployment === "v4-testnet"
    ? townV4PInst
    : deployment === "v3-testnet"
    ? townPInst
    : townMainnetPInst;

export const landsRead = (deployment: Deployment) =>
  deployment === "v5-testnet"
    ? landsV5PInst
    : deployment === "v4-testnet"
    ? landsV4PInst
    : deployment === "v3-testnet"
    ? landsPInst
    : landsMainnetPInst;

export const bmtRead = (deployment: Deployment) =>
  deployment === "v5-testnet"
    ? plotV5PInst
    : deployment === "v4-testnet"
    ? plotV4PInst
    : bmtPInst;

export const townWrite = (signer: Signer, deployment: Deployment) =>
  deployment === "v5-testnet"
    ? townV5SInst(signer)
    : deployment === "v4-testnet"
    ? townV4SInst(signer)
    : deployment === "v3-testnet"
    ? townSInst(signer)
    : townMainnetSInst(signer);

export const landsWrite = (signer: Signer, deployment: Deployment) =>
  deployment === "v5-testnet"
    ? landsV5SInst(signer)
    : deployment === "v4-testnet"
    ? landsV4SInst(signer)
    : deployment === "v3-testnet"
    ? landsSInst(signer)
    : landsMainnetSInst(signer);

export const bmtWrite = (signer: Signer, deployment: Deployment) =>
  deployment === "v5-testnet"
    ? PLOTV5SInst(signer)
    : deployment === "v4-testnet"
    ? PLOTV4SInst(signer)
    : BMTSInst(signer);

/** Address the token approval must be granted to, per deployment. */
export const townAddressFor = (deployment: Deployment) =>
  deployment === "v5-testnet"
    ? (v5Deployed && townV5Address ? townV5Address : townV4Address)
    : deployment === "v4-testnet"
    ? townV4Address
    : deployment === "v3-testnet"
    ? townAddress
    : townMainnetAddress;
