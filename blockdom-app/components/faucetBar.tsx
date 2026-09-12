"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import {
  isRewrite,
  isSepolia,
  routeFor,
  useDeployment,
} from "@/lib/deployments";
import { townRead } from "@/lib/instances";

/**
 * A strip under the header pointing at the daily faucet.
 *
 * Sits outside the navbar rather than inside it because the game nav links are
 * `hidden lg:flex` — on a phone they are not there at all, and the faucet is
 * the one thing a new tester needs before anything else works.
 *
 * Only on Sepolia: the faucet hands out free resources, which is harmless only
 * where the resources are worthless. Never on the landing page, which belongs
 * to no deployment.
 *
 * It also says whether a claim is ready, so the answer to "can I claim yet" does
 * not require opening the page to find out.
 */
export default function FaucetBar() {
  const pathname = usePathname();
  const deployment = useDeployment();
  const address = useAddress();

  const [nextAt, setNextAt] = useState<number | null>(null);
  const [open, setOpen] = useState<boolean | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const onLanding = pathname === "/";
  const onFaucet = pathname.endsWith("/faucet");
  const supported = isSepolia(deployment) && isRewrite(deployment);
  const show = supported && !onLanding && !onFaucet;

  useEffect(() => {
    if (!show || !address) return;
    let cancelled = false;
    const town = townRead(deployment);

    Promise.all([town.faucetEnabled(), town.faucetNextClaimAt(address)])
      .then(([enabled, next]: [boolean, BigNumber]) => {
        if (cancelled) return;
        setOpen(enabled);
        setNextAt(Number(next));
      })
      // Silence is the right failure here: the bar is a shortcut, not a
      // gatekeeper, and the page itself explains anything that is wrong.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [show, deployment, address, pathname]);

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30_000);
    return () => clearInterval(id);
  }, [show]);

  if (!show || open === false) return null;

  const waiting = nextAt !== null ? Math.max(nextAt - now, 0) : 0;
  const ready = address !== undefined && nextAt !== null && waiting === 0;

  const hours = Math.floor(waiting / 3600);
  const minutes = Math.floor((waiting % 3600) / 60);
  const wait = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="fixed top-[4rem] z-40 flex w-full justify-center px-3 pointer-events-none">
      <Link
        href={routeFor(deployment, "faucet")}
        className="pointer-events-auto flex flex-row items-center gap-2 rounded-b-[6px] bg-[#0D0F12]/85 px-3 py-[5px] text-[11px] backdrop-blur-sm transition-colors hover:bg-[#0D0F12]"
        title="1000 food, 1000 gold and 1000 PLOT, once a day"
      >
        {ready && (
          <span
            aria-hidden
            className="h-[6px] w-[6px] rounded-full bg-[color:var(--pw-accent)]"
          />
        )}
        <span className="text-white/70">Daily faucet</span>
        {address && nextAt !== null && (
          <span
            className={
              ready ? "text-[color:var(--pw-accent)]" : "text-white/35"
            }
          >
            {ready ? "ready" : wait}
          </span>
        )}
      </Link>
    </div>
  );
}
