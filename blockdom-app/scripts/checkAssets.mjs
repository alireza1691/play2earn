#!/usr/bin/env node
/**
 * Every image path the app can ask for must exist in git, spelled identically.
 *
 * This exists because `farmLv0.png` and `barracksLv1.png` were committed as
 * `Farmlv0.png` and `Barrackslv1.png`. macOS is case-insensitive, so both the
 * dev server and git were perfectly happy; Vercel runs on Linux, where the
 * request simply 404s. The farm one was visible in a screenshot. The barracks
 * one shipped broken and nobody noticed.
 *
 * Checked against `git ls-files` rather than the filesystem, because the
 * filesystem is exactly what lies on macOS — a file present but uncommitted, or
 * committed under another case, both look fine locally and neither reaches the
 * deployment.
 *
 * Two kinds of path:
 *
 *   literal    "/buildings/shadow.png" written into a component
 *   templated  `/buildings/farmLv${level}.png` in a helper — read out of the
 *              source and expanded, so a new building family is covered the day
 *              it is added rather than the day someone remembers this file
 */
import { readFileSync } from "node:fs";
import { listFiles, listSources, listingSource } from "./repoFiles.mjs";

const ROOTS = ["components", "lib", "app", "svg"];
const EXT = String.raw`png|PNG|jpg|jpeg|svg|gif|webp`;

/**
 * Levels a building image can actually be asked for.
 *
 * Not the contract's ceiling — `artLevel` in lib/utils.ts clamps to
 * MAX_BUILDING_ART_LEVEL, so nothing above it ever reaches a path. Keep the two
 * in step: raising one without the other either misses real gaps or invents
 * imaginary ones.
 */
const LEVELS = Array.from({ length: 7 }, (_, i) => i);

const tracked = new Set(listFiles("public"));
const byLowercase = new Map([...tracked].map((p) => [p.toLowerCase(), p]));
const sources = listSources(ROOTS);

/** path -> where it came from, so a failure names a file to open. */
const wanted = new Map();
const want = (path, origin) => {
  if (!wanted.has(path)) wanted.set(path, origin);
};

for (const file of sources) {
  const text = readFileSync(file, "utf8");

  for (const [, path] of text.matchAll(
    new RegExp(String.raw`["'\`](\/[A-Za-z0-9_\/.\-]+\.(?:${EXT}))["'\`]`, "g")
  )) {
    want(path, file);
  }

  // `/buildings/farmLv${level}.png` and friends. One placeholder, and it is
  // always a level — anything else would need a different expansion and should
  // fail loudly here rather than be quietly skipped.
  for (const [, prefix, suffix] of text.matchAll(
    new RegExp(String.raw`\`(\/[A-Za-z0-9_\/\-]*)\$\{[^}]+\}([A-Za-z0-9_\/.\-]*\.(?:${EXT}))\``, "g")
  )) {
    for (const level of LEVELS) want(`${prefix}${level}${suffix}`, file);
  }
}

const missing = [];
const miscased = [];
const gaps = [];

for (const [path, origin] of wanted) {
  const inPublic = `public${path}`;
  if (tracked.has(inPublic)) continue;

  const hit = byLowercase.get(inPublic.toLowerCase());
  if (hit) miscased.push({ path, hit, origin });
  else if (/\d+\.[A-Za-z]+$/.test(path)) gaps.push({ path, origin });
  else missing.push({ path, origin });
}

if (miscased.length) {
  console.error("\nCase mismatch — these 404 on Linux and work on macOS:\n");
  for (const { path, hit, origin } of miscased) {
    console.error(`  asked for  public${path}`);
    console.error(`  git has    ${hit}`);
    console.error(`  from       ${origin}\n`);
  }
}

if (missing.length) {
  console.error("\nNot in git — present locally is not enough:\n");
  for (const { path, origin } of missing) {
    console.error(`  public${path}   (${origin})`);
  }
  console.error("");
}

// A missing level is usually a building that stops at 3, not a mistake, so it
// is reported without failing. A wrong *name* is always a mistake.
if (gaps.length) {
  console.warn(`\nNo image for ${gaps.length} building level(s):`);
  for (const { path } of gaps) console.warn(`  public${path}`);
  console.warn("  Fine if that level is unreachable; broken art if it is not.\n");
}

const failures = miscased.length + missing.length;
if (failures) {
  console.error(`checkAssets: ${failures} problem(s).\n`);
  process.exit(1);
}
console.log(
  `checkAssets: ${wanted.size} paths, all present and correctly spelled ` +
  `(listed from ${listingSource()}).`
);
