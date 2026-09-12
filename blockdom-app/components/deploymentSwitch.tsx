"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { v5Deployed } from "@/lib/blockchainData";
import {
  Deployment,
  deploymentFor,
  switchDeployment,
} from "@/lib/deployments";

/**
 * Switches the testnet between contract versions without leaving the page.
 *
 * Both rewrites are live on Sepolia at their own addresses, and neither
 * replaces the other: v4 holds real state from earlier testing, v5 is the
 * current source. Comparing them means being able to flip between the two on
 * the *same* screen, so this rewrites the current path rather than sending
 * anyone back to a menu — `/v4/land/104104` becomes `/v5/land/104110`'s
 * equivalent, parameters and all.
 *
 * Deliberately absent on mainnet and on v3: there is nothing to switch between
 * there, and a control that does nothing is worse than no control.
 */

const OPTIONS: { id: Deployment; label: string; hint: string }[] = [
  {
    id: "v4-testnet",
    label: "v4",
    hint: "The first rewrite — clans, the pool, land types",
  },
  {
    id: "v5-testnet",
    label: "v5",
    hint: "Current source — slippage guards, swap events, cheaper land",
  },
];

export default function DeploymentSwitch() {
  const pathname = usePathname();
  const current = deploymentFor(pathname);

  // Only meaningful where there is more than one version of the same world.
  if (current !== "v4-testnet" && current !== "v5-testnet") return null;

  return (
    <div
      className="flex flex-row items-center rounded-[6px] bg-white/10 p-[2px] gap-[2px]"
      role="group"
      aria-label="Contract version"
    >
      {OPTIONS.map((option) => {
        const active = option.id === current;
        // v5 is a route that exists before the contracts do. Rather than let
        // someone walk into a world that reads as empty, the tab says so.
        const pending = option.id === "v5-testnet" && !v5Deployed;

        const className = `px-2 py-[3px] text-[11px] rounded-[4px] transition-colors ${
          active
            ? "bg-[color:var(--pw-accent)] text-black font-semibold"
            : "text-white/60 hover:text-white/90 hover:bg-white/10"
        }`;

        const label = (
          <>
            {option.label}
            {pending && <span className="ml-1 opacity-60">·</span>}
          </>
        );

        if (active) {
          return (
            <span
              key={option.id}
              className={className}
              aria-current="true"
              title={option.hint}
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={option.id}
            href={switchDeployment(pathname, option.id)}
            className={className}
            title={
              pending
                ? `${option.hint} — not deployed yet, reads fall back to v4`
                : option.hint
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
