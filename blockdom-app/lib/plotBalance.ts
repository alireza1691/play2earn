"use client";
import { ethers } from "ethers";
import { Deployment, isSepolia, isRewrite } from "./deployments";
import { mainnetProvider, provider, townAddressFor } from "./instances";

/**
 * Reads the wallet's in-game PLOT balance.
 *
 * v4 renamed `getBMTbalance` to `getPlotBalance` along with the token, and the
 * app branched on the deployment to pick one. But the Town deployed on Sepolia
 * behind the v4 addresses predates that rename: it answers the old name and
 * returns empty calldata for the new one, so every read threw CALL_EXCEPTION
 * and the balance pill stayed blank.
 *
 * Rather than pin the app to whichever name happens to be live — which breaks
 * again the moment the contracts are redeployed — this asks for the name the
 * deployment is expected to carry and falls back to the other. It needs its own
 * contract instance because the generated ABIs each declare only one of the two
 * names, so the fallback is not reachable through them.
 */
const BALANCE_ABI = [
  "function getPlotBalance(address) view returns (uint256)",
  "function getBMTbalance(address) view returns (uint256)",
];

export async function readPlotBalance(
  deployment: Deployment,
  address: string
): Promise<ethers.BigNumber> {
  const contract = new ethers.Contract(
    townAddressFor(deployment),
    BALANCE_ABI,
    isSepolia(deployment) ? provider : mainnetProvider
  );

  const [preferred, fallback] = isRewrite(deployment)
    ? ["getPlotBalance", "getBMTbalance"]
    : ["getBMTbalance", "getPlotBalance"];

  try {
    return await contract[preferred](address);
  } catch (error) {
    // A missing function comes back as empty calldata, which ethers reports as
    // a revert. A genuine revert from the right function looks the same here,
    // so the fallback is tried either way and its own failure is what surfaces.
    return await contract[fallback](address);
  }
}
