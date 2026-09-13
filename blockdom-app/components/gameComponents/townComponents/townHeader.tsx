"use client";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useUserDataContext } from "@/context/user-data-context";
import { isRewrite, useDeployment } from "@/lib/deployments";
import { separatedCoordinate } from "@/lib/utils";
import { formattedNumber } from "@/lib/utils";
import { useAddress } from "@thirdweb-dev/react";
import React from "react";

/**
 * Says which land you are standing on.
 *
 * The town view fills the screen with buildings and gives no clue which of your
 * lands they belong to — the map has its coordinate readout, this is the same
 * thing for the other half of the game. Reuses the map's badge styling so the
 * two read as one interface rather than two.
 */
export default function TownHeader() {
  const { inViewLand, ownedLands } = useUserDataContext();
  const { claimAll } = useBlockchainUtilsContext();
  const deployment = useDeployment();
  const address = useAddress();

  if (!address || !inViewLand) return null;

  const id = inViewLand.tokenId.toString();
  const pending = <span className="spinnerSm align-middle" />;

  // One transaction for the whole land instead of one per building.
  //
  // Only offered on v4: the v3 contract's claimAll walks the global list of
  // building *types* rather than the land's own buildings, so it reverts on a
  // land with one building and silently skips the rest beyond two.
  //
  // Owner-only in the UI as well as on chain. Visiting somebody else's town is
  // a supported thing to do, and offering a button that can only revert is not
  // a guard, it is a trap.
  const buildingCount = inViewLand.buildedResourceBuildings?.length ?? 0;
  const isMine = !!ownedLands?.some(
    (land) => Number(land.tokenId) === inViewLand.tokenId
  );
  const canClaimAll = isMine && isRewrite(deployment) && buildingCount > 1;

  return (
    <div
      className={`${
        address ? "top-[124px]" : "top-[80px]"
      } ml-5 z-30 absolute left-0 flex flex-row flex-wrap gap-2 pr-4 max-w-[100dvw]`}
    >
      <div className="pwBadge">
        <span className="pwBadgeLabel">Land</span>
        <span className="pwBadgeValue !text-[color:var(--pw-accent)]">
          {separatedCoordinate(id)}
        </span>
      </div>

      <div className="pwBadge">
        <span className="pwBadgeLabel">Townhall</span>
        <span className="pwBadgeValue">
          {Number(inViewLand.townhallLvl)}
          <span className="pwBadgeUnit">lvl</span>
        </span>
      </div>

      <div className="pwBadge">
        <span className="pwBadgeLabel">Walls</span>
        <span className="pwBadgeValue">
          {Number(inViewLand.wallLvl)}
          <span className="pwBadgeUnit">lvl</span>
        </span>
      </div>

      <div className="pwBadge">
        <span className="pwBadgeLabel">Buildings</span>
        <span className="pwBadgeValue">
          {inViewLand.buildedResourceBuildings
            ? inViewLand.buildedResourceBuildings.length
            : pending}
        </span>
      </div>

      {canClaimAll && (
        <button
          onClick={() => claimAll()}
          title={`Collect from all ${buildingCount} buildings in one transaction`}
          className="pwBadge cursor-pointer hover:bg-[#98FBD7]/15 transition-colors"
        >
          <span className="pwBadgeLabel">Claim</span>
          <span className="pwBadgeValue !text-[color:var(--pw-accent)]">
            all
          </span>
        </button>
      )}
    </div>
  );
}
