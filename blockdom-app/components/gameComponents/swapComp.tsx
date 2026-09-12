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
import PlotCoin from "@/svg/plotCoin";
import SwapIcon from "@/svg/swapIcon";
import { BigNumberish } from "ethers";
import { parseEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

/**
 * Goods <-> PLOT, in one window.
 *
 * This used to be a pair of unlabelled inputs wedged into the town hall's
 * details panel — three clicks into a building, on one screen, and only for a
 * player who already knew it was there. Trading is not a town hall upgrade, so
 * it comes out into a window of its own, opened from the balance bar that is
 * already showing the three numbers it moves.
 *
 * Both sides of the trade run through the AMM in `Town`: `buyGood` spends PLOT
 * out of the in-game balance for goods, `sellGood` sends goods back the other
 * way. The price moves with the size of the trade, so the panel quotes the
 * actual output rather than a rate — see `quote` below.
 */
export default function SwapComp() {
  const { selectedWindowComponent, setSelectedWindowComponent } =
    useSelectedWindowContext();
  const { inViewLand, ownedLands, plotBalance } = useUserDataContext();
  const { convert } = useBlockchainUtilsContext();
  const deployment = useDeployment();

  /** true = PLOT in, goods out. false = goods in, PLOT out. */
  const [isBuy, setIsBuy] = useState(true);
  /** 0 = food, 1 = gold — the contract's own good indices. */
  const [goodIndex, setGoodIndex] = useState<0 | 1>(0);
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE_PERCENT);
  /**
   * The last quote, tagged with the trade it was for.
   *
   * Keyed rather than cleared: a quote belongs to one direction, good and
   * amount, so changing any of them makes it stale by definition. Deriving that
   * from the key means nothing has to remember to blank it — and the effect
   * never calls setState on the way in, which is what turns one keystroke into
   * a second render.
   */
  const [quoted, setQuoted] = useState<{ key: string; value: string } | null>(
    null
  );

  const isOpen = selectedWindowComponent === "swap";
  const entered = Number(amount);
  const quoteKey = `${isBuy}-${goodIndex}-${entered}`;
  const quote = quoted?.key === quoteKey ? quoted.value : null;
  const goodName = goodIndex === 0 ? "Food" : "Gold";
  // The element, not the component: the two take different props, and a union
  // of their signatures is not callable as one.
  const goodIcon = goodIndex === 0 ? <FoodIcon /> : <GoldIcon />;

  // The trade is charged to the land in view, and the contract only lets its
  // owner trade — so visiting someone else's town must not offer it.
  const isMine =
    !!inViewLand &&
    !!ownedLands?.some((land) => Number(land.tokenId) === inViewLand.tokenId);

  const balance = isBuy
    ? Number(formattedNumber(plotBalance ?? 0))
    : Number(formattedNumber(inViewLand?.goodsBalance[goodIndex] ?? 0));

  /**
   * What the pool would pay for this trade right now.
   *
   * Only v4 can answer: `quoteBuy`/`quoteSell` came in with the pool rewrite,
   * and the v3 Town has no such call. Anything that fails leaves the line off
   * rather than blocking the trade — a missing estimate is not a reason to stop
   * a player selling their gold.
   */
  useEffect(() => {
    if (!isOpen || !isRewrite(deployment) || !(entered > 0)) return;
    let cancelled = false;
    const town = townRead(deployment);
    // parseEther throws on more than 18 decimals, and on the exponential form
    // Number.toString reaches for below 1e-6 — both are things a player can
    // type into a number field.
    let wei;
    try {
      wei = parseEther(amount);
    } catch {
      return;
    }
    (isBuy ? town.quoteBuy(goodIndex, wei) : town.quoteSell(goodIndex, wei))
      .then(
        (out: BigNumberish) =>
          !cancelled && setQuoted({ key: quoteKey, value: formattedNumber(out) })
      )
      // Nothing to write: an unanswered quote leaves the key unmatched, which
      // is already the "no estimate" state.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen, deployment, isBuy, goodIndex, entered, amount, quoteKey]);

  if (!isOpen) return null;

  const blockedReason = (): string | null => {
    if (!inViewLand) return "No land open";
    if (!isMine) return "You do not own this land";
    if (!(entered > 0)) return null;
    if (entered > balance)
      return `Not enough ${isBuy ? "PLOT" : goodName.toLowerCase()}`;
    return null;
  };

  const reason = blockedReason();

  return (
    <>
      <div
        onClick={() => setSelectedWindowComponent(null)}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
      />
      <section className="tokenActionBg fixed left-1/2 top-1/2 z-[61] flex w-[92dvw] -translate-x-1/2 -translate-y-1/2 flex-col lg:w-[24rem]">
        <div className="flex h-[2rem] flex-row items-center justify-between rounded-[4px] bg-[#0D0F12]/85 px-3 py-1 blueText">
          <h3>Swap</h3>
          <button
            onClick={() => setSelectedWindowComponent(null)}
            className="rounded-[4px] p-1 transition-all hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-row justify-center gap-4">
            <button
              onClick={() => setGoodIndex(0)}
              data-active={goodIndex === 0}
              className="pwTab flex flex-row items-center gap-2"
            >
              <FoodIcon /> Food
            </button>
            <button
              onClick={() => setGoodIndex(1)}
              data-active={goodIndex === 1}
              className="pwTab flex flex-row items-center gap-2"
            >
              <GoldIcon /> Gold
            </button>
          </div>

          {/* You pay */}
          <div className="inputBg flex flex-col gap-1 px-3 py-2">
            <div className="flex flex-row items-center justify-between text-[11px] text-white/50">
              <span>You pay</span>
              <button
                onClick={() => setAmount(String(balance))}
                className="hover:text-[color:var(--pw-accent)]"
              >
                Balance {balance} · Max
              </button>
            </div>
            <div className="flex flex-row items-center gap-2">
              {isBuy ? <PlotCoin size={26} /> : goodIcon}
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="0"
              />
              <span className="text-[13px] text-white/60">
                {isBuy ? "PLOT" : goodName}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsBuy(!isBuy)}
            title="Swap direction"
            className="mx-auto -my-1 rounded-full border border-[color:var(--pw-accent)]/40 bg-[#0D0F12]/85 p-2 transition-all hover:bg-white/10"
          >
            <SwapIcon />
          </button>

          {/* You receive */}
          <div className="inputBg flex flex-col gap-1 px-3 py-2">
            <span className="text-[11px] text-white/50">
              You receive{isRewrite(deployment) ? " (estimated)" : ""}
            </span>
            <div className="flex flex-row items-center gap-2">
              {isBuy ? goodIcon : <PlotCoin size={26} />}
              <span className="w-full">{quote ?? "—"}</span>
              <span className="text-[13px] text-white/60">
                {isBuy ? goodName : "PLOT"}
              </span>
            </div>
          </div>

          {/*
            Only v5 enforces a minimum out; on v4 the argument does not exist,
            so offering the control there would promise protection the contract
            cannot give.
          */}
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

          <p className="text-[11px] font-light leading-4 text-white/50">
            {/*
              Not a rate card: the pool prices each trade against its own
              reserves, so a big order moves the price against itself. The
              estimate above is the figure that matters.
            */}
            Priced by the pool, so a large order gets a worse rate than a small
            one. Goods are credited to land{" "}
            <span className="lightGreen">{inViewLand?.tokenId ?? "—"}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-1 px-3 pb-3">
          {reason && (
            <p className="text-center text-[12px] text-[color:var(--pw-danger)]">
              {reason}
            </p>
          )}
          <button
            onClick={() => convert(entered, goodIndex, isBuy, slippage)}
            disabled={!(entered > 0) || reason !== null}
            className="greenButton !w-full !py-2"
          >
            {isBuy ? `Buy ${goodName}` : `Sell ${goodName}`}
          </button>
        </div>
      </section>
    </>
  );
}
