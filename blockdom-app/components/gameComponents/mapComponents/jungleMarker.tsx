import React, { memo } from "react";

/**
 * Marks a parcel as wild, and says what is in it.
 *
 * The map's rule is that the land is the board and stays flat: ground variation
 * is cover and mottle, never relief, because every plot is a building site and a
 * hill would say otherwise. So a jungle is drawn the way the terrain draws
 * vegetation — flat canopy blobs in the tile palette's own greens — rather than
 * as an icon sitting on top of the board.
 *
 * Two things this fixes, both of which made wild lands look pasted on:
 *
 *  - The canopy used to be stamped INSIDE each land: the same 3x3 jitter ran per
 *    land, so five neighbouring wild lands read as five squares rather than one
 *    forest. The blob field is now keyed to WORLD position and each land draws
 *    the part of it that falls in its own window, so a cluster grows together
 *    and only its outer edge carries a rim.
 *  - A wild land showed nothing of what raiding it would pay. Town.sol gives one
 *    two goods, food and gold, that regrow to WildGoodsPerType over
 *    WildRegenPeriod, plus a garrison — so the canopy opens into a clearing
 *    holding countable marks: fruit for food, cut nuggets for gold, spears for
 *    the garrison, all of them thinning out as the land is picked over.
 *
 * Everything here is cut from the same material set the town marker uses:
 * greens for ground and cover, warm timber and bone for made things, amber for
 * loot. No interface colour appears — accent is hover and selection only.
 */

/** Straight from the v4 tile palette in scripts/generateMapTiles.js. */
const CANOPY_DARK = "#2f5a1c";
const CANOPY = "#3f6b22";
const CANOPY_LIGHT = "#5d8a33";
const RIM = "#1f3a14";
const GROUND_LO = "#3b4c2e";
const GROUND_HI = "#5e7a45";
const SAND = "#9d9068";

/* Loot, and what guards it. */
const FOOD = "#d8a13f";
const FOOD_LIT = "#f0c46e";
const GOLD = "#e8cf7a";
const GOLD_LIT = "#fff2c0";
const GOLD_DARK = "#9c7a22";
const TIMBER = "#6b5233";
const BONE = "#cfc6ae";

/** Inverse of .viewGrid's ground-plane projection — see townMarker.tsx. */
const ISO_UNSHEAR = "matrix(0.745 -0.671 1.241 1.229 0 0)";

/** One land is 32 units square, the same box every marker is drawn in. */
const LAND = 32;
/** Canopy spacing, in those units. Coarser than it looks: blobs overlap. */
const PITCH = 7;
/** How far past a land's own window a blob may be centred and still reach it. */
const REACH = 8;

/** Mask bit for the neighbour at (dc, dr), dc east-positive, dr down-screen. */
export const neighbourBit = (dc: number, dr: number) => 1 << ((dr + 1) * 3 + (dc + 1));
/** A land with no wild neighbours: only its own bit set. */
export const LONE_WILD = neighbourBit(0, 0);

/**
 * The land ids around a land, in the order the mask expects them.
 *
 * A token id is the decimal concatenation of x and y, so east is +1000 and one
 * row DOWN the screen is -1: parcelLands() walks y from high to low.
 */
export function wildNeighbourIds(landId: number): { dc: number; dr: number; id: number }[] {
  const around: { dc: number; dr: number; id: number }[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dc === 0 && dr === 0) continue;
      const id = landId + dc * 1000 - dr;
      // Ids only exist for x and y in 100..199. Past that edge there is sea, and
      // hashing a coordinate that cannot be minted would grow canopy into it.
      const x = Math.floor(id / 1000);
      const y = id % 1000;
      if (x < 100 || x > 199 || y < 100 || y > 199) continue;
      around.push({ dc, dr, id });
    }
  }
  return around;
}

/**
 * How much a wild land is holding, as marks to draw.
 *
 * `fill` is the share of a full regrowth: 1 is untouched, 0 is stripped. Both
 * goods regrow on the same clock in the contract, so one number drives all
 * three counts.
 */
export const wildCounts = (fill: number) => ({
  food: Math.round(Math.max(0, Math.min(1, fill)) * 4),
  gold: Math.round(Math.max(0, Math.min(1, fill)) * 4),
  garrison: Math.round(Math.max(0, Math.min(1, fill)) * 3),
});

/**
 * Deterministic jitter for one node of the canopy field.
 *
 * Hashed from the node's own grid position rather than drawn from a running
 * sequence, so two lands sampling the same node get the same blob — that is
 * what lets neighbouring lands share one thicket without sharing a component.
 */
function nodeRandom(gx: number, gy: number) {
  let s = (gx * 374761393 + gy * 668265263) >>> 0;
  s ^= s >>> 13;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000) / 1000;
  };
}

type Blob = { cx: number; cy: number; r: number; tone: string; lit: boolean };

/**
 * Screen-space position of a land, in canopy-field units.
 *
 * Rows run the opposite way to y: the top row of the map is the highest y (see
 * parcelLands), so the field's y grows as the land's y shrinks.
 */
function landWindow(landId: number) {
  const x = Math.floor(landId / 1000);
  const y = landId % 1000;
  return { x: x * LAND, y: (199 - y) * LAND };
}

function canopy(landId: number, neighbours: number): Blob[] {
  const win = landWindow(landId);
  const blobs: Blob[] = [];

  const from = (v: number) => Math.floor((v - REACH) / PITCH);
  const to = (v: number) => Math.ceil((v + LAND + REACH) / PITCH);

  for (let gy = from(win.y); gy <= to(win.y); gy++) {
    for (let gx = from(win.x); gx <= to(win.x); gx++) {
      const rand = nodeRandom(gx, gy);
      const cx = gx * PITCH + (rand() - 0.5) * PITCH * 0.85;
      const cy = gy * PITCH + (rand() - 0.5) * PITCH * 0.85;

      // A blob belongs to the land it is centred on: draw it only if that land
      // is wild too, or the thicket would spill onto open ground.
      const dc = Math.floor(cx / LAND) - win.x / LAND;
      const dr = Math.floor(cy / LAND) - win.y / LAND;
      if (dc < -1 || dc > 1 || dr < -1 || dr > 1) continue;
      if (!(neighbours & neighbourBit(dc, dr))) continue;

      const r = 4 + rand() * 2.4;
      const shade = rand();
      blobs.push({
        cx,
        cy,
        r,
        tone: shade > 0.74 ? CANOPY_LIGHT : shade > 0.32 ? CANOPY : CANOPY_DARK,
        lit: shade > 0.6,
      });
    }
  }
  return blobs;
}

/** Where the loot sits in the clearing, filled in order as the land regrows. */
const FOOD_SPOTS: [x: number, y: number][] = [
  [10.4, 17.4],
  [12.6, 21.4],
  [9.6, 21.2],
  [13.2, 16.4],
];
const GOLD_SPOTS: [x: number, y: number][] = [
  [20.6, 18.2],
  [19.2, 21.6],
  [22.4, 21],
  [22, 16.6],
];

export const JungleMarker = memo(function JungleMarker({
  landId,
  /**
   * Which of the eight lands around this one are wild too. Without it every
   * land is an island and the canopy stops at its own edge — see canopy().
   */
  neighbours = LONE_WILD,
  /** Share of a full regrowth, 0..1. Defaults to full. */
  fill = 1,
}: {
  landId: number;
  neighbours?: number;
  fill?: number;
}) {
  const win = landWindow(landId);
  const blobs = canopy(landId, neighbours);
  const { food, gold, garrison } = wildCounts(fill);
  // Ground shows through where the land has been stripped; the canopy is the
  // first read of how much is left in there.
  const thinned = Math.max(0, 0.42 * (1 - fill));

  /** In the land's own 0..32 box, offset into the shared field. */
  const at = (v: number, axis: "x" | "y") => (axis === "x" ? win.x + v : win.y + v);
  const unshear = (x: number, y: number) =>
    `translate(${x} ${y}) ${ISO_UNSHEAR} translate(${-x} ${-y})`;

  const edge = (dc: number, dr: number) => !(neighbours & neighbourBit(dc, dr));

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`${win.x} ${win.y} ${LAND} ${LAND}`}
      preserveAspectRatio="none"
    >
      {/* Under the canopy, so the gaps between blobs read as shaded floor
          rather than as the empty grid cell showing through. */}
      <rect x={win.x} y={win.y} width={LAND} height={LAND} fill={CANOPY_DARK} opacity={0.62} />

      {blobs.map((b, i) => (
        <g key={i}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.tone} opacity={0.9} />
          {b.lit && (
            <circle
              cx={b.cx - b.r * 0.3}
              cy={b.cy - b.r * 0.32}
              r={b.r * 0.4}
              fill={CANOPY_LIGHT}
              opacity={0.45}
            />
          )}
        </g>
      ))}

      {thinned > 0 && (
        <rect
          x={at(2, "x")}
          y={at(2, "y")}
          width={LAND - 4}
          height={LAND - 4}
          rx={3}
          fill={GROUND_LO}
          opacity={thinned}
        />
      )}

      {/*
        The clearing the cache sits in. Without it the loot marks float on
        canopy, which is exactly the pasted-on look the canopy itself had.
      */}
      <ellipse cx={at(16, "x")} cy={at(19.6, "y")} rx={9.4} ry={6.4} fill={GROUND_LO} opacity={0.72} />
      <ellipse cx={at(16, "x")} cy={at(19.6, "y")} rx={9.4} ry={6.4} fill={SAND} opacity={0.1} />
      <ellipse cx={at(15.4, "x")} cy={at(18.6, "y")} rx={7.6} ry={4.9} fill={GROUND_HI} opacity={0.2} />

      {/* Food: fruit gathered on the west side. */}
      {FOOD_SPOTS.slice(0, food).map(([x, y], i) => (
        <g key={`f${i}`}>
          <ellipse cx={at(x, "x")} cy={at(y + 1.1, "y")} rx={2.5} ry={1.5} fill="#05090C" opacity={0.25} />
          <circle cx={at(x - 1, "x")} cy={at(y, "y")} r={1.5} fill={FOOD} />
          <circle cx={at(x + 1.1, "x")} cy={at(y + 0.4, "y")} r={1.5} fill={FOOD} />
          <circle cx={at(x + 0.1, "x")} cy={at(y - 1.2, "y")} r={1.5} fill={FOOD_LIT} />
        </g>
      ))}

      {/* Gold: cut nuggets on the east side, each with a lit top face. */}
      {GOLD_SPOTS.slice(0, gold).map(([x, y], i) => (
        <g key={`g${i}`}>
          <ellipse cx={at(x, "x")} cy={at(y + 1.2, "y")} rx={2.3} ry={1.3} fill="#05090C" opacity={0.25} />
          <path
            d={`M${at(x, "x")} ${at(y - 1.9, "y")}L${at(x + 2.1, "x")} ${at(y, "y")}L${at(x, "x")} ${at(y + 1.9, "y")}L${at(x - 2.1, "x")} ${at(y, "y")}Z`}
            fill={GOLD}
          />
          <path
            d={`M${at(x, "x")} ${at(y - 1.9, "y")}L${at(x + 2.1, "x")} ${at(y, "y")}L${at(x, "x")} ${at(y, "y")}Z`}
            fill={GOLD_LIT}
          />
          <path
            d={`M${at(x, "x")} ${at(y + 1.9, "y")}L${at(x - 2.1, "x")} ${at(y, "y")}L${at(x, "x")} ${at(y, "y")}Z`}
            fill={GOLD_DARK}
            opacity={0.8}
          />
        </g>
      ))}

      {/* Garrison: spears planted at the clearing's far edge. They stand up,
          like anything else on the board that is not ground. */}
      {Array.from({ length: garrison }).map((_, i) => {
        const x = at(13.4 + i * 2.6, "x");
        const y = at(12.6, "y");
        return (
          <g key={`s${i}`} transform={unshear(x, y)}>
            <path d={`M${x} ${y}V${y - 6.2}`} stroke={TIMBER} strokeWidth={0.85} />
            <path d={`M${x} ${y - 6.2}l1.1 1.5h-2.2z`} fill={BONE} />
          </g>
        );
      })}

      {/* The rim, on the cluster's outer edges only: a forest has an outline,
          a plot inside one does not. */}
      {edge(0, -1) && <path d={`M${win.x} ${win.y}H${win.x + LAND}`} stroke={RIM} strokeOpacity={0.75} strokeWidth={1.6} />}
      {edge(0, 1) && <path d={`M${win.x} ${win.y + LAND}H${win.x + LAND}`} stroke={RIM} strokeOpacity={0.75} strokeWidth={1.6} />}
      {edge(-1, 0) && <path d={`M${win.x} ${win.y}V${win.y + LAND}`} stroke={RIM} strokeOpacity={0.75} strokeWidth={1.6} />}
      {edge(1, 0) && <path d={`M${win.x + LAND} ${win.y}V${win.y + LAND}`} stroke={RIM} strokeOpacity={0.75} strokeWidth={1.6} />}

      {/*
        The plot's own hairline, drawn here rather than left to the cell: an
        inset box-shadow paints under the element's content, so the canopy would
        bury it and a wild land would stop being countable as one land.
      */}
      <rect
        x={win.x + 0.5}
        y={win.y + 0.5}
        width={LAND - 1}
        height={LAND - 1}
        fill="none"
        stroke="#F4F4F1"
        strokeOpacity={0.11}
        strokeWidth={1}
      />
    </svg>
  );
});

export default JungleMarker;
