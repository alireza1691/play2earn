"use client";
import { useUserDataContext } from "@/context/user-data-context";

/**
 * Whether the land currently on screen belongs to the connected wallet.
 *
 * Visiting somebody else's town is a supported thing to do — that is what
 * `/land/<id>` is for, and since the wallet requirement came off, a shared link
 * opens a town for a visitor with no wallet at all. Both cases mean the screen
 * can show a town whose buttons would revert if pressed, because every write in
 * `Town` is `onlyLandOwner`.
 *
 * So the question gets asked in several places, and it is worth asking the same
 * way each time: no wallet is not mine, and a wallet that does not hold this
 * parcel is not mine either.
 */
export function useIsMyLand(): boolean {
  const { inViewLand, ownedLands } = useUserDataContext();
  if (!inViewLand || !ownedLands) return false;
  return ownedLands.some(
    (land) => Number(land.tokenId) === inViewLand.tokenId
  );
}
