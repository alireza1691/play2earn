import { tokenIdAsString } from "@/lib/utils";
import Image from "next/image";
import React from "react";

/**
 * The land card.
 *
 * The artwork used to carry the branding baked in — "BLOCKDOM" set vertically
 * down the left panel and the old castle glyph above the pedestal. Both were
 * painted out of `landCardBlankNumber.png` (the original is in git history) and
 * the Plotwar brand is drawn here instead, so the card follows a rename or a
 * palette change without anyone having to re-export a PNG.
 *
 * The brand overlay is one SVG on the artwork's own 506x768 coordinate grid, so
 * the wordmark and the mark stay pinned to the frame at every size the card is
 * rendered at — the attack panel draws it at 6rem wide, the land slide-bar at
 * 20rem tall.
 */
type LandCardProps = {
  /**
   * Sizing for the artwork itself, not the frame around it — the brand overlay
   * is positioned against the image, so whichever dimension is constrained has
   * to be the one on the `<img>`.
   */
  imageClassName?: string;
  /** Padding of the glass frame. */
  className?: string;
  /** Placement and size of the token id, which does not scale with the SVG. */
  idClassName?: string;
  tokenId: number;
};

export default function LandCard({
  tokenId,
  imageClassName = "h-[17rem] md:h-[20rem] w-auto",
  className = "px-2 py-2",
  idClassName = "text-[14px] right-[20%] top-[7%]",
}: LandCardProps) {
  return (
    <div
      className={`relative flex h-fit w-fit flex-shrink glassBg ${className}`}
    >
      <h3
        className={`absolute z-10 text-[color:var(--pw-accent)] ${idClassName}`}
      >
        {tokenIdAsString(tokenId)}
      </h3>
      <div className="relative inline-flex">
        <Image
          className={imageClassName}
          src={"/cards/landCardBlankNumber.png"}
          width={240}
          height={360}
          alt="card"
        />
        <CardBrand />
      </div>
    </div>
  );
}

/**
 * Plotwar's brand in the two places the old one occupied: the wordmark running
 * down the left panel, and the mark above the pedestal.
 *
 * `viewBox` is the artwork's pixel size, so every coordinate below is measured
 * straight off the PNG. The wordmark sat at x 48..75, y 69..274; the glyph at
 * x 223..285, y 632..707.
 */
function CardBrand() {
  return (
    <svg
      viewBox="0 0 506 768"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/*
        rotate(90) sends the text down the card with the glyphs turned to match
        the old wordmark. It maps a local point (a, b) to (-b, a), so from the
        translate the letters run down in y and stand up in x by their cap
        height — which is why the origin is the *left* edge of the band, not
        its baseline in the usual sense.
      */}
      <text
        transform="translate(48 70) rotate(90)"
        fill="var(--pw-accent)"
        fillOpacity="0.45"
        fontSize="36"
        fontWeight="700"
        letterSpacing="3"
      >
        PLOTWAR
      </text>
      {/*
        The mark from svg/plotwarMark.tsx — four plots at the game's isometric
        angle, the top-left one claimed. Redrawn here rather than imported
        because it has to land inside this SVG's coordinate system, and its own
        component owns a <svg> root with a 0 0 100 100 box.
      */}
      <g transform="translate(216 632) scale(0.75)" fill="var(--pw-accent)">
        <g transform="rotate(45 50 50)">
          <rect x="16" y="16" width="26" height="26" />
          <rect x="53" y="21" width="26" height="26" fillOpacity="0.7" />
          <rect x="21" y="53" width="26" height="26" fillOpacity="0.7" />
          <rect x="53" y="53" width="26" height="26" fillOpacity="0.7" />
        </g>
      </g>
    </svg>
  );
}
