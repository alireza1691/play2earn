export const landsAddress = "0x316821b87239a26f82bb1a5f95c6b7a0c56bc1df"
export const townAddress= "0x311Ff00C49090B85c6b0552A595De4270C3F9c1e"
export const varsAddress ="0xDC8c2fA6B1bad701B8F38BBfe7eC18cC874f7754"
// "0x29d3f343A663225DB34Cb39046A2Be51EB9A75C3"
export const tokenAddress="0x57363eA640178A20DeAB01561dB3bD57FE85733e"
export const apiKey = "7XZM1XPQTW8WHHCW7KUY8BPUUSKPHPSE6T";

// Etherscan V1 endpoints (api-sepolia.etherscan.io, api.polygonscan.com) are
// deprecated and now reply NOTOK. The V2 API serves every chain from one host
// with one key, selected by chainid.
export const sepoliaChainId = 11155111;
export const polygonChainId = 137;
export const explorerLogsRequest = (address: string, chainId: number) =>
  `https://api.etherscan.io/v2/api?chainid=${chainId}&module=logs&action=getLogs&address=${address}&apikey=${apiKey}`;

/*
  There were two exports here, `arbitrumApiKey` and `polygonApiKey`, reading
  POLYGON_API_KEY and ARBITRUM_API_KEY respectively — each holding the other
  chain's key. Both are gone rather than corrected: neither was used anywhere,
  and neither could have worked. This module is "use client", and Next only
  exposes NEXT_PUBLIC_* to the browser, so both were undefined there.

  Every explorer call goes through `explorerLogsRequest` above, which uses the
  single V2 key. If a per-chain key is ever genuinely needed it has to be either
  NEXT_PUBLIC_ (and therefore public anyway) or read from a server route.
*/
export const landsMainnetAddress = "0x539f6dB158b6663cBB5E05Cc557C03102d873405"
export const townMainnetAddress= ""
export const tokenMainnetAddress=""


export const landsProxyTestnet = ""

/*
  v4 — the rewritten contracts (back-end/src/new), deployed to Sepolia on
  2026-09-06 from script/new/DeployPlotWar.s.sol. Addresses are the *proxies*;
  see back-end/deployments/sepolia.json for the implementations.

  These are separate from the v3 addresses above on purpose: the old deployment
  keeps running under /explore and /testnet/explore, and v4 is served from the
  /v4/ routes, so both are usable side by side.
*/
export const townV4Address = "0x1D1eCB549e07A8f654Cd8195cB1400B45e834957"
export const landsV4Address = "0x16d54bee75A55C83E9324fCFDfB39cDED3feFc9f"
export const tokenV4Address = "0x66aEcbd4450837911dC15F4a02A461DF1d748279"

/** Block the v4 deployment was created in; nothing before it is worth scanning. */
export const v4FromBlock = 11642736

/**
 * Whether the deployed v4 knows about land types. True since the 2026-09-06
 * deployment; the addresses above and this flag move together, because a client
 * that greys out wild parcels against a chain that does not know about them
 * would refuse sales the contract allows.
 */
export const v4HasLandTypes = true

/*
  v5 — the same rewrite carried forward: slippage guards on the three trade
  paths, the swap events the log was missing, the pool moved into the war module
  for room, and a cheaper land price.

  v4 above is deliberately left running. Real state sits behind it, and keeping
  both live is the only way to compare the two on the same chain — which is what
  the deployment switcher in the navbar is for.

  Deployed to Sepolia on 2026-09-11 from script/new/DeployPlotWar.s.sol.
  Addresses are the *proxies*; see back-end/deployments/sepolia.json for the
  implementations and the war module.

  `v5Deployed` gates every v5 read. It exists because an empty address silently
  resolves to the zero address in ethers, which reads as "the contract exists
  and everything is zero" instead of failing — an empty world that looks real.
*/
export const townV5Address = "0x0d2234f54a9723B840BF73b02E247Cd0837654B6"
export const landsV5Address = "0x06DA741C2527DC6C6C7E1959294608f6110Dd537"
export const tokenV5Address = "0x4c28DA43D5716cF45a23DE305C2fC7Bb3312B083"

/** Block the v5 deployment was created in; nothing before it is worth scanning. */
export const v5FromBlock = 11680786

/**
 * Whether v5 is on chain yet. Guards the switcher and every v5 read, so the
 * routes exist and compile before the deploy without pointing at nothing.
 */
export const v5Deployed = true
