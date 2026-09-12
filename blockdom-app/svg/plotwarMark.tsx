import React from "react";

/**
 * The Plotwar mark: four plots seen from the game's isometric angle, the
 * top-left one claimed in the accent colour. Shared by the landing header and
 * the in-game navbar so the two stay identical.
 *
 * The accent is `--pw-accent`, so it follows whatever the page sets.
 */
export default function PlotwarMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <g transform="translate(0 3.55)">
        <g transform="rotate(45 50 50)">
          <rect x="16" y="16" width="26" height="26" fill="var(--pw-accent)" />
          <rect x="53" y="21" width="26" height="26" fill="var(--pw-paper)" />
          <rect x="21" y="53" width="26" height="26" fill="var(--pw-paper)" />
          <rect x="53" y="53" width="26" height="26" fill="var(--pw-paper)" />
        </g>
      </g>
    </svg>
  );
}
