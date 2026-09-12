"use client";
import { useApiData } from "@/context/api-data-context";
import { zeroAddress } from "@/lib/utils";
import { useMemo } from "react";

/**
 * Owner lookup for the map.
 *
 * The map asks "who owns this land?" once per rendered cell — up to 10.000
 * times on the world view. Scanning `mintedLands` on every one of those calls
 * made the map O(cells x mintedLands); this builds the index once per
 * `mintedLands` change and answers in O(1).
 */
export function useLandOwners() {
  const { mintedLands } = useApiData();

  return useMemo(() => {
    const owners = new Map<number, string>();
    for (const land of mintedLands ?? []) {
      if (land.owner && land.owner !== zeroAddress) {
        owners.set(Number(land.tokenId), land.owner);
      }
    }
    return owners;
  }, [mintedLands]);
}

export const ownerOf = (owners: Map<number, string>, tokenId: number) =>
  owners.get(tokenId) ?? zeroAddress;
