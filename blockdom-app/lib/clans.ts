"use client";
import { ethers } from "ethers";
import clanTownAbi from "../abis/v4/townAbi.json";
import clanTownV5Abi from "../abis/v5/townAbi.json";
import { townMainnetAddress, townV4Address, townV5Address, v5Deployed } from "./blockchainData";
import { Deployment, isRewrite } from "./deployments";
import { mainnetProvider, provider } from "./instances";

/**
 * Clan reads.
 *
 * Clans only exist on the v4 contracts, so these are bound to the v4 address
 * regardless of which route is being viewed. Reads still answer "nobody is in a
 * clan" rather than throwing, which is what keeps the v3 routes — where the
 * deployed contract has no clan surface at all — rendering normally.
 */
const CLAN_ABI = (clanTownAbi as { abi: unknown }).abi as ethers.ContractInterface;
const CLAN_V5_ABI = (clanTownV5Abi as { abi: unknown }).abi as ethers.ContractInterface;

/** v5's address until it is broadcast, at which point this is v5's own. */
const clanV5Address = v5Deployed && townV5Address ? townV5Address : townV4Address;

export const clanPInst = new ethers.Contract(townV4Address, CLAN_ABI, provider);
export const clanV5PInst = new ethers.Contract(
  clanV5Address,
  v5Deployed ? CLAN_V5_ABI : CLAN_ABI,
  provider
);
export const clanMainnetPInst = new ethers.Contract(
  townMainnetAddress,
  CLAN_ABI,
  mainnetProvider
);

export const clanSInst = (signer: ethers.Signer, deployment: Deployment) =>
  deployment === "v5-testnet"
    ? new ethers.Contract(
        clanV5Address,
        v5Deployed ? CLAN_V5_ABI : CLAN_ABI,
        signer
      )
    : new ethers.Contract(
        isRewrite(deployment) ? townV4Address : townMainnetAddress,
        CLAN_ABI,
        signer
      );

export const NO_CLAN = 0;

export type ClanSummary = {
  id: number;
  name: string;
  leader: string;
  members: string[];
};

/**
 * Clans only exist on the v4 contracts, so this keys off the deployment rather
 * than "is this a testnet". It used to take a boolean derived from `/testnet/`
 * being in the path — which is false on the /v4/ routes, so every clan read
 * went to the mainnet contract and came back empty. The clan was on chain the
 * whole time; the page was asking the wrong address.
 */
const readInstance = (deployment: Deployment) =>
  deployment === "v5-testnet"
    ? clanV5PInst
    : isRewrite(deployment)
    ? clanPInst
    : clanMainnetPInst;

/**
 * Clan id for each address, in the order given.
 *
 * One call for the whole map: land owners repeat across lands, so callers pass
 * the distinct owners rather than one address per land.
 */
export async function fetchClansOf(
  accounts: string[],
  deployment: Deployment
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (accounts.length === 0) return result;

  try {
    const ids: ethers.BigNumber[] = await readInstance(deployment).clansOf(
      accounts
    );
    accounts.forEach((account, i) => {
      result.set(account.toLowerCase(), Number(ids[i]));
    });
  } catch (error) {
    // Expected until the v4 contracts are deployed: no clan surface to call.
    console.log("clansOf unavailable, treating everyone as unaffiliated", error);
  }
  return result;
}

/** Addresses waiting on this clan's leader to decide. */
export async function fetchClanRequests(
  clanId: number,
  deployment: Deployment
): Promise<string[]> {
  try {
    return await readInstance(deployment).getClanRequests(clanId);
  } catch (error) {
    console.log("getClanRequests unavailable", error);
    return [];
  }
}

/** The clan this address has applied to, or 0. */
export async function fetchRequestedClan(
  account: string | undefined,
  deployment: Deployment
): Promise<number> {
  if (!account) return NO_CLAN;
  try {
    return Number(await readInstance(deployment).requestedClanOf(account));
  } catch (error) {
    console.log("requestedClanOf unavailable", error);
    return NO_CLAN;
  }
}

export async function fetchClanCount(deployment: Deployment): Promise<number> {
  try {
    return Number(await readInstance(deployment).clanCount());
  } catch (error) {
    console.log("clanCount unavailable", error);
    return 0;
  }
}

export async function fetchClan(
  id: number,
  deployment: Deployment
): Promise<ClanSummary | null> {
  try {
    const [name, leader, members] = await readInstance(deployment).getClan(id);
    return { id, name, leader, members };
  } catch (error) {
    console.log("getClan unavailable", error);
    return null;
  }
}

/** Every clan, for the roster page. Ids are 1-based and contiguous. */
export async function fetchAllClans(deployment: Deployment): Promise<ClanSummary[]> {
  const count = await fetchClanCount(deployment);
  if (count === 0) return [];
  const clans = await Promise.all(
    Array.from({ length: count }, (_, i) => fetchClan(i + 1, deployment))
  );
  // A disbanded clan keeps its id but loses its leader; drop it from the roster.
  return clans.filter(
    (clan): clan is ClanSummary =>
      clan !== null && clan.leader !== ethers.constants.AddressZero
  );
}
