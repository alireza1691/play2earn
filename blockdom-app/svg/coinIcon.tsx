import React from 'react'

/**
 * The game's coin, struck with the Plotwar mark. Same silhouette as before —
 * a coin with a second one behind it — only the old Blockdom castle glyph in
 * the middle is now the mark. svg/smCoinIcon.tsx is the 13px version of this
 * drawing, so change the two together.
 */
export default function CoinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.33 5.68A10.67 10.67 0 1 0 9.33 26.32"
        stroke="var(--pw-accent)"
        strokeWidth="2.1"
      />
      <circle cx="20" cy="16" r="9.6" stroke="var(--pw-accent)" strokeWidth="2.1" />
      <g transform="translate(20 16) rotate(45) translate(-4.5 -4.5)">
        <rect width="4" height="4" fill="var(--pw-accent)" />
        <rect x="5" width="4" height="4" fill="var(--pw-paper)" />
        <rect y="5" width="4" height="4" fill="var(--pw-paper)" />
        <rect x="5" y="5" width="4" height="4" fill="var(--pw-paper)" />
      </g>
    </svg>
  )
}
