"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { formattedNumber } from "@/lib/utils";
import PlotCoin from "@/svg/plotCoin";
import SwapIcon from "@/svg/swapIcon";
import { useAddress } from "@thirdweb-dev/react";
import { BigNumber, BigNumberish } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

export default function BalanceContainer() {
  const { inViewLand, plotBalance } = useUserDataContext();
  const { setSelectedWindowComponent } = useSelectedWindowContext();
  const {setSelectedItem} = useSelectedBuildingContext()
  const address = useAddress();

  const pathname = usePathname();

  const formatRemainedTime = (remainedTime: number): string => {
    const days = Math.floor(remainedTime / (24 * 60));
    const hours = Math.floor((remainedTime % (24 * 60)) / 60);
    const minutes = remainedTime % 60;

    const parts = [];

    if (days > 0) {
      parts.push(`${days} d`);
    }

    if (hours > 0) {
      parts.push(`${hours} h`);
    }

    if (minutes > 0 && days == 0) {
      parts.push(`${minutes} min`);
    }

    return parts.length > 0 ? parts.join(" ") : "0 min";
  };

  const workerStatus = (): string => {
    if (inViewLand && Number(inViewLand.remainedBuildTime) == 0) {
      return "Ready";
    }
    if (inViewLand && Number(inViewLand.remainedBuildTime) > 0) {
      const remainedTime = Number(inViewLand.remainedBuildTime);
      return formatRemainedTime(remainedTime);
    } else {
      return "...";
    }
    // {inViewLand && Number(inViewLand.remainedBuildTime) > 0 && Number(inViewLand.remainedBuildTime)} {inViewLand && Number(inViewLand.remainedBuildTime) == 0 && "Ready"}
  };

  // Every control in here acts on the connected wallet — the PLOT balance it
  // shows, the deposit/withdraw window it opens, the worker it queues. With no
  // wallet there is nothing to show and nothing the buttons could do, so the
  // whole bar stays hidden until one is connected.
  return (
    <>
      {pathname != "/" && address && (
        <>
          <div
            className={`${
              pathname.includes("myLand") ? " " : "ml-5 "
            } top-[80px] z-40 flex flex-row absolute justify-around gap-1 sm:gap-4 w-full px-4 lg:w-auto`}
          >
            <button
              onClick={() => {setSelectedWindowComponent("tokenActions"),setSelectedItem(null)}}
              className={`${
                pathname.includes("myLand")
                  ? "flex-1"
                  : "w-[10rem] absolute left-0 "
              } backdrop-blur-sm relative cursor-pointer transition-all hover:bg-white/10 balanceText balBg flex flex-row gap-4 items-center justify-end px-4 py-[6px]`}
            >
                                <Image className="absolute left-0 h-auto w-[1.35rem] sm:w-[2.2rem]" src={"/svgs/balanceContainer/PLOT.svg"} width={240} height={240} alt="PLOT icon"/>

                            {/*
                              `plotBalance && …` rendered nothing at all while
                              the read was in flight or after it failed, so the
                              pill looked permanently stuck. An ellipsis at
                              least says the number is on its way.
                            */}
                            {plotBalance == null ? "…" : formattedNumber(plotBalance)}
            </button>
            {pathname.includes("myLand") && (
              <>
                <h3 className="flex-1  relative backdrop-blur-sm  lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-end px-2 sm:py-1  balanceText ">
                  {/* <FoodIcon /> */}
                  <Image className=" absolute left-1 h-auto w-[1.25rem] sm:w-[2rem]" src={"/svgs/balanceContainer/FOOD.svg"} width={240} height={240} alt="Food"/>
                  {inViewLand && formattedNumber(inViewLand.goodsBalance[0])}
                </h3>
                <h3 className="flex-1 relative backdrop-blur-sm  lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-end px-2 sm:py-1  balanceText ">
                  <Image className="absolute left-1 h-auto w-[1.25rem] sm:w-[2rem]" src={"/svgs/balanceContainer/GOLD.png"} width={240} height={240} alt="Gold"/>

                  {inViewLand && formattedNumber(inViewLand.goodsBalance[1])}
                </h3>
                <button onClick={() =>{ setSelectedWindowComponent("workerComp"),setSelectedItem(null)}} className="flex-1 relative backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10 balanceText lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-end px-2 sm:py-1 ">
                <Image className=" absolute left-1 h-auto w-[1.2rem] sm:w-[1.8rem]" src={"/svgs/balanceContainer/WORKER.svg"} width={240} height={240} alt="Worker"/>

                  {/* <HammerIcon /> */}
                  {workerStatus()}
                </button>
                {/*
                  The market, one click from the three numbers it moves. It used
                  to live inside the town hall's details panel, where a player
                  had to already know it was there to find it.
                */}
                <button
                  onClick={() => {
                    setSelectedWindowComponent("swap"), setSelectedItem(null);
                  }}
                  title="Swap goods and PLOT"
                  aria-label="Swap goods and PLOT"
                  className="shrink-0 relative backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10 balBg flex items-center justify-center px-3 py-[6px] sm:py-1"
                >
                  <SwapIcon size={20} />
                </button>
                {/*
                  Goods logistics — shipping between your own lands, and food
                  for gold. Both are contract functions that had no button.
                */}
                <button
                  onClick={() => {
                    setSelectedWindowComponent("goods"), setSelectedItem(null);
                  }}
                  title="Ship goods between your lands, or trade food for gold"
                  aria-label="Goods"
                  className="shrink-0 relative backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10 balBg flex items-center justify-center px-3 py-[6px] sm:py-1 text-[12px]"
                >
                  Goods
                </button>
                {/* The reserves every price in the game comes from. */}
                <button
                  onClick={() => {
                    setSelectedWindowComponent("pool"), setSelectedItem(null);
                  }}
                  title="Pool reserves and prices"
                  aria-label="Pool"
                  className="shrink-0 relative backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10 balBg flex items-center justify-center px-3 py-[6px] sm:py-1 text-[12px]"
                >
                  Pool
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
