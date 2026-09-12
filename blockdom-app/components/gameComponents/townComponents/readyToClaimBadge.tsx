"use client";
import React from "react";

/**
 * "Full — claim" over a farm or gold mine that has hit its cap.
 *
 * A building at capacity is not idle-but-fine, it is losing goods: the contract
 * clamps accrued revenue to the cap on the way out of `getCurrentRevenue`, so
 * everything a full building would have produced is never created at all. The
 * only signal for that used to be a progress bar three clicks inside the
 * building, which meant the way to find out was to go and look at every one.
 *
 * It hangs above the nameplate rather than beside the art: the buildings are
 * laid out in absolute rem offsets that differ per breakpoint, and anything
 * with its own coordinates would drift away from them.
 *
 * `pointer-events-none` for the same reason the nameplate has it — the art
 * underneath is the click target that opens the building.
 */
export default function ReadyToClaimBadge() {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-7 -translate-x-1/2">
      <div className="flex animate-pulse items-center gap-1 whitespace-nowrap rounded-md border border-[color:var(--pw-accent)] bg-[color:var(--pw-accent)]/15 px-2 py-[3px] shadow-md">
        <span className="text-[11px] font-bold leading-none text-[color:var(--pw-accent)]">
          Full — claim
        </span>
      </div>
    </div>
  );
}
