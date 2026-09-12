"use client";
import {
  DEFAULT_SLIPPAGE_PERCENT,
  SLIPPAGE_CHOICES,
  useBlockchainUtilsContext,
} from "@/context/blockchain-utils-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { hasSlippageGuards, isRewrite, useDeployment } from "@/lib/deployments";
import { townRead } from "@/lib/instances";
import { formattedNumber } from "@/lib/utils";
import CloseIcon from "@/svg/closeIcon";
import FoodIcon from "@/svg/foodIcon";
import GoldIcon from "@/svg/goldIcon";
import { BigNumberish } from "ethers";
import { parseEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

/**
 * What a land can do with the goods it already holds.
 *
 * Two contract functions that were written, tested and deployed but had no
 * button anywhere:
 *
 *   transferGoods — ship food or gold to another land you own, 5% lost in
 *                   transit. The 5% is not a fee paid to anyone; it leaves the
 *                   world, which is why it is stated before sending rather
 *                   than discovered afterwards.
 *   swapGoods     — food for gold or the reverse. The pool has no direct
 *                   good-to-good pair, so it routes through PLOT and pays the
 *                   5% swap fee twice. That is a real cost and the panel says
 *                   so; a player comparing this against selling and rebuying
 *                   should be able to see they are the same trade.
 *
 * Kept out of `swapComp` deliberately: that window is goods against PLOT, and
 * folding four directions into one set of toggles made none of them findable.
 */

const TRANSFER_LOSS_PERCENT = 5;

type Mode = "ship" | "trade";

export default function GoodsComp() {
  const { selectedWindowComponent, setSelectedWindowComponent } =
    useSelectedWindowContext();
  const { inViewLand, ownedLands } = useUserDataContext();
  const { transferGoods, swapGoods } = useBlockchainUtilsContext();
  const deployment = useDeployment();

  const [mode, setMode] = useState<Mode>("ship");
  /** 0 = food, 1 = gold — the contract's own good indices. */
  const [goodIndex, setGoodIndex] = useState<0 | 1>(0);
  const [amount, setAmount] = useState("");
  const [target, setTarget] = useState("");
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE_PERCENT);
  /** Quote tagged with the trade it was for, so a stale one cannot be shown. */
  const [quoted, setQuoted] = useState<{ key: string; value: string } | null>(
    null
  );

  const isOpen = selectedWindowComponent === "goods";
  const entered = Number(amount);
  const quoteKey = `${goodIndex}-${entered}`;
  const quote = quoted?.key === quoteKey ? quoted.value : null;

  const goodName = goodIndex === 0 ? "Food" : "Gold";
  const otherName = goodIndex === 0 ? "Gold" : "Food";
  const goodIcon = goodIndex === 0 ? <FoodIcon /> : <GoldIcon />;
  const otherIcon = goodIndex === 0 ? <GoldIcon /> : <FoodIcon />;

  // Both actions are charged to the land in view, and the contract only lets
  // its owner act — so visiting someone else's town must not offer them.
  const isMine =
    !!inViewLand &&
    !!ownedLands?.some((land) => Number(land.tokenId) === inViewLand.tokenId);

  const balance = Number(
    formattedNumber(inViewLand?.goodsBalance[goodIndex] ?? 0)
  );

  /** Lands you own that are not the one shipping — the only valid targets. */
  const destinations = (ownedLands ?? []).filter(
    (land) => Number(land.tokenId) !== inViewLand?.tokenId
  );

  /**
   * What the two hops would actually deliver.
   *
   * Priced the way the contract prices it — good to PLOT, then PLOT to the
   * other good — because there is no single quote call for the round trip. A
   * failed quote leaves the line off rather than blocking the trade.
   */
  useEffect(() => {
    if (!isOpen || mode !== "trade" || !isRewrite(deployment) || !(entered > 0))
      return;
    let cancelled = false;
    const town = townRead(deployment);
    let wei;
    try {
      wei = parseEther(amount);
    } catch {
      return;
    }
    town
      .quoteSell(goodIndex, wei)
      .then((mid: BigNumberish) =>
        town.quoteBuy(goodIndex === 0 ? 1 : 0, mid)
      )
      .then(
        (out: BigNumberish) =>
          !cancelled && setQuoted({ key: quoteKey, value: formattedNumber(out) })
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, deployment, goodIndex, entered, amount, quoteKey]);

  if (!isOpen) return null;

  const delivered =
    entered > 0 ? (entered * (100 - TRANSFER_LOSS_PERCENT)) / 100 : 0;

  const blockedReason = (): string | null => {
    if (!inViewLand) return "No land open";
    if (!isMine) return "You do not own this land";
    if (!isRewrite(deployment)) return "Not available on this deployment";
    if (!(entered > 0)) return null;
    if (entered > balance) return `Not enough ${goodName.toLowerCase()}`;
    if (mode === "ship") {
      if (!target) return "Pick a destination";
      if (destinations.length === 0) return "You own no other land";
    }
    return null;
  };

  const reason = blockedReason();
  const canSubmit = !reason && entered > 0 && (mode === "trade" || !!target);

  const submit = () => {
    if (!canSubmit) return;
    if (mode === "ship") transferGoods(goodIndex, entered, Number(target));
    else swapGoods(goodIndex, entered, slippage);
    setAmount("");
  };

  const tab = (id: Mode, label: string) => (
    <button
      onClick={() => {
        setMode(id);
        setAmount("");
      }}
      className={`flex-1 rounded-[4px] px-3 py-[6px] text-[12px] transition-colors ${
        mode === id
          ? "bg-[color:var(--pw-accent)] text-black font-semibold"
          : "text-white/60 hover:bg-white/10 hover:text-white/90"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div
        onClick={() => setSelectedWindowComponent(null)}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
      />
      <section className="tokenActionBg fixed left-1/2 top-1/2 z-[61] flex w-[92dvw] -translate-x-1/2 -translate-y-1/2 flex-col lg:w-[24rem]">
        <div className="flex h-[2rem] flex-row items-center justify-between rounded-[4px] bg-[#0D0F12]/85 px-3 py-1 blueText">
          <h3>Goods</h3>
          <button
            onClick={() => setSelectedWindowComponent(null)}
            className="rounded-[4px] p-1 transition-all hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-row gap-[2px] rounded-[6px] bg-white/10 p-[2px]">
            {tab("ship", "Ship to a land")}
            {tab("trade", "Food ⇄ Gold")}
          </div>

          {/* Which good. Both modes need it, so it sits above the tabs' content. */}
          <div className="flex flex-row justify-center gap-4">
            {([0, 1] as const).map((index) => (
              <button
                key={index}
                onClick={() => {
                  setGoodIndex(index);
                  setAmount("");
                }}
                className={`flex flex-1 flex-row items-center justify-center gap-2 rounded-[4px] px-3 py-2 text-[13px] transition-colors ${
                  goodIndex === index
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {index === 0 ? <FoodIcon /> : <GoldIcon />}
                {index === 0 ? "Food" : "Gold"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-between text-[11px] text-white/50">
              <span>Amount</span>
              <button
                onClick={() => setAmount(String(balance))}
                className="hover:text-white/80"
              >
                Balance: {formattedNumber(inViewLand?.goodsBalance[goodIndex] ?? 0)}
              </button>
            </div>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              className="w-full rounded-[4px] bg-black/40 px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-[color:var(--pw-accent)]"
            />
          </div>

          {mode === "ship" ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-white/50">Destination</span>
                <select
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  className="w-full rounded-[4px] bg-black/40 px-3 py-2 text-[15px] outline-none focus:ring-1 focus:ring-[color:var(--pw-accent)]"
                >
                  <option value="">
                    {destinations.length === 0
                      ? "You own no other land"
                      : "Pick a land"}
                  </option>
                  {destinations.map((land) => (
                    <option key={Number(land.tokenId)} value={Number(land.tokenId)}>
                      {Number(land.tokenId)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Said up front, because the number that arrives is not the
                  number typed — and the difference is destroyed, not banked. */}
              <div className="flex flex-row items-center justify-between rounded-[4px] bg-white/5 px-3 py-2">
                <span className="text-[11px] text-white/50">Arrives</span>
                <span className="flex flex-row items-center gap-2 text-[13px]">
                  {goodIcon}
                  {entered > 0 ? delivered.toFixed(1) : "—"}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-white/40">
                {TRANSFER_LOSS_PERCENT}% is lost in transit and leaves the game
                entirely — it is not paid to anyone.
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-row items-center justify-between rounded-[4px] bg-white/5 px-3 py-2">
                <span className="text-[11px] text-white/50">
                  You receive (estimated)
                </span>
                <span className="flex flex-row items-center gap-2 text-[13px]">
                  {otherIcon}
                  {quote ?? "—"}
                </span>
              </div>
              {hasSlippageGuards(deployment) && (
                <div className="flex flex-row items-center gap-2">
                  <span className="text-[11px] text-white/50">Max slippage</span>
                  <div className="ml-auto flex flex-row gap-[2px] rounded-[6px] bg-white/10 p-[2px]">
                    {SLIPPAGE_CHOICES.map((choice) => (
                      <button
                        key={choice}
                        onClick={() => setSlippage(choice)}
                        title={`Refuse a fill more than ${choice}% below the quote`}
                        className={`rounded-[4px] px-2 py-[2px] text-[11px] transition-colors ${
                          slippage === choice
                            ? "bg-[color:var(--pw-accent)] text-black font-semibold"
                            : "text-white/60 hover:bg-white/10 hover:text-white/90"
                        }`}
                      >
                        {choice}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] leading-relaxed text-white/40">
                Routed through PLOT, so the 5% pool fee is paid twice — the same
                as selling {goodName.toLowerCase()} and buying{" "}
                {otherName.toLowerCase()} yourself. Priced against the pool, so a
                large order gets a worse rate than a small one.
              </p>
            </>
          )}

          {reason && <p className="text-[11px] text-[#E8767C]">{reason}</p>}

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="greenButton !w-full !rounded-[4px] px-3 py-3 text-center disabled:cursor-not-allowed disabled:opacity-40"
          >
            {mode === "ship" ? "Ship" : `Swap for ${otherName.toLowerCase()}`}
          </button>
        </div>
      </section>
    </>
  );
}
