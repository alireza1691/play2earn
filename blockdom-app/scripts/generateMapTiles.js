/**
 * Generates the 9 world-map terrain tiles as SVG.
 * Replaced public/map/{Base,Outer1..Outer8}.png (~12MB) with ~25KB of SVG.
 *
 *   node scripts/generateMapTiles.js public/map/tiles
 *
 * Tile layout on the world map (3x3):
 *   Outer3  Outer4  Outer5      <- row 0
 *   Outer2  Base    Outer6
 *   Outer1  Outer8  Outer7      <- row 2
 *
 * Land sits on the side facing the map centre, sea on the outside.
 *
 * Two things keep the nine tiles reading as one island rather than nine
 * stickers:
 *
 *  - The coastline is a function of *world* position, not tile position. Two
 *    tiles that share a border sample the same function at the same point, so
 *    the outline runs through unbroken, with a matching tangent.
 *  - Nothing is a flat fill against another flat fill. The water is banded from
 *    deep to shallow along the shore, the land carries a low-contrast mottle,
 *    and the shore itself is a sand rim under a thin surf line.
 *
 * Everything tiles on a period that divides the tile size, so no pattern
 * breaks at a tile border either.
 */
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || "public/map/tiles";
// Which palette to paint the same geometry in. The shapes, the coastline and
// the rock table are shared; only the colours differ, so both sets stay in
// register and a rock sits in the same place in either.
const SKIN = process.argv[3] || "v3";

const SIZE = 100; // viewBox units per tile
const BLEED = 12; // overshoot past a tile bound; everything past it is clipped
const NDIV = 18; // coastline samples per tile edge
const STEP = SIZE / NDIV;
const OVERRUN = 2; // samples carried past a tile bound, see buildShape
/**
 * Zero, and it stays zero.
 *
 * The nine tiles are still nested <svg> viewports for the parcel view, where
 * only one is ever on screen and there is no neighbour to seam against. The
 * world map used to assemble the same nine and did seam; it is drawn as one
 * body now (see worldBody), so there is no boundary left to paper over.
 *
 * Worth knowing if anyone reaches for this again: pushing the viewports out to
 * overlap was tried at 0.5 and 1.2 and looked WORSE both times, because a tile
 * paints its semi-transparent mottle twice over the shared strip and the
 * doubled band reads as a dark line rather than a light one.
 */
const OVERLAP = 0;
// Tuned, not guessed. 0.5 and 1.2 were both tried and both looked worse: a
// wider overlap does not hide more seam, it just moves the later tile's own
// antialiased outer edge further into its neighbour's good pixels, where it
// reads as a longer line. Just over half a pixel at the largest render is
// enough to cover the join and small enough that the displaced edge does not
// show. Re-render and look before changing it.

/**
 * The same nine tiles are drawn at two very different scales, so the coastline
 * cannot sit at one fixed inset:
 *
 *  - world:  the nine tiles ARE the island. One tile spans ~7.5 parcels, and
 *            the coast has to land just outside the 10x10 parcel grid, which
 *            covers a little under half the map. Hence a deep inset.
 *  - parcel: the zoomed view uses one tile as the backdrop of a *single*
 *            parcel. Only the outermost ring of parcels is coastal, so the
 *            water is a thin strip along that parcel's outer edge.
 *
 * Shore detail is sized against whichever of the two strips it belongs to, so
 * neither set ends up with a sand rim eating a quarter of its land.
 */
const VARIANTS = {
  world: { inset: 71, dir: "." },
  parcel: { inset: 14, dir: "parcel" },
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function metrics(inset, waves = "world") {
  const strip = SIZE - inset; // land depth in an outer tile
  const detail = clamp(strip / 45, 0.45, 1); // scales shore ornament
  return {
    inset,
    waves,
    taper: Math.min(20, strip * 0.45), // wobble easing at an inner corner
    chamfer: Math.min(9, strip * 0.3), // how far short of it a run stops
    amp: clamp(strip / 45, 0.78, 1.2), // coastline wobble
    band: Math.min(1, (2 * inset) / 34), // shallows, capped at their base width
    detail,
    grass: false,
  };
}

const PALETTES = {
  v3: {
    deep: "#0a4a7a",
    // widest/darkest first: each band is stroked on the coast, narrower and
    // lighter, so the water reads as getting shallower towards the shore
    shallows: [
      [34, "#0f568d"],
      [27, "#14639b"],
      [21, "#1a72ac"],
      [15, "#2183bd"],
      [10, "#2b95cc"],
      [5, "#3aa6d8"],
    ],
    seaHi: "#12639f",
    seaLo: "#08416e",
    land: "#86a556",
    landHi: "#9cba6c",
    landLo: "#6d8b43",
    sand: "#e3d9a6",
    // scenery
    // ground cover: thicker green and thinner, drier green
    vegDense: "#5d8a2c",
    vegSparse: "#bccb85",
    swell: "#cdeaf7",
    rock: "#5d6f7c",
    rockLit: "#8ea0aa",
    surf: "#bfeaf7",
    shore: "#c9bd84",
    /* Same four steps, warmer, for the brighter skin. */
    shoreBands: [
      ["#7d9a52", 9],
      ["#a8b26a", 6.6],
      ["#d2c89a", 4.4],
      ["#e8dfb4", 2.4],
    ],
    wetSand: "#a89b6d",
    /* Same roles as v4, warmer, to match this skin's brighter ground. */
  },

  /*
   * v4: the map wearing the site's own skin.
   *
   * Two rules decide every value here.
   *
   * 1. The water belongs to the page. It steps down to near the app's ink
   *    (#0D0F12) at its outer edge, so the map dissolves into the surface it
   *    sits on instead of ending at a bright rectangle. The one saturated line
   *    in the whole scene is the surf, which is the product accent (#98FBD7) —
   *    the interface colour, spent on the one edge that matters.
   * 2. The land stays warm and legible, because it is the board: it is what
   *    players read parcels and towns off. It keeps the v3 hues, pulled down
   *    out of the glare so they sit against the dark water rather than glowing.
   *
   * And it stays FLAT. Ground variation is mottle and how thick the tree cover
   * is; nothing steps or shades into relief, because every one of the 10,000
   * lands is a building plot and a hill would say otherwise.
   */
  v4: {
    deep: "#0b141b",
    shallows: [
      [34, "#10222d"],
      [27, "#143040"],
      [21, "#17394a"],
      [15, "#1a4152"],
      [10, "#1e4a5c"],
      [5, "#235567"],
    ],
    seaHi: "#17313f",
    seaLo: "#0a1720",
    /*
     * The greens carry a hue spread, not just a lightness ramp.
     *
     * They used to sit within three degrees of each other — one colour at three
     * brightnesses — which is what made the ground read as tinted paper rather
     * than as land. Real ground does the opposite: what is in shade cools
     * towards blue-green, what the light reaches warms towards yellow. Spread
     * across about forty degrees of hue with the lightness left where it was,
     * the same mottle starts reading as ground.
     *
     * The warm end is held back on purpose. Pushed further it goes acidic and
     * the ground starts looking like moss; about forty degrees of spread is
     * where it reads as terrain and stops. vegSparse also came down from 53%
     * to 46% lightness — it was the pale patch that washed out at world zoom.
     */
    land: "#486138",
    landHi: "#657a48",
    landLo: "#2d4c2c",
    sand: "#9d9068",
    vegDense: "#26642d",
    vegSparse: "#7d9457",
    /*
     * How hard the two ground layers push, and they are not interchangeable.
     * The soil mottle is a field of light and dark blobs, which the eye reads
     * as bumps — turn it up and the ground looks lumpy under the towns. Tree
     * cover is marks, which reads as vegetation however thick it gets. So the
     * detail lives in the cover and the mottle only tempers the flat fill.
     */
    soil: 0.26,
    cover: 0.66,
    swell: "#7fb6cc",
    rock: "#5d6f7c",
    rockLit: "#8ea0aa",
    surf: "#98fbd7",
    shore: "#8a7f5c",
    /*
     * The shore, as a slope rather than a rim. Grass gives way to dry scrub,
     * scrub to sand, sand to the wet strip the water keeps darker — four
     * narrowing bands inside the coast, so the ground reads as falling away to
     * the sea instead of stopping at a line.
     *
     * Deliberately only here, in the strip outside the parcel grid: this is
     * shading, and shading anywhere a land sits would make one plot look like
     * it stands higher than its neighbour.
     */
    shoreBands: [
      ["#5a7340", 9],
      ["#7c8a52", 6.6],
      ["#9d9068", 4.4],
      ["#b3a97e", 2.4],
    ],
    wetSand: "#6f6a4e",
    /*
     * The colour the page behind the map is painted in. Only v4 sets it: the
     * world SVG fades to it at the edges, so the ocean dissolves into the page
     * instead of ending at a bright rectangle with a visible border. v3 leaves
     * it unset and gets no fade.
     */
    edgeFade: "#0d0f12",
  },
};

const palette = PALETTES[SKIN];
if (!palette) {
  console.error(`unknown skin "${SKIN}" — expected one of ${Object.keys(PALETTES).join(", ")}`);
  process.exit(1);
}

const r = (n) => Math.round(n * 10) / 10;
const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * Coastline displacement in world units, sampled along a world edge.
 * `u` runs 0..3 across the three tiles of that edge. Summed sines rather than
 * noise so it is smooth and identical either side of a tile border — that is
 * what makes the outline continuous.
 */
/*
 * Coastline wobble, as summed sines of `u` — and the two variants need
 * genuinely different waves.
 *
 *  - world:  the three tiles of an edge ARE one coast, so u runs 0..3 across
 *            them and the waves must NOT repeat per tile; fractional
 *            frequencies are the whole point.
 *  - parcel: the opposite case. One tile backs one parcel, and the same file is
 *            repeated all the way down an edge of the board — ten west-edge
 *            parcels are ten copies of Outer2. A wave that does not complete a
 *            whole number of cycles per tile therefore starts the next copy at
 *            a different height, and every parcel boundary shows a step in the
 *            shoreline. Integer frequencies match value AND slope across the
 *            join, so the copies read as one continuous coast.
 *
 * The cost of the fix is that every copy wobbles identically — unavoidable
 * when they are literally the same file, and a far better trade than a visible
 * jog at every parcel edge.
 */
const WAVES = {
  world: {
    top: [
      [3.4, 0.41, 0.17],
      [2.1, 0.97, 0.63],
      [1.1, 1.83, 0.28],
    ],
    bottom: [
      [3.1, 0.36, 0.72],
      [2.3, 1.05, 0.11],
      [1.0, 1.91, 0.85],
    ],
    left: [
      [3.6, 0.44, 0.39],
      [1.9, 0.89, 0.94],
      [1.2, 1.74, 0.52],
    ],
    right: [
      [3.2, 0.39, 0.06],
      [2.2, 1.01, 0.47],
      [1.1, 1.87, 0.71],
    ],
  },
  parcel: {
    top: [
      [3.0, 1, 0.17],
      [1.6, 2, 0.63],
      [0.8, 3, 0.28],
    ],
    bottom: [
      [2.8, 1, 0.72],
      [1.7, 2, 0.11],
      [0.8, 3, 0.85],
    ],
    left: [
      [3.1, 1, 0.39],
      [1.5, 2, 0.94],
      [0.9, 3, 0.52],
    ],
    right: [
      [2.9, 1, 0.06],
      [1.7, 2, 0.47],
      [0.8, 3, 0.71],
    ],
  },
};

const displace = (set, edge, u) =>
  WAVES[set][edge].reduce(
    (sum, [amp, freq, phase]) =>
      sum + amp * Math.sin(2 * Math.PI * (freq * u + phase)),
    0
  );

/**
 * Walks the tile's boundary ring and returns the land polygon plus the open
 * coast path. `sides` are the edges that face open sea; for every tile that
 * has any, they are contiguous, so the coast is a single run.
 */
function buildShape(sides, col, row, m) {
  const N = sides.includes("top") ? m.inset : -BLEED;
  const S = sides.includes("bottom") ? SIZE - m.inset : SIZE + BLEED;
  const W = sides.includes("left") ? m.inset : -BLEED;
  const E = sides.includes("right") ? SIZE - m.inset : SIZE + BLEED;

  const corner = { tl: [W, N], tr: [E, N], br: [E, S], bl: [W, S] };
  const ring = [
    ["top", corner.tl, corner.tr],
    ["right", corner.tr, corner.br],
    ["bottom", corner.br, corner.bl],
    ["left", corner.bl, corner.tl],
  ];

  if (sides.length === 0) {
    const p = [corner.tl, corner.tr, corner.br, corner.bl];
    return {
      land: `M${p.map((q) => `${r(q[0])} ${r(q[1])}`).join("L")}Z`,
      coast: "",
    };
  }

  // Rotate the ring so the sea run starts at index 0.
  let start = 0;
  for (let i = 0; i < 4; i++) {
    if (sides.includes(ring[i][0]) && !sides.includes(ring[(i + 3) % 4][0])) {
      start = i;
      break;
    }
  }
  const ordered = [0, 1, 2, 3].map((k) => ring[(start + k) % 4]);
  const seaEdges = ordered.filter(([name]) => sides.includes(name));

  // Sample the coast. A tile-boundary end takes the world displacement as is,
  // so the neighbour continues it; an inner-corner end eases to zero, so the
  // two runs of a corner tile meet cleanly at the corner itself.
  // On a corner tile the two sea edges meet at the tile's inner corner. Running
  // them into that corner gives a square headland, so each run stops CHAMFER
  // short of it and the smoothing rounds the gap into a diagonal cape. The
  // wobble also eases off towards the corner, keeping the cape clean. The far
  // ends sit on a tile border and keep the world displacement untouched, so
  // the neighbouring tile picks the coastline up mid-stride.
  const isCorner = seaEdges.length > 1;
  const pts = [];
  /** Each sea edge's samples, kept apart so a corner arc can be put between. */
  const runs = [];

  seaEdges.forEach(([name, from, to], edgeIndex) => {
    const run = [];
    const horizontal = name === "top" || name === "bottom";
    const along = horizontal ? 0 : 1; // axis the edge runs along
    const inward = name === "top" || name === "left" ? 1 : -1;
    const world = horizontal ? col : row;
    const base = horizontal ? from[1] : from[0];

    const dir = Math.sign(to[along] - from[along]);
    const cornerAt = edgeIndex === 0 ? to[along] : from[along];
    // edge 0 runs border -> corner and stops short of it; edge 1 resumes on the
    // far side of the corner and runs out to the next border
    const chamferAt = isCorner
      ? cornerAt + (edgeIndex === 0 ? -m.chamfer * dir : m.chamfer * dir)
      : null;

    // Samples sit on a lattice shared by the whole world edge, and each run
    // carries OVERRUN samples past the tile bound. Two tiles that meet
    // therefore agree on the sample either side of the border as well as on
    // the border itself, so the smoothed curve — and its tangent — is
    // identical across the join. Without that the coastline still lines up but
    // its direction does not, and a 34-unit-wide shallow band opens a visible
    // wedge in the water. The samples past the bound fall outside the viewBox
    // and are clipped.
    const lattice = [];
    const kStart = dir > 0 ? -OVERRUN : NDIV + OVERRUN;
    const kEnd = dir > 0 ? NDIV + OVERRUN : -OVERRUN;
    for (let k = kStart; dir > 0 ? k <= kEnd : k >= kEnd; k += dir) {
      const a = k * STEP;
      // drop lattice points the chamfer has cut away
      if (chamferAt !== null) {
        const cut =
          edgeIndex === 0 ? a * dir > chamferAt * dir : a * dir < chamferAt * dir;
        if (cut) continue;
      }
      lattice.push(a);
    }
    if (chamferAt !== null) {
      if (edgeIndex === 0) lattice.push(chamferAt);
      else lattice.unshift(chamferAt);
    }

    for (const a of lattice) {
      const u = world + a / SIZE;
      const ease = isCorner
        ? smoothstep(Math.min(1, Math.abs(a - cornerAt) / m.taper))
        : 1;

      const point = [];
      point[along] = a;
      point[1 - along] = base + displace(m.waves, name, u) * m.amp * ease * inward;
      run.push(point);
    }
    runs.push(run);
  });

  if (!isCorner) {
    pts.push(...runs[0]);
  } else {
    /*
      A real quarter arc across the corner, not one long chord.

      Each run stops `chamfer` short of the tile's inner corner, and what used
      to bridge them was a single segment. That chord is several times the STEP
      either side of it, and a smoothed curve meeting a long chord from two
      short ones turns the joint into a hard V — the notch on the north-east
      coast, repeated and magnified by every shallows band stroked over it.

      The centre falls out of the geometry: both ends sit `chamfer` from the
      corner along their own edge, so centre = P0 + P1 - corner. The arc leaves
      and rejoins each run along that run's own direction, so the joint stops
      being a joint.
    */
    const [p0, p1] = [runs[0][runs[0].length - 1], runs[1][0]];
    const c = seaEdges[0][2];
    const centre = [p0[0] + p1[0] - c[0], p0[1] + p1[1] - c[1]];
    const angle = (q) => Math.atan2(q[1] - centre[1], q[0] - centre[0]);

    let a0 = angle(p0);
    let a1 = angle(p1);
    // Always the short way round; the long way would sweep across the island.
    while (a1 - a0 > Math.PI) a1 -= Math.PI * 2;
    while (a0 - a1 > Math.PI) a1 += Math.PI * 2;

    const radius = Math.hypot(p0[0] - centre[0], p0[1] - centre[1]);
    const steps = Math.max(3, Math.round(m.chamfer / STEP) + 2);

    pts.push(...runs[0]);
    for (let i = 1; i < steps; i++) {
      const t = a0 + ((a1 - a0) * i) / steps;
      pts.push([centre[0] + Math.cos(t) * radius, centre[1] + Math.sin(t) * radius]);
    }
    pts.push(...runs[1]);
  }

  const coast = smoothPath(pts);

  // Close the polygon along the land-locked edges.
  const landEdges = ordered.filter(([name]) => !sides.includes(name));
  let land = coast;
  for (const [, , to] of landEdges) land += `L${r(to[0])} ${r(to[1])}`;

  return { land: land + "Z", coast };
}

/** Catmull-Rom through the points, emitted as cubics. Rounds inner corners. */
function smoothPath(pts) {
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    d += `C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)}`;
    d += ` ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)}`;
    d += ` ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

// Irregular soft blobs, scattered once and then reused for every tile. A
// pattern clips whatever crosses its edge, so each blob is also drawn at the
// eight neighbouring period offsets: the parts cut off one side reappear on
// the other and the field wraps with no seam and no visible lattice.
// The period (50) divides the tile size, so it also wraps across tile borders.
// Jittered grid rather than free scatter: free scatter clumps, and a clump is
// exactly what the eye picks out as "the pattern". Radii overlap heavily so the
// blobs blend into cloud rather than reading as spots.
const MOTTLE_PERIOD = 50;

/**
 * A jittered grid of blob positions for one octave. Free scatter clumps, and a
 * clump is exactly what the eye picks out as "the pattern"; the grid keeps
 * coverage even while the jitter keeps it from reading as a lattice. Radii
 * overlap heavily so the blobs blend into cloud rather than reading as spots.
 */
function blobField(period, cells, offset = 0) {
  const pitch = period / cells;
  // fixed jitter table, so the output is reproducible
  const jitter = [
    0.62, 0.18, 0.41, 0.87, 0.09, 0.73, 0.55, 0.31, 0.94, 0.26, 0.68, 0.05,
    0.83, 0.47, 0.12, 0.71, 0.36, 0.59, 0.02, 0.91, 0.24, 0.78, 0.44, 0.15,
    0.66, 0.33, 0.88, 0.51, 0.07, 0.97, 0.29, 0.61,
  ];
  const blobs = [];
  let j = offset;
  for (let gy = 0; gy < cells; gy++) {
    for (let gx = 0; gx < cells; gx++) {
      const x = (gx + jitter[j++ % jitter.length]) * pitch;
      const y = (gy + jitter[j++ % jitter.length]) * pitch;
      const radius = pitch * (0.85 + jitter[j++ % jitter.length] * 0.7);
      blobs.push([r(x), r(y), r(radius), (gx + gy) % 2 ? "lo" : "hi"]);
    }
  }
  return blobs;
}

/**
 * `id` namespaces the defs per tile; `flip` mirrors the blob field so the sea
 * does not repeat the same cloud shapes as the land sitting next to it.
 */
/**
 * Fine ground cover for the zoomed view, where one tile fills a whole parcel
 * and the bare mottle looks empty. Wrapped at the pattern period exactly like
 * mottle(), so it tiles across parcel borders without a seam. Deliberately
 * low-contrast: building icons and the grid wash sit on top of it.
 */
function grass(id, scale = 1) {
  // Both zoom levels get the same marks at their own size. A world tile spans
  // about seven parcels, so tufts drawn for the zoomed view would come out as
  // coarse dashes there; the period has to keep dividing SIZE either way, or
  // the pattern breaks at a tile border.
  const period = 25 * scale;
  const rand = rng(0x6a55);
  let marks = "";
  for (let i = 0; i < 14; i++) {
    const bx = rand() * period;
    const by = rand() * period;
    const size = (0.5 + rand() * 0.5) * scale;
    const pebble = i % 5 === 0;
    for (const dx of [-period, 0, period]) {
      for (const dy of [-period, 0, period]) {
        const x = bx + dx;
        const y = by + dy;
        if (x < -2 || x > period + 2 || y < -2 || y > period + 2) continue;
        marks += pebble
          ? `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(size * 1.3)}" ry="${r(
              size * 0.9
            )}" fill="${palette.landLo}" opacity=".33"/>`
          : `<path d="M${r(x)} ${r(y)}q${r(size * 0.7)} ${r(-size * 1.7)} ${r(
              size * 1.5
            )} ${r(-size * 0.4)}" fill="none" stroke="${
              palette.landLo
            }" stroke-width="${r2(0.28 * scale)}" stroke-linecap="round" opacity=".42"/>`;
      }
    }
  }
  return {
    defs: `<pattern id="${id}-grass" width="${period}" height="${period}" patternUnits="userSpaceOnUse">${marks}</pattern>`,
    fill: `<rect x="${-BLEED}" y="${-BLEED}" width="${SIZE + BLEED * 2}" height="${
      SIZE + BLEED * 2
    }" fill="url(#${id}-grass)"/>`,
  };
}

function mottle(id, hi, lo, opacity, flip = false, period = MOTTLE_PERIOD, cells = 4, offset = 0) {
  const field = blobField(period, cells, offset);
  const stop = (color, o) =>
    `<stop offset="0" stop-color="${color}" stop-opacity="${o}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/>`;

  const circles = field.flatMap(([bx, by, radius, tone]) => {
    const x = flip ? period - bx : bx;
    const y = by;
    return [-period, 0, period].flatMap((dx) =>
      [-period, 0, period]
        .filter(
          // only emit the wrapped copies that can actually reach the tile
          (dy) =>
            x + dx + radius > 0 &&
            x + dx - radius < period &&
            y + dy + radius > 0 &&
            y + dy - radius < period
        )
        .map(
          (dy) =>
            `<circle cx="${r(x + dx)}" cy="${r(y + dy)}" r="${radius}" fill="url(#${id}-${tone})"/>`
        )
    );
  }).join("");

  return {
    defs:
      `<radialGradient id="${id}-hi">${stop(hi, opacity)}</radialGradient>` +
      `<radialGradient id="${id}-lo">${stop(lo, opacity * 0.9)}</radialGradient>` +
      `<pattern id="${id}-mottle" width="${period}" height="${period}" patternUnits="userSpaceOnUse">${circles}</pattern>`,
    fill: `<rect x="${-BLEED}" y="${-BLEED}" width="${SIZE + BLEED * 2}" height="${
      SIZE + BLEED * 2
    }" fill="url(#${id}-mottle)"/>`,
    /** The same fill over an arbitrary square — the world backdrop wants one. */
    fillAt: (side) =>
      `<rect width="${r(side)}" height="${r(side)}" fill="url(#${id}-mottle)"/>`,
  };
}

/** Tile body, without the outer <svg> — so it can also be nested into World. */
/**
 * The world map as ONE body rather than nine tiles.
 *
 * The nine exist because the zoomed view needs a tile per parcel, and the world
 * map used to be assembled from the same nine nested <svg> viewports. Each of
 * those clips at its own bound, so two neighbours each antialias their edge
 * against the other and the two half-covered pixels do not add back up to one.
 * That shortfall is the hairline seam, and it cannot be tuned away: a wider
 * overlap paints the mottle twice and turns the light line dark, dropping the
 * clip lets each tile's BLEED spill into the sea, and a backdrop underneath
 * only makes the gap blend against something closer.
 *
 * Drawn once against the world coastline there is no boundary to antialias, so
 * the seam is not reduced, it does not exist. The tiles are still generated for
 * the parcel view, which needs them one at a time and has no seam to speak of.
 *
 * Every layer is the same as tileBody's, in the same order.
 */
function worldBody(m) {
  const soil = mottle("wg", palette.landHi, palette.landLo, palette.soil ?? 0.34);
  const cover = grass("w", 0.25);
  const water = mottle("ww", palette.seaHi, palette.seaLo, 0.16, true);
  const land = worldOutline(m, 0);
  const box = `width="${WORLD}" height="${WORLD}"`;

  const stroke = (color, width, extra = "") =>
    `<use href="#w-coast" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" ${extra}/>`;

  const shallows = palette.shallows
    .map(([width, color]) => stroke(color, r(width * m.band), 'stroke-linecap="butt"'))
    .join("");

  return (
    `<defs>${soil.defs}${cover.defs}${water.defs}` +
    `<path id="w-coast" d="${land}"/>` +
    `<clipPath id="w-clip"><use href="#w-coast"/></clipPath></defs>` +
    `<rect ${box} fill="${palette.deep}"/>` +
    `<rect ${box} fill="url(#ww-mottle)"/>` +
    shallows +
    `<use href="#w-coast" fill="${palette.land}"/>` +
    `<g clip-path="url(#w-clip)">` +
    `<rect ${box} fill="url(#wg-mottle)"/>` +
    `<rect ${box} fill="url(#w-grass)"/>` +
    palette.shoreBands
      .map(([tone, width]) => stroke(tone, r(width * m.detail), 'stroke-linecap="butt"'))
      .join("") +
    `</g>` +
    stroke(palette.wetSand, r(1.8 * m.detail), 'stroke-linecap="butt" opacity=".55"') +
    stroke(palette.surf, r(2.4 * m.detail), 'stroke-linecap="butt" opacity=".3"') +
    stroke(palette.shore, r(1.1 * m.detail), 'stroke-linecap="butt"')
  );
}

function tileBody(name, sides, col, row, m) {
  const id = name.toLowerCase();
  const { land, coast } = buildShape(sides, col, row, m);
  const hasSea = sides.length > 0;
  const soil = mottle(`${id}g`, palette.landHi, palette.landLo, palette.soil ?? 0.34);
  // The zoomed view fills a whole parcel with one tile, so it needs the same
  // variation in how green the ground is that the world map gets from its
  // scenery layer. Period 100 wraps on the tile itself, so it still tiles.
  const spread = m.grass
    ? mottle(`${id}v`, palette.vegDense, palette.vegSparse, palette.cover ?? 0.5, false, SIZE, 2, 7)
    : null;
  // The world map gets the same ground marks at a quarter scale. It used to
  // have nothing but the soft mottle, which reads as cloud rather than as
  // ground; this is what makes the land look like a surface you could stand on
  // without implying that any part of it is higher than any other.
  const cover = grass(id, m.grass ? 1 : 0.25);
  const water = mottle(`${id}w`, palette.seaHi, palette.seaLo, 0.16, true);
  const box = `x="${-BLEED}" y="${-BLEED}" width="${SIZE + BLEED * 2}" height="${
    SIZE + BLEED * 2
  }"`;

  // The coast is stroked ten times over; defining it once and referencing it
  // keeps each tile a few KB rather than tens.
  const stroke = (color, width, extra = "") =>
    `<use href="#${id}-coast" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" ${extra}/>`;

  // Shallows: the coast stroked at falling widths and rising lightness. The
  // inner half of each band is painted over by the land, leaving a depth
  // gradient that hugs the shore however it bends.
  const shallows = palette.shallows
    .map(([width, color]) =>
      stroke(color, r(width * m.band), 'stroke-linecap="butt"')
    )
    .join("");

  return (
    `<defs>${soil.defs}${spread ? spread.defs : ""}${cover ? cover.defs : ""}${
      hasSea ? water.defs : ""
    }` +
    `<path id="${id}-land" d="${land}"/>` +
    (hasSea ? `<path id="${id}-coast" d="${coast}"/>` : "") +
    `<clipPath id="${id}-clip"><use href="#${id}-land"/></clipPath></defs>` +
    // Open water, then its own drift of cloud, then the shore bands over it.
    (hasSea
      ? `<rect ${box} fill="${palette.deep}"/>` + water.fill + shallows
      : "") +
    `<use href="#${id}-land" fill="${palette.land}"/>` +
    `<g clip-path="url(#${id}-clip)">${soil.fill}${spread ? spread.fill : ""}${
      cover ? cover.fill : ""
    }` +
    // The shore, widest band first so each narrower one sits inside the last.
    // All of them are stroked on the coast and clipped to the land, so only the
    // inland half survives and the sea side stays clean.
    (hasSea
      ? palette.shoreBands
          .map(([tone, width]) =>
            stroke(tone, r(width * m.detail), 'stroke-linecap="butt"')
          )
          .join("")
      : "") +
    `</g>` +
    (hasSea
      ? // Wet sand: the strip the water keeps dark, straddling the line.
        stroke(palette.wetSand, r(1.8 * m.detail), 'stroke-linecap="butt" opacity=".55"') +
        stroke(palette.surf, r(2.4 * m.detail), 'stroke-linecap="butt" opacity=".3"') +
        stroke(palette.shore, r(1.1 * m.detail), 'stroke-linecap="butt"')
      : "")
  );
}

// ---------------------------------------------------------------------------
// World features
//
// The nine tiles give the island its shape; this layer gives it somewhere to
// live. Everything here is placed in world coordinates (0..300 across all three
// tiles) and clipped either to the land or to the water, which is far easier to
// reason about than distributing features tile by tile.
//
// The ground cover runs over the whole island, including the settled interior:
// vegetation thinning out under the parcel grid is exactly what you want there.
// Rock outcrops are kept to the strip between the coast and the parcel grid
// (world 84..216), so nothing sits on top of buyable land.
// ---------------------------------------------------------------------------

const WORLD = SIZE * 3;

// Where the 10x10 parcel grid sits in world units. Derived from the CSS the
// world map uses at xl: a 2560px map, a 1126px grid at left 716.8px.
// lib/mapScenery.ts re-exports these so the zoomed view maps the same way.
const GRID_ORIGIN = 84;
const PARCEL_WORLD = 13.2;
const GRID_SPAN = PARCEL_WORLD * 10;

const r2 = (n) => Math.round(n * 1000) / 1000;

/** Deterministic PRNG, so the map is identical on every regeneration. */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Catmull-Rom through a closed loop of points. */
/**
 * Closed Catmull-Rom through the points, as cubic Beziers.
 *
 * Centripetal (alpha = 0.5), not uniform. The uniform form takes its tangent as
 * (p2 - p0) / 6 regardless of how far apart the points actually are, so where
 * the spacing changes abruptly the tangent overshoots and the curve throws a
 * spike outside the hull. That is what put the sharp barbs in the east coast:
 * each edge is sampled at a regular STEP, but the chamfer leaves a long jump
 * between the last point of one edge and the first of the next, and the two
 * samples either side of that join were being given a tangent sized for the
 * long chord and applied across the short one.
 *
 * Centripetal weighting is the standard cure — it provably produces no cusps
 * and no self-intersections whatever the spacing — and costs a couple of
 * square roots per point at build time, none at runtime.
 */
function smoothClosed(pts) {
  const at = (i) => pts[(i + pts.length) % pts.length];
  const knot = (a, b) => {
    const t = Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1]));
    // Coincident points would divide by zero; fall back to uniform there.
    return t < 1e-6 ? 1 : t;
  };

  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const d1 = knot(p0, p1);
    const d2 = knot(p1, p2);
    const d3 = knot(p2, p3);

    const c1 = (k) =>
      (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) /
      (3 * d1 * (d1 + d2));
    const c2 = (k) =>
      (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) /
      (3 * d3 * (d3 + d2));

    d += `C${r(c1(0))} ${r(c1(1))} ${r(c2(0))} ${r(c2(1))} ${r(p2[0])} ${r(p2[1])}`;
  }
  return d + "Z";
}

/**
 * The island outline in world coordinates, pushed `margin` units inland
 * (negative pushes out to sea). Same displacement function the tiles use, so it
 * tracks the rendered coast; the margin keeps features off the beach.
 */
function worldOutline(m, margin) {
  const lo = m.inset + margin;
  const hi = WORLD - m.inset - margin;
  const ch = m.chamfer;
  const pts = [];

  const ease = (a, c0, c1) =>
    smoothstep(Math.min(1, Math.min(Math.abs(a - c0), Math.abs(a - c1)) / m.taper));

  // Each world edge, walked in ring order. `along` is the axis it runs on and
  // the displacement is applied on the other one.
  const edges = [
    ["top", 0, lo + ch, hi - ch, lo, 1],
    ["right", 1, lo + ch, hi - ch, hi, -1],
    ["bottom", 0, hi - ch, lo + ch, hi, -1],
    ["left", 1, hi - ch, lo + ch, lo, 1],
  ];

  /**
   * The four corners, as quarter arcs rather than as the gap between two runs.
   *
   * Each edge stops `chamfer` short of the corner, so without this the outline
   * jumps straight from the end of one run to the start of the next. That chord
   * is long compared with the STEP either side of it, and a long chord meeting
   * short ones is where a smoothed curve turns into a hard angular notch — the
   * kink visible on the north-east coast, repeated and magnified by every
   * shallows band stroked over it.
   *
   * Centres sit `chamfer` inward on both axes, so the arc leaves and rejoins
   * each run along the run's own direction and the joint disappears.
   */
  const corners = [
    [hi - ch, lo + ch, -Math.PI / 2, 0], // top -> right
    [hi - ch, hi - ch, 0, Math.PI / 2], // right -> bottom
    [lo + ch, hi - ch, Math.PI / 2, Math.PI], // bottom -> left
    [lo + ch, lo + ch, Math.PI, Math.PI * 1.5], // left -> top
  ];
  const ARC = Math.max(3, Math.round(ch / STEP) + 2);

  edges.forEach(([edge, along, from, to, base, inward], index) => {
    const count = Math.max(2, Math.round(Math.abs(to - from) / STEP));
    for (let i = 0; i <= count; i++) {
      const a = from + ((to - from) * i) / count;
      const off =
        displace(m.waves, edge, a / SIZE) * m.amp * ease(a, lo + ch, hi - ch) * inward;
      const p = [];
      p[along] = a;
      p[1 - along] = base + off;
      pts.push(p);
    }

    // The arc that carries this run into the next one. The first and last
    // samples land exactly on the two runs' ends, so they are dropped.
    const [cx, cy, a0, a1] = corners[index];
    for (let i = 1; i < ARC; i++) {
      const t = a0 + ((a1 - a0) * i) / ARC;
      pts.push([cx + Math.cos(t) * ch, cy + Math.sin(t) * ch]);
    }
  });
  return smoothClosed(pts);
}

const vegStops = (color) =>
  `<stop offset="0" stop-color="${color}"/>` +
  `<stop offset=".45" stop-color="${color}" stop-opacity=".72"/>` +
  `<stop offset=".75" stop-color="${color}" stop-opacity=".28"/>` +
  `<stop offset="1" stop-color="${color}" stop-opacity="0"/>`;

function worldFeatures(m) {
  const rand = rng(0x5eed1a);
  const lo = m.inset;
  const hi = WORLD - m.inset;

  // ---- ground cover --------------------------------------------------------
  // Not trees — the green of the ground itself, thicker in some places than
  // others. Three octaves of soft radial blobs: a few broad ones set the
  // regions, the finer ones break up their edges. Each octave is a jittered
  // grid rather than free scatter, so the whole island gets covered without
  // the clumps and bald patches random placement leaves behind.
  //
  // This runs across the settled interior too. Vegetation thinning out under
  // the parcel grid is exactly what you want; a forest there would not be.
  const octave = (cells, radius, spread, opacity) => {
    const pitch = (hi - lo) / cells;
    let out = "";
    for (let gy = -1; gy <= cells; gy++) {
      for (let gx = -1; gx <= cells; gx++) {
        const cx = lo + (gx + rand()) * pitch;
        const cy = lo + (gy + rand()) * pitch;
        const rad = radius + rand() * spread;
        const dense = rand() < 0.55;
        out += `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}" fill="url(#veg-${
          dense ? "d" : "s"
        })" opacity="${r(opacity * (0.6 + rand() * 0.8))}"/>`;
      }
    }
    return out;
  };

  const ground =
    octave(4, 22, 16, 0.62) + octave(7, 12, 9, 0.38) + octave(12, 6, 6, 0.24);

  // ---- rocks ---------------------------------------------------------------
  // These are the one feature that has to exist at both zoom levels: the world
  // map bakes them into World.svg, the zoomed view draws them per parcel from
  // the same generated table, so a rock stays where it is when you open the
  // parcel it sits on. They are emitted to lib/mapScenery.ts for that reason.
  //
  // Sized against a land cell (PARCEL_WORLD / 10), not picked by eye — a
  // cluster spans about four fifths of one cell, so it reads as a boulder on
  // the ground rather than a landmark.
  const LAND_WORLD = PARCEL_WORLD / 10;

  /** True when the point is inland of the coast by at least `margin`. */
  const isLand = (x, y, margin) => {
    const top = m.inset + displace(m.waves, "top", x / SIZE) * m.amp;
    const bottom = WORLD - m.inset - displace(m.waves, "bottom", x / SIZE) * m.amp;
    const left = m.inset + displace(m.waves, "left", y / SIZE) * m.amp;
    const right = WORLD - m.inset - displace(m.waves, "right", y / SIZE) * m.amp;
    return (
      x > left + margin &&
      x < right - margin &&
      y > top + margin &&
      y < bottom - margin
    );
  };

  /** A cluster of overlapping boulders, as data rather than markup. */
  const outcrop = (x, y, radius) => {
    const body = [];
    const lit = [];
    const count = 3 + Math.floor(rand() * 2);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand();
      const dist = rand() * radius * 0.55;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist * 0.75;
      const rx = radius * (0.4 + rand() * 0.22);
      const ry = rx * (0.66 + rand() * 0.2);
      body.push({ dx: r2(dx), dy: r2(dy), rx: r2(rx), ry: r2(ry) });
      lit.push({
        dx: r2(dx - rx * 0.2),
        dy: r2(dy - ry * 0.32),
        rx: r2(rx * 0.6),
        ry: r2(ry * 0.48),
      });
    }
    return { x: r2(x), y: r2(y), body, lit };
  };

  const rocks = [];

  /**
   * How far into the ring of parcels around the grid a coordinate sits:
   * 0 at the ring's outer edge, 1 where the parcel grid starts, negative
   * further out to sea, 1 for anything level with the grid on that axis.
   *
   * This matters because the zoomed view backs each parcel with a *generic*
   * tile whose coast sits ~14% in from the parcel's outer edge, while the
   * world map draws the island's real, wobbling coastline. A rock only inland
   * of the real coast can still land in the generic tile's sea, so shore rocks
   * are also held well inside the ring and open-water rocks well outside it.
   */
  const bandDepth = (v) => {
    if (v < GRID_ORIGIN) return (v - (GRID_ORIGIN - PARCEL_WORLD)) / PARCEL_WORLD;
    if (v > GRID_ORIGIN + GRID_SPAN)
      return (GRID_ORIGIN + GRID_SPAN + PARCEL_WORLD - v) / PARCEL_WORLD;
    return 1;
  };

  // Shore rocks live in the strip between the coast and the parcel grid, so
  // they never land on top of buyable ground.
  for (let i = 0; i < 26; i++) {
    for (let tries = 0; tries < 40; tries++) {
      const x = GRID_ORIGIN - 20 + rand() * (GRID_SPAN + 40);
      const y = GRID_ORIGIN - 20 + rand() * (GRID_SPAN + 40);
      // Keep clear of the grid by more than a rock's own radius, so no part
      // of one ends up overlapping buyable ground.
      const clear = LAND_WORLD;
      const insideGrid =
        x > GRID_ORIGIN - clear &&
        x < GRID_ORIGIN + GRID_SPAN + clear &&
        y > GRID_ORIGIN - clear &&
        y < GRID_ORIGIN + GRID_SPAN + clear;
      if (insideGrid || !isLand(x, y, 2.5)) continue;
      if (Math.min(bandDepth(x), bandDepth(y)) < 0.4) continue;
      rocks.push(outcrop(x, y, LAND_WORLD * (0.3 + rand() * 0.18)));
      break;
    }
  }

  // A few more standing out in open water.
  for (let i = 0; i < 16; i++) {
    for (let tries = 0; tries < 40; tries++) {
      const x = rand() * WORLD;
      const y = rand() * WORLD;
      if (isLand(x, y, -3)) continue; // -3 keeps them clear of the surf line
      // outside the ring entirely, so no parcel ever has to render one
      if (Math.min(bandDepth(x), bandDepth(y)) >= 0) continue;
      rocks.push(outcrop(x, y, LAND_WORLD * (0.26 + rand() * 0.16)));
      break;
    }
  }

  // ---- open water: swell ticks and a few offshore rocks --------------------
  let swell = "";
  for (let i = 0; i < 150; i++) {
    const x = rand() * WORLD;
    const y = rand() * WORLD;
    const w = 3 + rand() * 5;
    swell += `<path d="M${r(x)} ${r(y)}q${r(w / 2)} ${r(
      -0.9 - rand()
    )} ${r(w)} 0"/>`;
  }

  return {
    ocean: `<g fill="none" stroke="${palette.swell}" stroke-width=".45" stroke-linecap="round" opacity=".3">${swell}</g>`,
    ground,
    rocks,
  };
}

const tiles = [
  ["Outer3", ["top", "left"], 0, 0],
  ["Outer4", ["top"], 1, 0],
  ["Outer5", ["top", "right"], 2, 0],
  ["Outer2", ["left"], 0, 1],
  ["Base", [], 1, 1],
  ["Outer6", ["right"], 2, 1],
  ["Outer1", ["bottom", "left"], 0, 2],
  ["Outer8", ["bottom"], 1, 2],
  ["Outer7", ["bottom", "right"], 2, 2],
];

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const ellipses = (rock, list) =>
  list
    .map(
      (e) =>
        `<ellipse cx="${r2(rock.x + e.dx)}" cy="${r2(rock.y + e.dy)}" rx="${
          e.rx
        }" ry="${e.ry}"/>`
    )
    .join("");

const rockMarkup = (rocks) =>
  `<g fill="${palette.rock}" opacity=".85">${rocks
    .map((k) => ellipses(k, k.body))
    .join("")}</g>` +
  `<g fill="${palette.rockLit}" opacity=".7">${rocks
    .map((k) => ellipses(k, k.lit))
    .join("")}</g>`;

// The world view wants all nine at once. As nine <img> elements they leave
// hairline seams — a third of 2560px is not a whole number of pixels — so ship
// the island as one file. Nested <svg> gives each tile its own clipped 100x100
// viewport, exactly as if it were still a separate file.
{
  const m = metrics(VARIANTS.world.inset);
  const scenery = worldFeatures(m);
  const world =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE * 3} ${
      SIZE * 3
    }" preserveAspectRatio="none">` +
    worldBody(m) +
    // Scenery sits on top of the finished ground, clipped to water or to land.
    // The sea clip is the viewport with the island punched out of it (even-odd
    // on two subpaths), so swell never rides over the beach.
    `<defs>` +
    // A shaped falloff rather than the default linear one, so the blobs blend
    // into each other instead of stacking up as visible cones.
    `<radialGradient id="veg-d">${vegStops(palette.vegDense)}</radialGradient>` +
    `<radialGradient id="veg-s">${vegStops(palette.vegSparse)}</radialGradient>` +
    `<clipPath id="sea-clip"><path clip-rule="evenodd" d="M0 0H${WORLD}V${WORLD}H0Z${worldOutline(
      m,
      -2
    )}"/></clipPath>` +
    `<clipPath id="coast-clip"><path d="${worldOutline(m, 0)}"/></clipPath>` +
    `<clipPath id="land-clip"><path d="${worldOutline(m, 7)}"/></clipPath>` +
    `</defs>` +
    `<g clip-path="url(#sea-clip)">${scenery.ocean}</g>` +
    `<g clip-path="url(#coast-clip)">${scenery.ground}</g>` +
    // Rocks are placed against the coastline already, so they need no clip —
    // and must not have one, or they would not match the zoomed view, which
    // draws the same table with nothing to clip against.
    rockMarkup(scenery.rocks) +
    // Painted last so it takes the rocks and the swell down with the water.
    (palette.edgeFade
      ? `<defs><radialGradient id="edge-fade" cx="50%" cy="50%" r="50%">` +
        `<stop offset="54%" stop-color="${palette.edgeFade}" stop-opacity="0"/>` +
        `<stop offset="100%" stop-color="${palette.edgeFade}" stop-opacity="1"/>` +
        `</radialGradient></defs>` +
        `<rect width="${WORLD}" height="${WORLD}" fill="url(#edge-fade)"/>`
      : "") +
    `</svg>`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "World.svg"), world);
  console.log(`World.svg  ${kb(world.length)}`);
}

// Rocks are the one feature both zoom levels have to agree on, so they are
// written out as data for the zoomed view to draw from. Only the base skin
// writes it: the table is shared by every deployment, and rewriting it from a
// skin run would reshuffle rocks under the other one.
if (SKIN === "v3") {
  const m = metrics(VARIANTS.world.inset);
  const { rocks } = worldFeatures(m);
  const module = `// GENERATED by scripts/generateMapTiles.js — do not edit by hand.
//
// Rocks live in world units: 0..${WORLD} across the whole map. The world view
// bakes them into World.svg; the zoomed view draws the ones that fall inside
// each parcel, so a rock stays put when you open the parcel it sits on.

export const WORLD_SIZE = ${WORLD};
/** World coordinate of the parcel grid's top-left corner. */
export const GRID_ORIGIN = ${GRID_ORIGIN};
/** World units per parcel; a land cell is a tenth of this. */
export const PARCEL_WORLD = ${PARCEL_WORLD};

export const ROCK_FILL = ${JSON.stringify(palette.rock)};
export const ROCK_LIT = ${JSON.stringify(palette.rockLit)};

export type RockPart = { dx: number; dy: number; rx: number; ry: number };
export type Rock = { x: number; y: number; body: RockPart[]; lit: RockPart[] };

export const ROCKS: Rock[] = ${JSON.stringify(rocks)};

/**
 * World-space box of a parcel, keyed by its origin coordinates.
 *
 * Parcel y runs the opposite way to screen y: the map's top row is the highest
 * y (see allLands()), so 190 is the top row and 100 the bottom.
 */
export function parcelWorldBox(x: number, y: number) {
  return {
    x: GRID_ORIGIN + ((x - 100) / 10) * PARCEL_WORLD,
    y: GRID_ORIGIN + ((190 - y) / 10) * PARCEL_WORLD,
    size: PARCEL_WORLD,
  };
}

/**
 * Rocks overlapping a parcel. A rock straddling the edge is included and gets
 * clipped by the SVG viewport, which is what the world map shows too.
 */
export function rocksInParcel(x: number, y: number): Rock[] {
  const box = parcelWorldBox(x, y);
  // just wider than the largest rock, so only genuinely overlapping ones\n  // are picked up by both neighbours\n  const pad = PARCEL_WORLD * 0.06;
  return ROCKS.filter(
    (rock) =>
      rock.x > box.x - pad &&
      rock.x < box.x + box.size + pad &&
      rock.y > box.y - pad &&
      rock.y < box.y + box.size + pad
  );
}
`;
  fs.mkdirSync("lib", { recursive: true });
  fs.writeFileSync(path.join("lib", "mapScenery.ts"), module);
  console.log(`lib/mapScenery.ts  ${rocks.length} rocks, ${kb(module.length)}`);
}

// The zoomed view backs each parcel with its own tile, so those stay separate.
{
  const m = { ...metrics(VARIANTS.parcel.inset, "parcel"), grass: true };
  const dir = path.join(OUT, VARIANTS.parcel.dir);
  fs.mkdirSync(dir, { recursive: true });
  let total = 0;
  for (const [name, sides, col, row] of tiles) {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" preserveAspectRatio="none">` +
      tileBody(name, sides, col, row, m) +
      `</svg>`;
    fs.writeFileSync(path.join(dir, `${name}.svg`), svg);
    total += svg.length;
  }
  console.log(`${VARIANTS.parcel.dir}/  ${tiles.length} tiles, ${kb(total)}`);
}
