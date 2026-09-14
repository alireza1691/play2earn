/**
 * Listing files, whether or not git is around.
 *
 * The checks prefer `git ls-files` because on macOS the filesystem lies: it is
 * case-insensitive, so a file committed as `Farmlv0.png` answers to
 * `farmLv0.png` and looks fine right up until Linux serves it. Git records the
 * name it actually has.
 *
 * But a build container is not guaranteed to have git, or the `.git` directory,
 * and the first version of these scripts simply threw and took the build with
 * it. The fallback is not a degraded mode: on Linux the filesystem *is*
 * case-sensitive and *is* what gets deployed, so reading it there is exactly as
 * authoritative. The only thing lost is catching a file that exists locally but
 * was never committed — which is a macOS-side mistake, where git is present.
 */
import { execSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

let gitWorks = null;

function hasGit() {
  if (gitWorks !== null) return gitWorks;
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    gitWorks = true;
  } catch {
    gitWorks = false;
  }
  return gitWorks;
}

/** Whether the listing came from git, for the scripts to say so in their output. */
export const listingSource = () => (hasGit() ? "git" : "filesystem");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(relative(process.cwd(), full).split(sep).join("/"));
  }
  return out;
}

/** Every file under `dir`, as repo-relative forward-slash paths. */
export function listFiles(dir) {
  if (hasGit()) {
    try {
      return execSync(`git ls-files ${dir}`, { encoding: "utf8" })
        .split("\n")
        .filter(Boolean)
        // ls-files still names a file deleted but not yet staged.
        .filter((f) => existsSync(f));
    } catch {
      // Fall through — a git that exists but fails here is no better than none.
    }
  }
  return walk(dir);
}

/** Source files under the given directories. */
export function listSources(dirs) {
  return dirs
    .flatMap((d) => listFiles(d))
    .filter((f) => /\.(ts|tsx)$/.test(f));
}
