import React from 'react'

/** 13px version of svg/coinIcon.tsx — keep the two drawings in step. */
export default function SmCoinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M3.69 2.2A3.99 3.99 0 1 0 3.69 9.92"
        stroke="var(--pw-accent)"
        strokeWidth="0.95"
      />
      <circle cx="7.67" cy="6.06" r="3.55" stroke="var(--pw-accent)" strokeWidth="0.95" />
      <g transform="translate(7.67 6.06) rotate(45) translate(-1.8 -1.8)">
        <rect width="1.6" height="1.6" fill="var(--pw-accent)" />
        <rect x="2" width="1.6" height="1.6" fill="var(--pw-paper)" />
        <rect y="2" width="1.6" height="1.6" fill="var(--pw-paper)" />
        <rect x="2" y="2" width="1.6" height="1.6" fill="var(--pw-paper)" />
      </g>
    </svg>
  )
}
