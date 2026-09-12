"use client";
import { buildingDisplayNames } from "@/lib/data";
import React from "react";

type BuildingLabelProps = {
  /** The identifier from `landItems`, e.g. "GoldMine". Resolved to a readable name. */
  name: string;
  level: number;
  /**
   * Where the plate sits. The default hangs it just above its container, which
   * is what every building wants — pass something else only where there is no
   * wrapper to hang from, as with the walls.
   */
  className?: string;
};

/**
 * The nameplate above a building in the town view.
 *
 * It positions itself against the building's own wrapper rather than carrying
 * hand-tuned coordinates, so it tracks the art at every breakpoint — the town
 * is laid out in absolute rem offsets that differ between `xl` and below, and
 * a second set of them per label would be one more thing to keep in step.
 *
 * `pointer-events-none` is load-bearing: the building image underneath is the
 * click target that opens the build window, and the plate covers part of it.
 */
export default function BuildingLabel({
  name,
  level,
  className = "bottom-full left-1/2 -translate-x-1/2 mb-1",
}: BuildingLabelProps) {
  return (
    <div className={`pointer-events-none absolute z-30 ${className}`}>
      <div className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-[#87F0E5]/60 bg-[#06291D]/80 px-2 py-[3px] shadow-md">
        <span className="text-[11px] font-medium leading-none text-white/90">
          {buildingDisplayNames[name] ?? name}
        </span>
        <span className="text-[11px] font-bold leading-none text-[#98FBD7]">
          {level > 0 ? `Lv ${level}` : "Empty"}
        </span>
      </div>
    </div>
  );
}
