import React from "react";

/**
 * The PLOT coin: the hexagonal token shape the game already used, with the
 * Plotwar mark struck into it instead of the old Blockdom glyph. Replaces
 * svg/bmtIcon.tsx and svg/smBMTIcon.tsx — one component for both sizes.
 *
 * public/svgs/balanceContainer/PLOT.svg is the same drawing as a file, for the
 * places that load it through next/image. Keep the two in step.
 */
export default function PlotCoin({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size * 0.875}
      height={size}
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path
        d="M14 1L26.9 8.5V23.5L14 31L1.1 23.5V8.5Z"
        stroke="var(--pw-accent)"
        strokeWidth="1.8"
      />
      <g transform="translate(14 16) rotate(45) translate(-5.1 -5.1)">
        <rect width="4.6" height="4.6" fill="var(--pw-accent)" />
        <rect x="5.6" width="4.6" height="4.6" fill="var(--pw-paper)" />
        <rect y="5.6" width="4.6" height="4.6" fill="var(--pw-paper)" />
        <rect x="5.6" y="5.6" width="4.6" height="4.6" fill="var(--pw-paper)" />
      </g>
    </svg>
  );
}
