import React from "react";

/**
 * The town drawn on a minted land.
 *
 * Two planes, on purpose:
 *
 *  - The WALL stays in the ground plane, so .viewGrid's
 *    `rotateY(-4) rotateX(55) rotateZ(42)` shears it into the same diamond as
 *    the plot. That is what makes it look like it encloses this land rather
 *    than floating over it.
 *  - The BUILDINGS and the BANNER carry ISO_UNSHEAR, the inverse of that
 *    projection, so they stand up facing the viewer inside the walls. It is all
 *    2D inside the element's own plane, so it needs no `transform-style:
 *    preserve-3d` and cannot disturb how the grid composites.
 *
 * Ownership is NOT painted on the plot. The map used to stroke the whole land
 * in the owner's colour at 85% opacity, which made a piece of interface the
 * loudest mark on a board otherwise built of ground and stone — and it did not
 * look like anything. A taken land is now marked the way a taken land looks:
 * it is WALLED. The owner shows in the BANNER alone, one small saturated mark
 * on a pole tall enough to clear the wall and read across a parcel.
 *
 * The wall is a thin band set in from the plot line, so a strip of ground stays
 * visible between it and the grid: it has to read as a wall around the land,
 * not as the land's border.
 */
export type MarkerTone = "mine" | "ally" | "enemy";

const TONE_FILL: Record<MarkerTone, string> = {
  mine: "#98FBD7",
  ally: "#7FB2FF",
  enemy: "#FF6969",
};

const TONE_LABEL: Record<MarkerTone, string> = {
  mine: "Your land",
  ally: "Clan member's land",
  enemy: "Another player's land",
};

/**
 * Inverse of .viewGrid's ground-plane projection, in SVG matrix order.
 *
 *   project = rotateY(-4°) · rotateX(55°) · rotateZ(42°), dropping z
 *           = [ 0.7031  -0.7100 ]
 *             [ 0.3838   0.4263 ]   (det 0.5722)
 */
const ISO_UNSHEAR = "matrix(0.745 -0.671 1.241 1.229 0 0)";
/** Where the buildings meet the ground, in the 32x32 plot. */
const BASE = { x: 16, y: 19 };

/* Building materials. Warm stone and fired tile: the wall, the towers and the
   huts are all cut from this one set, so everything built on the board is made
   of the same thing. */
const STONE = "#B9AE97";
const STONE_LIT = "#D6CDB8";
const STONE_SHADOW = "#4E4839";
const ROOF = "#8C5B4A";
const ROOF_LIT = "#A56C57";
const TIMBER = "#6B5233";

/**
 * The wall's centre line, inset from the plot so a margin of ground shows
 * between the grid line and the stone. Thin on purpose: at 35px a heavier band
 * closes the plot up and the town inside it disappears.
 */
const WALL = { x: 4.8, size: 22.4 };
const WALL_BAND = 1.9;
const WALL_SHADOW_BAND = 3;

/**
 * A town is drawn from what is actually on the land, not from its id: the
 * tower grows with the town hall, and huts appear as resource buildings do.
 * Two towns look different because they ARE different, which is the only kind
 * of variety worth having on a map — and it means the map can be read for
 * which neighbour is worth attacking.
 */
const TOWER_MIN = 5;
const TOWER_PER_LEVEL = 1.5;
const TOWER_MAX = 13;
/** Buildings are scaled down to this so they stand inside the wall. */
const INSIDE_WALL = 0.66;
/** Where the outbuildings stand, and how tall, in draw order. */
const HUTS: [x: number, height: number][] = [
  [8.9, 3.4],
  [23.4, 2.9],
  [11.1, 2.6],
];

/** Merlons along the two runs the light falls on. */
const MERLONS = (() => {
  const marks: number[] = [];
  for (let t = 7.6; t < 24.5; t += 3.2) marks.push(Number(t.toFixed(1)));
  return marks;
})();

/** A tower on each corner of the wall. */
const CORNERS: [x: number, y: number][] = [
  [WALL.x, WALL.x],
  [WALL.x + WALL.size, WALL.x],
  [WALL.x, WALL.x + WALL.size],
  [WALL.x + WALL.size, WALL.x + WALL.size],
];
const TOWER_SIZE = 4;

export default function TownMarker({
  tone,
  hall = 1,
  works = 0,
  iso = true,
}: {
  tone: MarkerTone;
  /** Town hall level: how tall the tower stands. */
  hall?: number;
  /** Resource buildings on the land: how many huts are around it. */
  works?: number;
  /** False on the flat mobile grid, which has no isometric to cancel. */
  iso?: boolean;
}) {
  const flag = TONE_FILL[tone];
  const tower =
    Math.min(TOWER_MAX, TOWER_MIN + (hall - 1) * TOWER_PER_LEVEL) * 0.82;
  // Eight resource buildings is the contract's ceiling, so the ring fills up
  // exactly as a land does.
  const huts = Math.min(3, Math.ceil(works / 3));

  const unshear = (x: number, y: number) =>
    iso ? `translate(${x} ${y}) ${ISO_UNSHEAR} translate(${-x} ${-y})` : "";
  const stand = `translate(${BASE.x} ${BASE.y}) ${
    iso ? `${ISO_UNSHEAR} ` : ""
  }scale(${INSIDE_WALL}) translate(${-BASE.x} ${-BASE.y})`;

  // Measured up from the ground line, so a taller tower grows upward instead of
  // lifting the town off its plot.
  const up = (n: number) => BASE.y - n;
  const far = WALL.x + WALL.size;
  /** The banner stands on the corner that points at the viewer's top. */
  const pole = { x: 6.2, y: 6.2, height: 11.4 };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 32 32"
      preserveAspectRatio="none"
      fill="none"
      role="img"
      aria-label={TONE_LABEL[tone]}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <title>{TONE_LABEL[tone]}</title>

      {/*
        Worked ground inside the wall. A settled land differs from an open one
        before you even see the town on it — that is what stops the marker from
        reading as a sticker laid over the terrain.

        Lightening washes rather than a green, because the same marker is drawn
        over the v3 terrain and the v4 one, whose land colours are nothing alike.
      */}
      <g>
        <rect x="3.2" y="3.2" width="25.6" height="25.6" rx="2" fill="#F4F4F1" opacity="0.06" />
        <rect x="3.2" y="3.2" width="25.6" height="25.6" rx="2" fill="#9D9068" opacity="0.1" />
        {[9.4, 14, 18.6, 23.2].map((y) => (
          <path
            key={y}
            d={`M7.6 ${y}H24.4`}
            stroke="#F4F4F1"
            strokeOpacity="0.07"
            strokeWidth="1.1"
          />
        ))}
      </g>

      {/*
        The wall, in the ground plane so it shears with the plot. Three passes:
        a wide shadow band underneath it, the stone itself, then one lit run and
        one shaded run — the light comes from the same corner as the canopy
        highlights and the buildings' lit faces.
      */}
      <rect
        x={WALL.x}
        y={WALL.x}
        width={WALL.size}
        height={WALL.size}
        rx="1.2"
        stroke={STONE_SHADOW}
        strokeOpacity="0.75"
        strokeWidth={WALL_SHADOW_BAND}
      />
      <rect
        x={WALL.x}
        y={WALL.x}
        width={WALL.size}
        height={WALL.size}
        rx="1.2"
        stroke={STONE}
        strokeWidth={WALL_BAND}
      />
      <path
        d={`M${WALL.x} ${far}V${WALL.x}H${far}`}
        stroke={STONE_LIT}
        strokeOpacity="0.9"
        strokeWidth="0.8"
      />
      <path
        d={`M${WALL.x} ${far}H${far}V${WALL.x}`}
        stroke={STONE_SHADOW}
        strokeOpacity="0.5"
        strokeWidth="0.8"
      />
      {MERLONS.map((t) => (
        <g key={t}>
          <rect x={t} y={WALL.x - 0.62} width="1.25" height="1.25" fill={STONE_LIT} opacity="0.75" />
          <rect x={WALL.x - 0.62} y={t} width="1.25" height="1.25" fill={STONE_LIT} opacity="0.75" />
        </g>
      ))}

      {/* Gate on the run that faces the viewer, so the town has a way in. */}
      <rect x={far - 8} y={far - 1.1} width="6" height="2.2" rx="0.4" fill={TIMBER} />
      <rect x={far - 8} y={far - 1.1} width="6" height="0.9" rx="0.4" fill={ROOF_LIT} opacity="0.5" />

      {CORNERS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect
            x={x - TOWER_SIZE / 2}
            y={y - TOWER_SIZE / 2}
            width={TOWER_SIZE}
            height={TOWER_SIZE}
            rx="0.5"
            fill={STONE}
          />
          <path
            d={`M${x - TOWER_SIZE / 2} ${y - TOWER_SIZE / 2}h${TOWER_SIZE}l${-TOWER_SIZE} ${TOWER_SIZE}z`}
            fill={STONE_LIT}
            opacity="0.85"
          />
          <rect
            x={x - TOWER_SIZE / 2}
            y={y - TOWER_SIZE / 2}
            width={TOWER_SIZE}
            height={TOWER_SIZE}
            rx="0.5"
            stroke={STONE_SHADOW}
            strokeOpacity="0.55"
            strokeWidth="0.6"
          />
        </g>
      ))}

      {/* Sits the cluster on the ground; stays flat, because a shadow belongs
          to the ground and not to the thing casting it. */}
      <ellipse cx={BASE.x} cy={BASE.y - 1} rx="6" ry="3.6" fill="#05090C" opacity="0.24" />

      <g transform={stand}>
        {/* Hall: the wide one at the front. */}
        <rect x="12.6" y={up(6)} width="7" height="6" fill={STONE} />
        <rect x="12.6" y={up(6)} width="2.4" height="6" fill={STONE_LIT} />
        <path d={`M11.2 ${up(6)}L16.1 ${up(9.8)}L21 ${up(6)}Z`} fill={ROOF} />
        <path d={`M11.2 ${up(6)}L16.1 ${up(9.8)}L16.1 ${up(6)}Z`} fill={ROOF_LIT} />

        {/* Tower: how far the town hall has come. */}
        <rect x="20.4" y={up(tower)} width="4.2" height={tower} fill={STONE} />
        <rect x="20.4" y={up(tower)} width="1.5" height={tower} fill={STONE_LIT} />
        <path
          d={`M19.5 ${up(tower)}L22.5 ${up(tower + 3.2)}L25.5 ${up(tower)}Z`}
          fill={ROOF}
        />

        {/* Huts: one per few resource buildings, so a worked land looks worked. */}
        {HUTS.slice(0, huts).map(([x, h], i) => (
          <g key={i}>
            <rect x={x} y={up(h)} width="4" height={h} fill={STONE} />
            <rect x={x} y={up(h)} width="1.4" height={h} fill={STONE_LIT} />
            <path
              d={`M${x - 0.9} ${up(h)}L${x + 2} ${up(h + 2.4)}L${x + 4.9} ${up(h)}Z`}
              fill={ROOF}
            />
          </g>
        ))}
      </g>

      {/*
        The banner: the only place an owner colour appears on the board. It
        stands upright like the buildings do, so it clears the wall and any
        canopy behind the plot.
      */}
      <g transform={unshear(pole.x, pole.y)}>
        <path
          d={`M${pole.x} ${pole.y}V${pole.y - pole.height}`}
          stroke={STONE_LIT}
          strokeWidth="0.9"
        />
        <path
          d={`M${pole.x} ${pole.y - pole.height}L${pole.x + 6.4} ${
            pole.y - pole.height + 1.5
          }L${pole.x} ${pole.y - pole.height + 3}Z`}
          fill={flag}
        />
        <path
          d={`M${pole.x} ${pole.y - pole.height}L${pole.x + 6.4} ${
            pole.y - pole.height + 1.5
          }L${pole.x} ${pole.y - pole.height + 1.5}Z`}
          fill={flag}
          fillOpacity="0.55"
        />
      </g>
    </svg>
  );
}
