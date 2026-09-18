"use client";
import { useMapContext } from "@/context/map-context";
import { faucetBarTakesRow, useDeployment } from "@/lib/deployments";
import { parcelCoordRange } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

/**
 * Which stretch of the map is on screen, centred under the navigation bar.
 *
 * Opening a parcel fills the screen with a hundred unlabelled squares, and the
 * only thing naming them was a badge in the far corner showing the origin —
 * "100-100" — which says where the block starts but not that it runs to
 * 109-109. This says both corners, in the middle, where the player is looking.
 *
 * Desktop only: the top-left strip wraps across the full width on a phone, and
 * a centred element on the same row would land on top of it. The same range is
 * in that strip's Coord badge, so nothing is lost.
 */
export default function ParcelRangeHeader() {
  const { selectedParcel } = useMapContext();
  const { from, to } = parcelCoordRange(selectedParcel);
  const deployment = useDeployment();
  const pathname = usePathname();

  // The faucet strip is centred on this same row and runs to about 86px, so
  // sitting at 80px put the two badges on top of each other. Drop below it when
  // it is there, and keep the original position where it is not.
  const top = faucetBarTakesRow(deployment, pathname) ? "top-[104px]" : "top-[80px]";

  return (
    <div
      className={`hidden md:flex z-30 absolute ${top} left-1/2 -translate-x-1/2 pointer-events-none`}
    >
      <div className="pwBadge !gap-3">
        <span className="pwBadgeLabel">
          {selectedParcel ? "Parcel" : "World"}
        </span>
        <span className="pwBadgeValue !font-normal !text-[13px] !tracking-[0.08em] !font-[family-name:var(--pw-mono)]">
          {from}
          <span className="mx-2 text-[color:var(--pw-muted)]">→</span>
          {to}
        </span>
      </div>
    </div>
  );
}
