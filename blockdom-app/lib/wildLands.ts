import { BigNumber, ethers } from "ethers";
import { Deployment } from "./deployments";
import { townRead } from "./instances";

/**
 * What a raider would find on a wild parcel.
 *
 * `exact` says whether this came from the chain or from the fallback below, so
 * the UI can be honest about which it is showing.
 */
export type WildLandInfo = {
  food: BigNumber;
  gold: BigNumber;
  garrison: number;
  /** When the connected wallet may raid this parcel again, as a unix seconds. */
  raidableAt: number;
  exact: boolean;
};

/**
 * The shape of an untouched wild parcel. Mirrors the contract's constants
 * (`WildGoodsPerType`, `WildGarrisonSize`, `WildRegenPeriod`, `WildRaidCooldown`).
 */
export const WILD_GOODS_PER_TYPE = ethers.utils.parseEther("2000");
export const WILD_GARRISON_SIZE = 30;
export const WILD_REGEN_PERIOD_DAYS = 7;
export const WILD_RAID_COOLDOWN_HOURS = 24;

/**
 * Reads what a jungle is holding.
 *
 * Regrowth is only written to storage during a battle, so reading the parcel's
 * balance directly reports zero for a jungle nobody has attacked — when in fact
 * it is full. `previewWildLand` redoes that arithmetic and is the only correct
 * source.
 *
 * That view is not on the deployed contract yet (see back-end/PENDING_DEPLOY.md),
 * so the call is allowed to fail and falls back to the untouched values. That
 * fallback is exact for as long as no jungle has been raided — every parcel is
 * untouched, and untouched means full — and becomes an approximation the moment
 * one is. It is a stopgap for the gap between the code and the chain, not a
 * substitute for the view.
 */
export async function readWildLand(
  deployment: Deployment,
  landId: number
): Promise<WildLandInfo> {
  const town = townRead(deployment);
  try {
    const [goods, garrison, raidableAt] = await town.previewWildLand(landId);
    return {
      food: goods[0],
      gold: goods[1],
      garrison: Number(garrison),
      raidableAt: Number(raidableAt),
      exact: true,
    };
  } catch {
    return {
      food: WILD_GOODS_PER_TYPE,
      gold: WILD_GOODS_PER_TYPE,
      garrison: WILD_GARRISON_SIZE,
      raidableAt: 0,
      exact: false,
    };
  }
}
