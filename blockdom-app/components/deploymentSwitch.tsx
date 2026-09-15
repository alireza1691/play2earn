"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Deployment,
  deploymentFor,
  switchDeployment,
  unavailableReason,
} from "@/lib/deployments";

/**
 * Moves between the four deployments without leaving the page.
 *
 * There was no way to reach v4 or v5 except by typing the URL. The routes
 * existed, the contracts were live, and nothing in the game linked to them.
 *
 * All four are listed together because they are the same game against
 * different contracts, and the useful question is "which one am I looking at",
 * which a row of tabs answers at a glance and a dropdown hides. It rewrites the
 * *current* path rather than linking to a fixed page, so switching from
 * `/v4/land/104104` lands on the same parcel under v5.
 *
 * Deployments that cannot be opened are rendered as disabled buttons rather
 * than hidden: a tab that vanishes looks like a bug, and one that says why it
 * is off is an answer.
 */

const OPTIONS: { id: Deployment; label: string; hint: string }[] = [
  {
    id: "v3-mainnet",
    label: "Main",
    hint: "The original contracts on Base",
  },
  {
    id: "v3-testnet",
    label: "v3",
    hint: "The original contracts on Sepolia",
  },
  {
    id: "v4-testnet",
    label: "v4",
    hint: "First rewrite — clans, the AMM pool, land types",
  },
  {
    id: "v5-testnet",
    label: "v5",
    hint: "Current — slippage guards, swap events, cheaper land",
  },
];

export default function DeploymentSwitch() {
  const pathname = usePathname();
  const current = deploymentFor(pathname);
  // The landing page is not a deployment, whatever deploymentFor defaults to.
  const onLanding = pathname === "/";

  return (
    <div
      className="flex flex-row items-center rounded-[6px] bg-white/10 p-[2px] gap-[2px]"
      role="group"
      aria-label="Contract version"
    >
      {OPTIONS.map((option) => {
        const active = !onLanding && option.id === current;
        const blocked = unavailableReason(option.id);

        const className = `px-2 py-[3px] text-[11px] rounded-[4px] transition-colors ${
          active
            ? "bg-[color:var(--pw-accent)] text-black font-semibold"
            : blocked
            ? "text-white/25 cursor-not-allowed"
            : "text-white/60 hover:text-white/90 hover:bg-white/10"
        }`;

        if (blocked) {
          return (
            <button
              key={option.id}
              type="button"
              disabled
              aria-disabled="true"
              title={blocked}
              className={className}
            >
              {option.label}
            </button>
          );
        }

        if (active) {
          return (
            <span
              key={option.id}
              className={className}
              aria-current="true"
              title={option.hint}
            >
              {option.label}
            </span>
          );
        }

        return (
          <Link
            key={option.id}
            href={switchDeployment(pathname, option.id)}
            className={className}
            title={option.hint}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
