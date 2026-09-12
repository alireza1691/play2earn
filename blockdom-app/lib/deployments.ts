"use client";
import { usePathname } from "next/navigation";

/**
 * Which set of deployed contracts a route talks to.
 *
 * The app already derived its network from the URL (`/testnet/` → Sepolia).
 * The same idea now covers four targets, each at its own addresses:
 *
 *   /            v3 on Polygon
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

/** Short label for the deployment switcher. */
export const deploymentLabel = (deployment: Deployment) =>
  deployment === "v5-testnet"
    ? "v5"
    : deployment === "v4-testnet"
    ? "v4"
    : deployment === "v3-testnet"
    ? "v3"
    : "mainnet";

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
  return routeFor(to, page === pathname ? pathname : page);
}
