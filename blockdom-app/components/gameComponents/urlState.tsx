"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import {
  parcelId,
  parseLandId,
  parseParcelId,
  replaceQuery,
} from "@/lib/urlState";
import { zeroAddress } from "@/lib/utils";
import { ownerOf, useLandOwners } from "./mapComponents/useLandOwners";

/**
 * Keeps the map and town selections in the URL, so a refresh comes back to the
 * same place and a town can be linked to.
 *
 * The selections themselves stay in their contexts — this only mirrors them.
 * Mount the component on the page that owns the selection rather than wiring
 * the sync into the providers, which sit in the root layout and would then
 * trail `?parcel=` across every screen in the game.
 *
 * The URL is read in an effect, not during render: the providers are client
 * components that Next also renders on the server, where there is no
 * `location`, and seeding state from it during render would make the two
 * renders disagree. A layout effect runs before the browser paints, so the
 * restore still does not flash the world map on its way back to the parcel.
 */
const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * `?parcel=` (which parcel is open) and `?land=` (which land's card is up) for
 * the explore map.
 */
export function MapUrlState() {
  const { selectedParcel, setSelectedParcel, selectedLand, setSelectedLand } =
    useMapContext();
  // Whether the owner index has arrived at all — an empty map is what it looks
  // like both while loading and on a world with no mints.
  const { mintedLands } = useApiData();
  const owners = useLandOwners();

  // A land from the URL cannot be applied until the logs say who owns it, or
  // the card would offer to mint a land that is already someone's.
  const pendingLand = useRef<number | null>(null);
  const firstSync = useRef(true);

  useBrowserLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parcel = parseParcelId(params.get("parcel"));
    const land = parseLandId(params.get("land"));

    if (parcel || land) {
      // The URL is the state: whatever it does not name is closed, so a link
      // to a parcel does not open with the previous land's card still up.
      setSelectedParcel(parcel);
      setSelectedLand(null);
      pendingLand.current = land;
      return;
    }

    // Arriving with no query at all — the navbar's Explore link, say — is not
    // a request to clear anything, so seed the URL from what is already open.
    replaceQuery({
      parcel: selectedParcel ? parcelId(selectedParcel) : null,
      land: selectedLand ? String(selectedLand.coordinate) : null,
    });
  }, []);

  useEffect(() => {
    const land = pendingLand.current;
    if (land === null || !mintedLands) return;
    pendingLand.current = null;
    const owner = ownerOf(owners, land);
    setSelectedLand({ coordinate: land, owner, isMinted: owner !== zeroAddress });
  }, [mintedLands, owners, setSelectedLand]);

  useEffect(() => {
    // The pass for the mount commit still carries the pre-restore values, so
    // writing here would delete the very query the effect above just read.
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    replaceQuery({
      parcel: selectedParcel ? parcelId(selectedParcel) : null,
      // A land waiting on the logs has no selection to read yet, and dropping
      // it from the URL meanwhile would lose it to a refresh in that window.
      land: selectedLand
        ? String(selectedLand.coordinate)
        : pendingLand.current !== null
        ? String(pendingLand.current)
        : null,
    });
  }, [selectedParcel, selectedLand]);

  return null;
}

/**
 * Records the town in play as `?town=` on the my-land screens.
 *
 * Only the write half lives here: reading is the navbar's job, because the
 * navbar is what would otherwise replace the selection with the first land the
 * wallet owns. `lib/urlState.ts#townFromLocation` is the one rule both sides
 * follow. `/land/[land]` needs no writer — the id is already in the path.
 */
export function TownUrlState() {
  const { chosenLand } = useUserDataContext();

  useEffect(() => {
    // Never written as null: a disconnected wallet clears the selection for a
    // moment on every load, and erasing the query there would turn a refresh
    // into "whichever land you own first" — the thing this exists to stop.
    if (!chosenLand) return;
    replaceQuery({ town: chosenLand.tokenId });
  }, [chosenLand]);

  return null;
}
