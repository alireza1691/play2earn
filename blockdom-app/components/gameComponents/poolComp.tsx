"use client";
import { useApiData } from "@/context/api-data-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { isRewrite, useDeployment } from "@/lib/deployments";
import { townRead } from "@/lib/instances";
import townV5Abi from "@/abis/v5/townAbi.json";
import { formattedNumber } from "@/lib/utils";
import CloseIcon from "@/svg/closeIcon";
import FoodIcon from "@/svg/foodIcon";
import GoldIcon from "@/svg/goldIcon";
import PlotCoin from "@/svg/plotCoin";
import { BigNumber, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

/**
 * The pool, which until now the game never showed at all.
 *
 * Every price in the economy comes from these four numbers and nothing in the
 * UI displayed them — a player could watch their trade fill worse than quoted
 * and have no way to see why. `getReserves` and `getGoodsPrice` have been on
 * the contract the whole time.
 *
 * Two pools, not one: PLOT/food and PLOT/gold are priced independently against
 * their own reserves, which is why food and gold drift apart as people trade.
 * Depth is worth showing next to price because it *is* the rest of the answer —
 * the same order moves a shallow pool much further than a deep one.
 */

type Pool = {
  plot: BigNumber;
  goods: BigNumber;
  price: BigNumber;
};

/**
 * What each pool's PLOT side was seeded with, and the point below which it is
 * worth topping up.
 *
 * Health matters to a player, not just to whoever runs the treasury: the PLOT a
 * player earns comes out of this reserve, so a thin pool means selling pays
 * badly. Showing it is the honest version of "why did I get so little".
 *
 * Kept in step with `script/new/TopUpPool.s.sol`, which uses the same baseline
 * and the same half-way trigger to decide when to act.
 */
const POOL_BASELINE_PLOT = 25_000_000;
const POOL_TRIGGER_FRACTION = 0.5;

function health(plot: BigNumber): { label: string; tone: string; fraction: number } {
  const held = Number(formatEther(plot));
  const fraction = Math.min(held / POOL_BASELINE_PLOT, 1);

  if (fraction >= 0.8) return { label: "Deep", tone: "var(--pw-accent)", fraction };
  if (fraction >= POOL_TRIGGER_FRACTION)
    return { label: "Healthy", tone: "var(--pw-accent)", fraction };
  if (fraction >= 0.25) return { label: "Thinning", tone: "#E8B657", fraction };
  return { label: "Thin", tone: "#E8767C", fraction };
}

/**
 * Price history, rebuilt from the log.
 *
 * `PoolSync` carries both reserves after every trade, and price is
 * plotReserve/goodsReserve — the same division `getGoodsPrice` does. So the
 * whole history is already on chain and needed no contract change to read; it
 * was simply never decoded.
 *
 * Decoded against the v5 ABI rather than `townABI`: lib/utils.ts decodes with
 * the v3 ABI, which works only because the events it reads kept their
 * signatures. PoolSync came in with the rewrite and is not in v3 at all.
 */
function priceHistory(
  logs: { topics: string[]; data: string }[] | undefined,
  goodIndex: 0 | 1
): number[] {
  if (!logs?.length) return [];
  const iface = new ethers.utils.Interface(
    townV5Abi.abi as ConstructorParameters<typeof ethers.utils.Interface>[0]
  );
  let sig: string;
  try {
    sig = iface.getEventTopic("PoolSync");
  } catch {
    return [];
  }

  const series: number[] = [];
  for (const log of logs) {
    if (log.topics?.[0] !== sig) continue;
    // goodIndex is indexed, so it is a topic rather than part of the data.
    if (Number(BigNumber.from(log.topics[1])) !== goodIndex) continue;
    try {
      // decodeEventLog returns indexed args too, in signature order — so
      // [0] is goodIndex, [1] and [2] are the two reserves.
      const decoded = iface.decodeEventLog("PoolSync", log.data, log.topics);
      const plotRes = decoded[1] as BigNumber;
      const goodsRes = decoded[2] as BigNumber;
      if (goodsRes.isZero()) continue;
      series.push(Number(plotRes.toString()) / Number(goodsRes.toString()));
    } catch {
      // A log that will not decode is one we cannot chart; skipping it is
      // better than dropping the whole series.
    }
  }
  return series;
}

/**
 * A bare polyline. No axes and no library: the question this answers is "which
 * way has the price been going", and a 40px trace answers it. Anything more
 * would be a chart library for six data points.
 */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / span) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const rising = values[values.length - 1] >= values[0];

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-[34px] w-full"
      aria-label={`Price trend over the last ${values.length} trades`}
    >
      <polyline
        points={points}
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeWidth={1.5}
        stroke={rising ? "var(--pw-accent)" : "#E8767C"}
      />
    </svg>
  );
}

export default function PoolComp() {
  const { selectedWindowComponent, setSelectedWindowComponent } =
    useSelectedWindowContext();
  const deployment = useDeployment();

  const { townApiData } = useApiData();
  const [pools, setPools] = useState<[Pool, Pool] | null>(null);
  const [failed, setFailed] = useState(false);

  const isOpen = selectedWindowComponent === "pool";

  useEffect(() => {
    if (!isOpen || !isRewrite(deployment)) return;
    let cancelled = false;
    const town = townRead(deployment);

    Promise.all([town.getReserves(), town.getGoodsPrice()])
      .then(
        ([reserves, prices]: [
          [BigNumber[], BigNumber[]],
          BigNumber[]
        ]) => {
          if (cancelled) return;
          const [plotSide, goodsSide] = reserves;
          setPools([
            { plot: plotSide[0], goods: goodsSide[0], price: prices[0] },
            { plot: plotSide[1], goods: goodsSide[1], price: prices[1] },
          ]);
        }
      )
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [isOpen, deployment]);

  if (!isOpen) return null;

  const row = (index: 0 | 1) => {
    const pool = pools?.[index];
    const name = index === 0 ? "Food" : "Gold";
    const icon = index === 0 ? <FoodIcon /> : <GoldIcon />;
    // Same logs the rest of the app is already holding — no extra request.
    const history = priceHistory(townApiData?.result, index);

    return (
      <div key={index} className="flex flex-col gap-2 rounded-[4px] bg-white/5 p-3">
        <div className="flex flex-row items-center justify-between">
          <span className="flex flex-row items-center gap-2 text-[13px]">
            {icon}
            {name}
          </span>
          <span className="text-[13px]">
            {pool ? `${Number(formatEther(pool.price)).toFixed(4)} PLOT` : "—"}
          </span>
        </div>

        <div className="flex flex-row justify-between text-[11px] text-white/50">
          <span className="flex flex-row items-center gap-1">
            <PlotCoin size={12} />
            {pool ? formattedNumber(pool.plot) : "—"}
          </span>
          <span>{pool ? formattedNumber(pool.goods) : "—"} {name.toLowerCase()}</span>
        </div>

        {history.length > 1 ? (
          <Sparkline values={history} />
        ) : (
          <p className="text-[10px] text-white/30">
            No trades yet — the line appears once the pool has been used.
          </p>
        )}

        {/* How much of the reserve players can still be paid out of. This is
            the number that decides what selling is worth, so it is named
            rather than left as an unlabelled bar. */}
        {pool && (
          <>
            <div className="flex flex-row items-center justify-between text-[10px]">
              <span className="text-white/40">Depth</span>
              <span style={{ color: health(pool.plot).tone }}>
                {health(pool.plot).label}
              </span>
            </div>
            <div className="flex h-[4px] w-full overflow-hidden rounded-full bg-white/10">
              <div
                style={{
                  width: `${health(pool.plot).fraction * 100}%`,
                  backgroundColor: health(pool.plot).tone,
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        onClick={() => setSelectedWindowComponent(null)}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
      />
      <section className="tokenActionBg fixed left-1/2 top-1/2 z-[61] flex w-[92dvw] -translate-x-1/2 -translate-y-1/2 flex-col lg:w-[24rem]">
        <div className="flex h-[2rem] flex-row items-center justify-between rounded-[4px] bg-[#0D0F12]/85 px-3 py-1 blueText">
          <h3>Pool</h3>
          <button
            onClick={() => setSelectedWindowComponent(null)}
            className="rounded-[4px] p-1 transition-all hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {!isRewrite(deployment) ? (
            <p className="text-[12px] text-white/50">
              This deployment has no pool — it came in with the rewrite.
            </p>
          ) : failed ? (
            <p className="text-[12px] text-[#E8767C]">
              Could not read the pool.
            </p>
          ) : (
            <>
              <p className="text-[11px] leading-relaxed text-white/40">
                Price per unit, and the reserves behind it. Each good is priced
                against its own pool, so the two drift apart as people trade.
              </p>
              {row(0)}
              {row(1)}
              <p className="text-[10px] leading-relaxed text-white/40">
                Every trade pays 5%, which stays in the reserves — so the pool
                deepens as it is used, and a given order moves the price less
                over time.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
