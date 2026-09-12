import { SelectedParcelType } from "./types";

/**
 * Land and parcel ids in the URL.
 *
 * The map's two selections — which parcel is open, and which land is picked
 * inside it — lived only in React state, so a refresh dropped the player back
 * on the world map and a link to a town could not be shared. Both are already
 * plain numbers on screen, so they go into the query string as they are:
 * `/v4/explore?parcel=140150&land=143157`, `/v4/myLand?town=143157`.
 *
 * Everything here validates rather than trusts: a query string is user input,
 * and an out-of-range coordinate would otherwise reach the contract calls.
 */

/** Lowest and highest coordinate a land id can carry — see LandsV3.sol. */
const MIN_COORDINATE = 100;
const MAX_COORDINATE = 199;

/** A land id is x and y written side by side: 123145 is x=123, y=145. */
export const landIdParts = (id: number) => ({
  x: Math.floor(id / 1000),
  y: id % 1000,
});

/** The id as it appears in a URL, or null if it is not a land on this map. */
export function parseLandId(raw: string | null | undefined): number | null {
  if (!raw || !/^\d{6}$/.test(raw)) return null;
  const id = Number(raw);
  const { x, y } = landIdParts(id);
  if (x < MIN_COORDINATE || x > MAX_COORDINATE) return null;
  if (y < MIN_COORDINATE || y > MAX_COORDINATE) return null;
  return id;
}

/**
 * A parcel's id is the id of its bottom-left land — the number the world map
 * already prints on each parcel, so the URL names the thing the player clicked
 * rather than an internal index.
 */
export const parcelId = (parcel: { x: number; y: number }) =>
  `${parcel.x}${parcel.y}`;

export function parseParcelId(raw: string | null | undefined): SelectedParcelType {
  const id = parseLandId(raw);
  if (id === null) return null;
  const { x, y } = landIdParts(id);
  // Parcels start every tenth coordinate, so 100..190 in steps of 10. Anything
  // else is a land id, not a parcel origin.
  if (x % 10 !== 0 || y % 10 !== 0) return null;
  if (x > 190 || y > 190) return null;
  return { x, y };
}

/**
 * The town the current URL names: the id in a `/land/<id>` path, or `?town=`
 * on the my-land screens.
 *
 * Both the navbar's default selection and the writer that keeps `?town=` up to
 * date go through here, so one rule decides which town is in play. Without it
 * the navbar's "first land you own" default would overwrite a town the player
 * asked for by URL — including on the wallet reconnect that happens a beat
 * after every page load.
 *
 * Returns null on the server, where there is no location to read; every caller
 * is inside an effect, so that is only ever the prerender.
 */
export function townFromLocation(): number | null {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname.match(/\/land\/(\d+)\/?$/);
  if (path) return parseLandId(path[1]);
  return parseLandId(new URLSearchParams(window.location.search).get("town"));
}

/**
 * Rewrites the query string in place, dropping the keys set to null.
 *
 * `history.replaceState` rather than `router.replace`: this is the same page
 * with the same data, and going through the router would re-render the tree on
 * every parcel step. `replace` rather than `push` for the same reason walking
 * the map with the arrow buttons must not stack a history entry per step.
 * Next patches these methods, so the router stays in sync (Next >= 14.1).
 */
export function replaceQuery(updates: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  const next = url.pathname + url.search;
  if (next === window.location.pathname + window.location.search) return;
  window.history.replaceState(null, "", next);
}
