#!/usr/bin/env node
/**
 * A contract method the UI calls must exist in every ABI it can be called
 * against — or be explicitly recorded below as guarded.
 *
 * This exists because `faucetBar` called `town.faucetEnabled()` on v4. v4's ABI
 * has no such function, and ethers throws `is not a function` *synchronously*,
 * before any promise exists, so the `.catch` wrapped around the surrounding
 * `Promise.all` never saw it. Every /v4/ page carrying the bar went white.
 *
 * Nothing catches that earlier. `ethers.Contract` is indexed by string, so
 * TypeScript is happy with any name at all, and the build compiles a call that
 * cannot work.
 *
 * The check is deliberately blunt: collect every `.method(` used on something
 * that came out of an instance helper, and require it in all three town ABIs.
 * Anything genuinely version-specific goes in GUARDED with the predicate that
 * gates it, which turns a silent crash into a decision someone wrote down.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const ABIS = {
  v3: "abis/townAbi.json",
  v4: "abis/v4/townAbi.json",
  v5: "abis/v5/townAbi.json",
};

/**
 * Methods that legitimately exist on only some deployments. The value is the
 * predicate in lib/deployments.ts that keeps the call away from the others —
 * recorded so the next person can check the guard is still there.
 */
const GUARDED = {
  faucet: "hasFaucet",
  faucetEnabled: "hasFaucet",
  faucetReserve: "hasFaucet",
  faucetNextClaimAt: "hasFaucet",
  // The pool, clans and land types all came in with the rewrite: v3 has none
  // of them, and every caller is behind isRewrite.
  quoteBuy: "isRewrite",
  quoteSell: "isRewrite",
  getReserves: "isRewrite",
  getGoodsPrice: "isRewrite",
  swapGoods: "isRewrite",
  transferGoods: "isRewrite",
  claimAll: "isRewrite",
  getTotalExistedGood: "isRewrite",
  // Not a predicate: lib/wildLands.ts wraps the call in try/catch. A
  // synchronous throw inside an async try *is* caught — which is exactly what
  // faucetBar got wrong, where the call sat inside Promise.all([...]) and threw
  // while the array was being built, outside any try at all. Worth knowing the
  // difference: `.catch()` on a promise does not protect the call that makes it.
  previewWildLand: "try/catch in lib/wildLands.ts",
  wildLandParameters: "try/catch in lib/wildLands.ts",
  wildLandParameters: "isRewrite",
  isWildLand: "isRewrite",
  addLiquidity: "owner-only, never called from the UI",
  retreat: "isRewrite",
  disbandArmy: "isRewrite",
  getPlotBalance: "isRewrite (v4 answers getBMTbalance, see LEGACY_V4_FRAGMENTS)",

  // Clans are v4-and-later, and they are safe for a different reason: every
  // clan call goes through lib/clans.ts, which binds the rewrite ABI whatever
  // the route. The address changes by deployment, the shape never does, so the
  // v3 function being absent cannot produce the synchronous throw.
  //
  // Listed because blockchain-utils-context builds both kinds of instance and
  // names them both `instance`, which no amount of regex will tell apart. If
  // one of these ever moves onto townWrite(), this entry becomes a lie — check
  // it rather than trusting it.
  createClan: "lib/clans.ts, always the rewrite ABI",
  joinClan: "lib/clans.ts, always the rewrite ABI",
  leaveClan: "lib/clans.ts, always the rewrite ABI",
  inviteToClan: "lib/clans.ts, always the rewrite ABI",
  kickFromClan: "lib/clans.ts, always the rewrite ABI",
  transferClanLeadership: "lib/clans.ts, always the rewrite ABI",
  requestToJoinClan: "lib/clans.ts, always the rewrite ABI",
  cancelClanRequest: "lib/clans.ts, always the rewrite ABI",
  approveClanRequest: "lib/clans.ts, always the rewrite ABI",
  rejectClanRequest: "lib/clans.ts, always the rewrite ABI",
};

/**
 * How a variable holding a contract gets created, and which ABIs that variable
 * can end up bound to.
 *
 * The distinction matters. `townRead(deployment)` returns whichever ABI the
 * route selected, so a call has to exist in all three. The clan helpers always
 * use the rewrite ABI whatever the route — `lib/clans.ts` picks the address by
 * deployment but never the shape — so a clan call can never hit the missing
 * v3 function and is not this check's problem.
 */
const HOLDER_SOURCES = [
  {
    pattern: /\b(?:townRead|townWrite|townV4PInst|townV5PInst|townV4SInst|townV5SInst|townPInst|townSInst)\b/,
    versions: ["v3", "v4", "v5"],
  },
  {
    pattern: /\b(?:clanPInst|clanV5PInst|clanSInst|clanMainnetPInst)\b/,
    versions: ["v4", "v5"],
  },
];

const abi = {};
for (const [version, path] of Object.entries(ABIS)) {
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  abi[version] = new Set(
    (parsed.abi ?? parsed)
      .filter((f) => f.type === "function")
      .map((f) => f.name)
  );
}

const sources = execSync("git ls-files components lib context app | grep -E '\\.(ts|tsx)$'", {
  encoding: "utf8",
}).split("\n").filter(Boolean);

/** method -> { files, versions it must exist in } */
const calls = new Map();

for (const file of sources) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, "utf8");

  for (const { pattern, versions } of HOLDER_SOURCES) {
    if (!pattern.test(text)) continue;

    const holders = new Set();
    // Generic names only count in files that build a town instance; a clan file
    // calling `instance.createClan` is bound to the clan ABI, not the route's.
    if (versions.length === 3) {
      for (const generic of ["town", "instance", "townInst", "townInstant", "fresh"]) {
        holders.add(generic);
      }
    }
    for (const [, name] of text.matchAll(
      new RegExp(String.raw`(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?${pattern.source}`, "g")
    )) {
      holders.add(name);
    }

    for (const holder of holders) {
      for (const [, method] of text.matchAll(
        new RegExp(String.raw`\b${holder}\s*\.\s*(\w+)\s*\(`, "g")
      )) {
        const entry = calls.get(method) ?? { files: new Set(), versions: new Set() };
        entry.files.add(file);
        for (const v of versions) entry.versions.add(v);
        calls.set(method, entry);
      }
    }
  }
}

// Things that are ethers' own, not the contract's.
const ETHERS = new Set([
  "connect", "attach", "deployed", "queryFilter", "on", "off", "once",
  "removeAllListeners", "estimateGas", "callStatic", "populateTransaction",
  "interface", "filters", "wait", "then", "catch", "provider", "signer",
]);

const problems = [];
const documented = [];

for (const [method, { files, versions }] of [...calls].sort()) {
  if (ETHERS.has(method)) continue;

  const required = [...versions];
  const missing = required.filter((v) => !abi[v].has(method));
  if (missing.length === 0) continue;
  if (missing.length === required.length) {
    // In none of them: either not a contract call at all, or a typo. Either way
    // not this check's business — the holder heuristic will pick up locals.
    continue;
  }

  const guard = GUARDED[method];
  if (!guard) {
    problems.push({ method, missing, files: [...files] });
    continue;
  }

  // An allowlist keyed on the method name alone says nothing about whether the
  // guard is still there — deleting the predicate and keeping the call would
  // pass. Where the guard names a predicate, check the calling file actually
  // mentions it. Crude, but it catches the guard being removed, which is the
  // way this regresses.
  // A bare identifier is a predicate to verify. Anything prose is a guard that
  // cannot be checked mechanically — try/catch, or a call site that never runs
  // on the older ABI — and is taken on trust, which is why the entry has to say
  // what the guard actually is.
  const predicate = /^[a-z]\w*$/.test(guard) ? guard : null;
  const ungated = predicate
    ? [...files].filter((f) => !readFileSync(f, "utf8").includes(predicate))
    : [];

  if (ungated.length) {
    problems.push({ method, missing, files: ungated, lostGuard: predicate });
  } else {
    documented.push(`  ${method} — missing from ${missing.join(", ")}, guarded by ${guard}`);
  }
}

if (documented.length) {
  console.log("Version-specific calls, each with a recorded guard:");
  console.log(documented.join("\n"));
  console.log("");
}

if (problems.length) {
  console.error("\nCalled on a deployment whose ABI does not have it:\n");
  for (const { method, missing, files, lostGuard } of problems) {
    console.error(`  ${method}()  missing from: ${missing.join(", ")}`);
    if (lostGuard) {
      console.error(`      expected to be guarded by ${lostGuard}(), which these files no longer mention:`);
    }
    for (const f of files) console.error(`      ${f}`);
    console.error("");
  }
  console.error(
    "Either guard the call with a predicate from lib/deployments.ts and add it\n" +
    "to GUARDED in this script, or stop calling it. Calling a method an ABI\n" +
    "does not have throws synchronously and takes the page down.\n"
  );
  process.exit(1);
}

console.log(`checkAbis: ${calls.size} distinct calls, none unguarded against an ABI that lacks them.`);
