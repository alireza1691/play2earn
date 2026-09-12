import React from "react";

/**
 * Two arrows passing each other — the direction toggle in the swap window, and
 * the button that opens it from the balance bar.
 */
export default function SwapIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path
        d="M7 3v14M7 17l-3.5-3.5M7 17l3.5-3.5"
        stroke="var(--pw-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 21V7M17 7l-3.5 3.5M17 7l3.5 3.5"
        stroke="var(--pw-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
