import { ethers } from "ethers";
import { Deployment, isRewrite } from "./deployments";
import { v4HasLandTypes } from "./blockchainData";

/**
 * What a parcel is.
 *
 * Mirrors `Lands.LandType`, and the numeric values have to keep matching it:
 * the contract stores the type as a number, so reordering this reinterprets
 * every override already written on chain.
 */
export enum LandType {
  Town = 0,
  Jungle = 1,
}

/**
 * The type a parcel is born with.
 *
 * This is a straight port of `Lands.naturalType`, which is `pure` precisely so
 * the client can answer it without asking the chain. That matters here: the map
 * paints up to 10,000 parcels, and one call each would be 10,000 round trips for
 * something a hash already decides.
 *
 * Verified against the deployed contract over a 300-parcel sample; if the
 * contract's rule ever changes, this must change with it or the map will lie
 * about which land is for sale.
 */
export function naturalType(tokenId: number | string): LandType {
  const cached = naturalTypes.get(String(tokenId));
  if (cached !== undefined) return cached;

  const digest = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["uint256"], [tokenId])
  );
  const type = ethers.BigNumber.from(digest).mod(100).lt(JUNGLE_PERCENT)
    ? LandType.Jungle
    : LandType.Town;
  naturalTypes.set(String(tokenId), type);
  return type;
}

/**
 * The answer for a token id never changes — it is a hash of the id and nothing
 * else — and the map asks the same question about the same lands over and over:
 * once per cell to know what to draw, and again for each of the eight lands
 * around a wild one to know where its canopy continues. Caching it turns nine
 * parcels' worth of keccaks per map move into 10,000 at most, ever.
 */
const naturalTypes = new Map<string, LandType>();

/** Share of the map that starts wild. Mirrors `Lands.JunglePercent`. */
export const JUNGLE_PERCENT = 10;

/**
 * The owner can retype any parcel nobody has bought yet, so the natural type is
 * only the default. Overrides are read from `LandTypeChanged` logs and passed in
 * here; an empty map just means nothing has been retyped.
 */
export function landTypeOf(
  tokenId: number,
  overrides?: ReadonlyMap<number, LandType>
): LandType {
  const overridden = overrides?.get(tokenId);
  return overridden ?? naturalType(tokenId);
}

/**
 * Whether a player can buy this parcel.
 *
 * Only Town-type land is on the market, and only while unowned. Wild parcels
 * stay off it until the owner unlocks them, so offering one for sale would send
 * the buyer into a revert.
 */
export function isForSale(
  tokenId: number,
  owner: string | undefined,
  overrides?: ReadonlyMap<number, LandType>
): boolean {
  const unowned = !owner || owner === ethers.constants.AddressZero;
  return unowned && landTypeOf(tokenId, overrides) === LandType.Town;
}

/**
 * A jungle nobody owns is raidable: it holds goods and a garrison that regrow on
 * their own, and any player can march on it. Once somebody owns it, it is an
 * ordinary town however it is typed.
 */
export function isWildLand(
  tokenId: number,
  owner: string | undefined,
  overrides?: ReadonlyMap<number, LandType>
): boolean {
  const unowned = !owner || owner === ethers.constants.AddressZero;
  return unowned && landTypeOf(tokenId, overrides) === LandType.Jungle;
}

/**
 * How long a wild land takes to regrow everything a raid took.
 *
 * Mirrors `TownBase.WildRegenPeriod`. The contract restores goods and garrison
 * linearly over this window, computed on the way into battle rather than by a
 * keeper, so the client can work out the same number from a timestamp.
 */
export const WILD_REGEN_PERIOD = 7 * 24 * 60 * 60;

/**
 * How full a wild land is, 0..1, from when it was last attacked.
 *
 * This is what the map draws its loot marks from. It is deliberately a floor,
 * not a reading: a raid loots only what the winning army can carry, so a land
 * raided by a small force still holds more than this says. Treat it as "at
 * least this full"; a precise number needs `wildLandState`, which is a contract
 * call per land and would cost nine parcels' worth of round trips per map move.
 */
export function wildFill(
  lastRaidAt: number | undefined,
  nowSeconds: number = Date.now() / 1000
): number {
  if (!lastRaidAt) return 1;
  const grown = (nowSeconds - lastRaidAt) / WILD_REGEN_PERIOD;
  return Math.max(0, Math.min(1, grown));
}

/**
 * Land types only exist on v4, and only once the deployed bytecode carries them.
 * The v3 contracts have no notion of them at all, and the v4 currently on Sepolia
 * predates the feature — in both cases every parcel is an ordinary town and the
 * client must not grey anything out.
 */
export function landTypesSupported(deployment: Deployment): boolean {
  return isRewrite(deployment) && v4HasLandTypes;
}
