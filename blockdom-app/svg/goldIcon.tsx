import Image from "next/image";
import React from "react";

/**
 * Gold, the game's second good.
 *
 * The coin stack that public/svgs/gameItems/goldIcon.svg holds. That file is a
 * 6.6MB SVG wrapping a 3000x3000 PNG — around 200x more than a 32px icon can
 * use, and it shipped twice because public/svgs/icons/goldIcon.svg is a byte
 * copy of it. This points at a 160px version instead, which still has room to
 * spare at the largest size the interface draws it (~35px on a 3x display).
 *
 * It replaces the mint coin in public/svgs/balanceContainer/GOLD.svg, which was
 * struck with the retired Blockdom castle, and svg/coinIcon.tsx, which drew a
 * different coin again — gold had three different marks depending on screen.
 *
 * `alt` is empty on purpose: every use sits directly beside the number it
 * labels, so naming it again only repeats it for a screen reader.
 */
export default function GoldIcon({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/svgs/balanceContainer/GOLD.png"
      width={size}
      height={size}
      alt=""
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  );
}
