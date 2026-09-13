"use client";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useUserDataContext } from "@/context/user-data-context";
import { isRewrite, isSepolia, useDeployment } from "@/lib/deployments";
import { townRead } from "@/lib/instances";
import { formattedNumber } from "@/lib/utils";
import FoodIcon from "@/svg/foodIcon";
import GoldIcon from "@/svg/goldIcon";
import PlotCoin from "@/svg/plotCoin";
import { useAddress } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import React, { useEffect, useState } from "react";

/**
 * The daily testnet handout.
 *
 * A page rather than a modal because it is the first thing a new tester needs
 * and the last thing they should have to hunt for — it is linked from the bar
 * under the nav on every game screen.
 *
 * Everything shown here is read from the contract rather than assumed: whether
 * the faucet is open, how much is left in it, and when this wallet may claim
 * again. A faucet that says "claim" and then reverts is worse than one that
 * explains why it cannot.
 */

const HANDOUT = 1000;

function formatWait(seconds: number): string {
  if (seconds <= 0) return "now";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export default function FaucetView() {
  const deployment = useDeployment();
  const address = useAddress();
  const { ownedLands, inViewLand } = useUserDataContext();
  const { claimDailyFaucet } = useBlockchainUtilsContext();

  const [open, setOpen] = useState<boolean | null>(null);
  /**
   * True when the deployed contract has no faucet at all.
   *
   * Distinct from "closed": a contract deployed before the faucet existed does
   * not answer `faucetEnabled()` — the call reverts, and Town's catch-all
   * fallback sends the unknown selector into the war module, which does not
   * have it either. Swallowing that left the page offering a Claim button that
   * could only revert, which is exactly the trap this page exists to avoid.
   */
  const [unsupported, setUnsupported] = useState(false);
  const [reserve, setReserve] = useState<BigNumber | null>(null);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [target, setTarget] = useState<string>("");

  const supported = isRewrite(deployment) && isSepolia(deployment);

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    const town = townRead(deployment);

    Promise.all([
      town.faucetEnabled(),
      town.faucetReserve(),
      address ? town.faucetNextClaimAt(address) : Promise.resolve(BigNumber.from(0)),
    ])
      .then(([enabled, left, next]: [boolean, BigNumber, BigNumber]) => {
        if (cancelled) return;
        setUnsupported(false);
        setOpen(enabled);
        setReserve(left);
        setNextAt(Number(next));
      })
      .catch(() => {
        // The three reads are view calls against a live contract; the only way
        // they fail together is that the contract predates the faucet.
        if (!cancelled) setUnsupported(true);
      });

    return () => {
      cancelled = true;
    };
  }, [supported, deployment, address]);

  // The countdown is the only thing here that moves on its own.
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const waiting = nextAt !== null ? Math.max(nextAt - now, 0) : 0;

  // Default to whichever land is already open, so the common case is one click.
  const chosen =
    target || (inViewLand ? String(inViewLand.tokenId) : ownedLands?.[0] ? String(ownedLands[0].tokenId) : "");

  const blockedReason = (): string | null => {
    if (!supported) return "The faucet only exists on the rewritten testnet contracts.";
    if (!address) return "Connect a wallet first.";
    if (unsupported)
      return "The contract deployed here predates the faucet — it needs an upgrade first.";
    if (open === null) return null;
    if (open === false) return "The faucet is closed on this deployment.";
    if (reserve && reserve.isZero()) return "The faucet is empty — it needs topping up.";
    if (!ownedLands?.length) return "You need a land first: the goods have to go somewhere.";
    if (waiting > 0) return `Already claimed. Next claim in ${formatWait(waiting)}.`;
    return null;
  };

  const reason = blockedReason();
  // `open === null` means the reads have not landed yet. Claiming on a guess is
  // what produced a button that reverted, so wait for the answer.
  const canClaim = !reason && open === true && !!chosen;

  const row = (icon: React.ReactNode, label: string) => (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-[4px] bg-white/5 px-4 py-5">
      {icon}
      <span className="text-[20px] font-semibold tabular-nums">{HANDOUT}</span>
      <span className="text-[11px] text-white/45">{label}</span>
    </div>
  );

  return (
    <div className="mx-auto flex w-[92dvw] max-w-[34rem] flex-col gap-4 pt-[7rem] pb-10">
      <div>
        <h1 className="text-[22px] font-semibold">Daily faucet</h1>
        <p className="mt-1 text-[12px] leading-relaxed text-white/50">
          Test resources, once a day, per wallet. Sepolia only — none of it is
          worth anything, which is the point: you can lose it and try again.
        </p>
      </div>

      <div className="flex flex-row gap-3">
        {row(<FoodIcon />, "Food")}
        {row(<GoldIcon />, "Gold")}
        {row(<PlotCoin size={24} />, "PLOT")}
      </div>

      {ownedLands && ownedLands.length > 1 && (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-white/50">
            Goods go to this land
          </span>
          <select
            value={chosen}
            onChange={(event) => setTarget(event.target.value)}
            className="w-full rounded-[4px] bg-black/40 px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-[color:var(--pw-accent)]"
          >
            {ownedLands.map((land) => (
              <option key={Number(land.tokenId)} value={Number(land.tokenId)}>
                {Number(land.tokenId)}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-white/35">
            The PLOT goes to your balance either way — only the food and gold
            need a parcel to sit on.
          </span>
        </div>
      )}

      {reason && <p className="text-[12px] text-[#E8B657]">{reason}</p>}

      <button
        onClick={() => canClaim && claimDailyFaucet(Number(chosen))}
        disabled={!canClaim}
        className="greenButton !w-full !rounded-[4px] px-3 py-3 text-center disabled:cursor-not-allowed disabled:opacity-40"
      >
        {waiting > 0 ? `Next claim in ${formatWait(waiting)}` : "Claim"}
      </button>

      {/* What is actually left. A faucet with nothing in it is a common enough
          state on a testnet that hiding it just produces confused reports. */}
      {supported && reserve !== null && (
        <p className="text-[11px] text-white/35">
          Faucet holds {formattedNumber(reserve)} PLOT
          {open === false && " · currently closed"}
        </p>
      )}
    </div>
  );
}
