"use client";
import { useMapContext } from "@/context/map-context";
import { warriorsInfo } from "@/lib/data";
import { townMainnetPInst, townPInst, townRead } from "@/lib/instances";
import { formattedNumber } from "@/lib/utils";
import GoldIcon from "@/svg/goldIcon";
import FoodIcon from "@/svg/foodIcon";
import { BigNumber } from "ethers";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDeployment } from "@/lib/deployments";
import { isWildLand, landTypesSupported } from "@/lib/landTypes";
import { readWildLand, WildLandInfo, WILD_REGEN_PERIOD_DAYS } from "@/lib/wildLands";

type SelectedLandDataType = {
  gold: BigNumber;
  food: BigNumber;
  army: BigNumber[];
};

/**
 * The balances come off-chain per land, so there is always a wait. Tracking it
 * explicitly means the card can say "still loading" instead of rendering the
 * zero that `data?.gold || 0` produced — which read as a real balance of 0.
 */
/**
 * Carries the land it describes. Clicking a second land used to leave the
 * first one's balances on screen until the new call came back, and the fix for
 * that — resetting to "loading" from inside the effect — is a synchronous
 * setState that costs an extra render pass. Tagging the result with its
 * coordinate lets the component decide during render whether what it holds is
 * still about the land being shown.
 */
type LoadState =
  | { status: "loading" }
  | { status: "ready"; for: number; data: SelectedLandDataType }
  | { status: "failed"; for: number };

/** A balance, or the reason there isn't one yet. */
function Amount({
  state,
  pick,
}: {
  state: LoadState;
  pick: (data: SelectedLandDataType) => BigNumber;
}) {
  if (state.status === "loading")
    return <span className="spinnerSm" aria-label="loading" />;
  if (state.status === "failed")
    return (
      <span title="Could not read this land's balance" aria-label="unavailable">
        —
      </span>
    );
  return <>{formattedNumber(pick(state.data))}</>;
}

export default function LandSlidebarContent() {
  const { selectedLand } = useMapContext();
  const [loaded, setLoaded] = useState<LoadState>({ status: "loading" });

  const pathname = usePathname();
  const isTestnet = pathname.includes("/testnet/");
  const deployment = useDeployment();

  const coordinate = selectedLand?.coordinate;

  // A jungle nobody owns holds goods and defenders that regrow on their own.
  // Its stored balance is not that number, so it gets its own read.
  const wild =
    landTypesSupported(deployment) &&
    coordinate !== undefined &&
    !selectedLand?.isMinted &&
    isWildLand(coordinate, undefined);

  const [wildInfo, setWildInfo] = useState<
    { for: number; info: WildLandInfo } | null
  >(null);

  useEffect(() => {
    // No reset here: what is held is tagged with its land, and the render
    // below ignores anything tagged for a different one. Clearing it from
    // inside the effect would be a synchronous setState and an extra pass —
    // the same reason the balance loader above carries its coordinate.
    if (!wild || coordinate === undefined) return;
    let cancelled = false;
    readWildLand(deployment, coordinate).then((info) => {
      if (!cancelled) setWildInfo({ for: coordinate, info });
    });
    return () => {
      cancelled = true;
    };
  }, [wild, coordinate, deployment]);

  // Anything held for a different land is last land's data, not this one's.
  const state: LoadState =
    loaded.status !== "loading" && loaded.for === coordinate
      ? loaded
      : { status: "loading" };

  useEffect(() => {
    if (coordinate === undefined) return;

    let cancelled = false;
    const inst = townRead(deployment);

    (async () => {
      try {
        // These two were awaited one after the other, so the card waited for
        // two round trips end to end. Nothing here depends on the other.
        const [army, landData] = await Promise.all([
          inst.getArmy(coordinate),
          inst.getLandIdData(coordinate),
        ]);
        if (cancelled) return;
        setLoaded({
          status: "ready",
          for: coordinate,
          data: {
            army,
            food: landData.goodsBalance[0],
            gold: landData.goodsBalance[1],
          },
        });
      } catch (error) {
        if (cancelled) return;
        console.log(error);
        setLoaded({ status: "failed", for: coordinate });
      }
    })();

    // Click two lands quickly and the first response can land after the
    // second; without this the card would settle on the wrong one.
    return () => {
      cancelled = true;
    };
  }, [isTestnet, coordinate, deployment]);

  const shownWild =
    wildInfo && wildInfo.for === coordinate ? wildInfo.info : null;

  return (
    <>
      {wild && (
        <div className="mt-auto flex flex-col items-center flex-grow gap-2 justify-end mb-3">
          <p className="!text-[10px] sm:!text-[12px] text-[color:var(--pw-accent)] px-2 text-center">
            Wild land — raid it for what it holds
          </p>
          <div className="flex flex-row gap-3 px-2 flex-shrink">
            <h3 className="!text-[10px] sm:!text-[14px] balBg px-3 sm:px-5 sm:py-2 flex flex-row items-center gap-3">
              <GoldIcon />
              {shownWild ? (
                formattedNumber(shownWild.gold)
              ) : (
                <span className="spinnerSm" aria-label="loading" />
              )}
            </h3>
            <h3 className="!text-[10px] sm:!text-[14px] balBg px-5 sm:py-2 flex flex-row items-center gap-3">
              <FoodIcon />
              {shownWild ? (
                formattedNumber(shownWild.food)
              ) : (
                <span className="spinnerSm" aria-label="loading" />
              )}
            </h3>
          </div>
          {shownWild && (
            <p className="!text-[10px] sm:!text-[12px] text-white/60 px-2 text-center">
              Defended by {shownWild.garrison} spearmen · regrows over{" "}
              {WILD_REGEN_PERIOD_DAYS} days
              {!shownWild.exact && " · estimated"}
            </p>
          )}
        </div>
      )}
      {selectedLand?.isMinted && (
        <div className=" mt-auto  flex flex-col  items-center  flex-grow gap-3 justify-end mb-3">
          <div className=" flex flex-row gap-3 px-2 flex-shrink">
            <h3 className="!text-[10px]   sm:!text-[14px] balBg px-3 sm:px-5 sm:py-2 flex flex-row items-center gap-3">
              <div></div>
              <GoldIcon /> <Amount state={state} pick={(d) => d.gold} />
            </h3>
            <h3 className="!text-[10px]  sm:!text-[14px] balBg px-5 sm:py-2 flex flex-row items-center gap-3">
              <FoodIcon /> <Amount state={state} pick={(d) => d.food} />
            </h3>
          </div>
          {/* <div className="w-full overflow-x-scroll h-auto p-2 bg-black/20 rounded-[4px] custom-scrollbar">
              <div className="w-max  flex-grow relative flex flex-row   p-1 sm:p-0 rounded-t-md  gap-4 mr-auto ml-auto sm:h-full  ">
                {warriorsInfo.map((warrior, key) => (
                  <div
                    key={key}
                    className="  relative sm:!rounded-[4px] cardBg !pt-[2px] !px-[2px] sm:px-1 sm:pt-1 pb-[16px] sm:pb-6 justify-center items-center h-full  ml-auto mr-auto darkShadow"
                  >
                    <p className=" text-[10px] font-normal absolute bottom-0 left-1/2 -translate-x-1/2 sm:font-semibold sm:text-[14px]">
                      {state.status === "ready" ? Number(state.data.army[key]) : 0}
                    </p>
                    <Image
                      className={` !h-full !w-auto rounded-sm sm:rounded-[4px]`}
                      src={warrior.image}
                      width={60}
                      height={120}
                      alt="warrior image"
                    />
                  </div>
                ))}
              </div>
            </div> */}
        </div>
      )}
    </>
  );
}
