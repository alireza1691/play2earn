"use client";
import { usePathname } from "next/navigation";
import { townMainnetAddress, v5Deployed } from "./blockchainData";

/**
 * Which set of deployed contracts a route talks to.
 *
 * The app already derived its network from the URL (`/testnet/` → Sepolia).
 * The same idea now covers four targets, each at its own addresses:
 *
 *   /            v3 on Base
 *   /testnet/    v3 on Sepolia
 *   /v4/         the rewrite: clans, the AMM pool, land types
 *   /v5/         the rewrite plus slippage guards and the swap events
 *
 * The point is that the *pages and components are shared*. Rather than copying
 * eighteen files' worth of components to point them at new addresses, every
 * caller resolves its contract through here, so one route serves the old
 * deployment and another serves the new one with the same code.
 *
 * v4 is kept live rather than replaced: real state sits behind it, and it is
 * the only way to compare behaviour against v5 on the same chain.
 */
export type Deployment =
  | "v3-testnet"
  | "v3-mainnet"
  | "v4-testnet"
  | "v5-testnet";

export const V4_PREFIX = "/v4/";
export const V5_PREFIX = "/v5/";

/**
 * Where "play on the testnet" should land someone.
 *
 * Every entry point used to say `/testnet/explore` outright, which is v3 — the
 * oldest contracts, kept live only because state sits behind them. A new player
 * arriving from the landing page got the version nobody is developing.
 *
 * Named rather than written out at each call site because it moved once and
 * will move again. The `/testnet/` routes stay reachable; they are simply no
 * longer the front door.
 */
export const DEFAULT_TESTNET: Deployment = "v5-testnet";

export function deploymentFor(pathname: string): Deployment {
  if (pathname.includes(V5_PREFIX)) return "v5-testnet";
  if (pathname.includes(V4_PREFIX)) return "v4-testnet";
  if (pathname.includes("/testnet/")) return "v3-testnet";
  return "v3-mainnet";
}

/** Everything except v3-mainnet runs on Sepolia. */
export const isSepolia = (deployment: Deployment) => deployment !== "v3-mainnet";

/**
 * True where the contracts carry the clan and pool rewrite — v4 and v5 both.
 *
 * This is a *capability* question, not a version one: nearly every component
 * asking it wants to know whether clans, the pool and land types exist, and the
 * answer is the same for both rewrites. Where the two genuinely differ, ask the
 * narrower predicate below instead.
 */
export const isRewrite = (deployment: Deployment) =>
  deployment === "v4-testnet" || deployment === "v5-testnet";

/**
 * Only v5's trade functions take a minimum-out argument.
 *
 * v4 was deployed before slippage guards existed, so `buyGood`/`sellGood`/
 * `swapGoods` take three arguments there and four here. Calling either one with
 * the wrong arity fails at encoding time, which is why this is asked at the
 * call site rather than assumed.
 */
export const hasSlippageGuards = (deployment: Deployment) =>
  deployment === "v5-testnet";

/**
 * The daily faucet is a v5 feature, and asking any earlier deployment about it
 * is a crash rather than a "no".
 *
 * `abis/v4/townAbi.json` has no `faucetEnabled`, so `town.faucetEnabled()`
 * throws `is not a function` *synchronously* — before any promise exists, which
 * is why a `.catch` on the surrounding Promise.all did not save it. It took down
 * the whole of /v4/land/<id>.
 *
 * So this is a question about the ABI, not about what is on chain. v5's ABI has
 * the function whether or not the deployed bytecode does yet; that second case
 * is a revert, which the callers do catch.
 */
export const hasFaucet = (deployment: Deployment) =>
  deployment === "v5-testnet";

/** Short label for the deployment switcher. */
export const deploymentLabel = (deployment: Deployment) =>
  deployment === "v5-testnet"
    ? "v5"
    : deployment === "v4-testnet"
    ? "v4"
    : deployment === "v3-testnet"
    ? "v3"
    : "Main";

/**
 * Why a deployment cannot be opened, or null if it can.
 *
 * Mainnet is listed but unreachable: `townMainnetAddress` and
 * `tokenMainnetAddress` are empty strings, so there is no Town and no token
 * behind it. An empty address becomes the zero address in ethers, which answers
 * every read with zero rather than failing — the game would render an intact
 * world with nothing in it. Better to say so on the button.
 *
 * This is derived rather than hardcoded so that filling the addresses in is all
 * it takes to enable the tab.
 */
export function unavailableReason(deployment: Deployment): string | null {
  if (deployment === "v3-mainnet" && !townMainnetAddress) {
    return "Mainnet is not deployed yet — no Town contract behind it";
  }
  if (deployment === "v5-testnet" && !v5Deployed) {
    return "v5 is not deployed yet";
  }
  return null;
}

/**
 * Pages each deployment actually has.
 *
 * They are not the same set: mainnet has no `land/[land]`, and v3-testnet has
 * no `dashboard`. Switching straight across would 404 on exactly the routes a
 * player is most likely to be looking at, so `switchDeployment` falls back.
 */
const PAGES: Record<Deployment, readonly string[]> = {
  // No faucet on mainnet: it hands out free resources, which is only harmless
  // where the resources are worthless.
  "v3-mainnet": ["explore", "myLand", "battleLog", "clans", "dashboard"],
  // No faucet on v3 or v4 either: their contracts have no such function, so
  // the route would only ever explain itself.
  "v3-testnet": ["explore", "myLand", "battleLog", "clans", "land"],
  "v4-testnet": ["explore", "myLand", "battleLog", "clans", "dashboard", "land"],
  "v5-testnet": ["explore", "myLand", "battleLog", "clans", "dashboard", "land", "faucet"],
};

export function useDeployment(): Deployment {
  return deploymentFor(usePathname());
}

/**
 * Where a deployment's map tiles live.
 *
 * v4 ships its own skin of the *same* geometry — one palette swap in
 * scripts/generateMapTiles.js, same coastline, same rock table, same file
 * sizes — so the two deployments can look different without either one's
 * tiles moving under the other. v5 reuses that skin: it is the same world,
 * and a second copy would be 40 MB to say nothing.
 */
export function mapTilesFor(deployment: Deployment): string {
  return isRewrite(deployment) ? "/map/tiles/v4" : "/map/tiles";
}

/**
 * Rewrites a link so it stays inside the deployment the user is browsing.
 * `/explore` on a v4 route becomes `/v4/explore`.
 */
export function routeFor(deployment: Deployment, page: string): string {
  const clean = page.startsWith("/") ? page.slice(1) : page;
  if (deployment === "v5-testnet") return `/v5/${clean}`;
  if (deployment === "v4-testnet") return `/v4/${clean}`;
  if (deployment === "v3-testnet") return `/testnet/${clean}`;
  return `/${clean}`;
}

/**
 * The same page on another deployment, for the switcher.
 *
 * Works off the current pathname rather than a page name so it survives on any
 * route, including ones that take a parameter like `/v4/land/104104`.
 */
export function switchDeployment(
  pathname: string,
  to: Deployment
): string {
  const from = deploymentFor(pathname);
  if (from === to) return pathname;

  // Strip whatever prefix the current deployment uses, leaving the page.
  let page = pathname;
  for (const prefix of [V5_PREFIX, V4_PREFIX, "/testnet/"]) {
    if (page.includes(prefix)) {
      page = page.slice(page.indexOf(prefix) + prefix.length);
      break;
    }
  }
  if (page === pathname) page = pathname.replace(/^\//, "");

  // The landing page belongs to no deployment; entering one should open the
  // map rather than a route that does not exist.
  const head = page.split("/")[0];
  if (!head) return routeFor(to, "explore");

  // Fall back rather than 404: /v4/dashboard has no v3-testnet equivalent, and
  // /testnet/land/104104 has no mainnet one.
  return PAGES[to].includes(head)
    ? routeFor(to, page)
    : routeFor(to, "explore");
}
