import React from "react";

/**
 * One glyph per warrior type, drawn as its weapon.
 *
 * The army list needs to say what a row *is* at a glance, and the warrior
 * portraits in public/warriors are painted illustrations — they turn to mush
 * below about 40px and three of the six read as the same silhouette. These are
 * line glyphs built to survive at 16px: bold single strokes, no fill, no
 * detail that disappears.
 *
 * They take their colour from the row (`currentColor`), so a dimmed or locked
 * row dims the icon with it.
 *
 * Indexed to match warriorsInfo, which is in the contract's own order.
 */

type IconProps = { size?: number };

const frame = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  xmlns: "http://www.w3.org/2000/svg",
});

/** Maceman — a hafted club with a spiked head. */
export const MaceIcon = ({ size = 18 }: IconProps) => (
  <svg {...frame(size)}>
    <path d="M3.5 20.5 L11 13" />
    <circle cx="15.5" cy="8.5" r="3.6" />
    <path d="M15.5 3.2v1.6M15.5 12.2v1.6M10.3 8.5h1.6M19.1 8.5h1.6" />
  </svg>
);

/** Spearman — upright shaft with a leaf head. Stood up so it does not read
 *  as another diagonal blade next to the sword. */
export const SpearIcon = ({ size = 18 }: IconProps) => (
  <svg {...frame(size)}>
    <path d="M12 21.5 V6.5" />
    <path d="M12 2 L14.8 7 H9.2 Z" />
    <path d="M9.3 10.5 H14.7" />
  </svg>
);

/** Swordsman — blade, crossguard, pommel. */
export const SwordIcon = ({ size = 18 }: IconProps) => (
  <svg {...frame(size)}>
    <path d="M20.5 3.5 L9.5 14.5" />
    <path d="M6.5 12.5 L11.5 17.5" />
    <path d="M4 20 L7 17" />
    <path d="M20.5 3.5 L15.5 4.2 L19.8 8.5 Z" />
  </svg>
);

/** Archer — a drawn bow with the arrow across it. */
export const BowIcon = ({ size = 18 }: IconProps) => (
  <svg {...frame(size)}>
    <path d="M15.5 3 C5.5 8, 5.5 16, 15.5 21" />
    <path d="M15.5 3 L15.5 21" />
    <path d="M4.5 12 H21" />
    <path d="M18 9 L21 12 L18 15" />
  </svg>
);

/** Shieldman — a heater shield. */
export const ShieldIcon = ({ size = 18 }: IconProps) => (
  <svg {...frame(size)}>
    <path d="M12 2.5 L20 5.5 V12 c0 5-4 7.8-8 9.5 C8 19.8 4 17 4 12 V5.5 Z" />
    <path d="M12 6 V17" />
  </svg>
);

/**
 * Knight — a couched lance, long with a vamplate at the grip.
 *
 * A great helm was the obvious choice and was tried twice; at list size the
 * dome over a slit reads as a padlock. The lance also keeps the set honest —
 * every other row shows a weapon.
 */
export const LanceIcon = ({ size = 18 }: IconProps) => (
  <svg {...frame(size)}>
    <path d="M3.5 20.5 L20.5 3.5" />
    <path d="M6.8 14.2 L10.5 17.9" />
    <path d="M9.6 11.4 L13.3 15.1" />
    <path d="M20.5 3.5 L15.8 4.2 L19.8 8.2 Z" />
  </svg>
);

/** In warriorsInfo / contract order. */
export const warriorWeaponIcons = [
  MaceIcon,
  SpearIcon,
  SwordIcon,
  BowIcon,
  ShieldIcon,
  LanceIcon,
];
