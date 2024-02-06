"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { formattedNumber } from "@/lib/utils";
import BMTIcon from "@/svg/bmtIcon";
import CoinIcon from "@/svg/coinIcon";
import FoodIcon from "@/svg/foodIcon";
import HammerIcon from "@/svg/hammerIcon";
import SmBMTIcon from "@/svg/smBMTIcon";
import SmCoinIcon from "@/svg/smCoinIcon";
import SmFoodIcon from "@/svg/smFoodIcon";
import SmHammerIcon from "@/svg/smHammerIcon";
import { BigNumber, BigNumberish } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";

export default function BalanceContainer() {
  const { inViewLand, BMTBalance } = useUserDataContext();
  const { setSelectedWindowComponent } = useSelectedWindowContext();
  const {setSelectedItem} = useSelectedBuildingContext()

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

  return (
    <>
      {pathname != "/" && (
        <>
          <div
            className={`${
              pathname.includes("myLand") ? " " : "ml-5 "
            } z-40 flex flex-row absolute top-[80px] justify-around gap-1 sm:gap-4 w-full px-4 lg:w-auto`}
          >
            <button
              onClick={() => {setSelectedWindowComponent("tokenActions"),setSelectedItem(null)}}
              className={`${
                pathname.includes("myLand")
                  ? "w-1/4"
                  : "w-[10rem] absolute left-0 "
              } backdrop-blur-sm relative cursor-pointer transition-all hover:bg-white/10 balanceText balBg flex flex-row gap-4 items-center justify-end px-4 py-[6px]`}
            >
                                <Image className="absolute left-0 h-auto w-[1.35rem] sm:w-[2.2rem]" src={"/svgs/balanceContainer/BMT.svg"} width={240} height={240} alt="food icon"/>

              {/* <BMTIcon /> */}
              {BMTBalance && formattedNumber(BMTBalance)}
            </button>
            {pathname.includes("myLand") && (
              <>
                <h3 className="w-1/4  relative backdrop-blur-sm  lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-end px-2 sm:py-1  balanceText ">
                  {/* <FoodIcon /> */}
                  <Image className=" absolute left-1 h-auto w-[1.25rem] sm:w-[2rem]" src={"/svgs/balanceContainer/FOOD.svg"} width={240} height={240} alt="food icon"/>
                  {inViewLand && formattedNumber(inViewLand.goodsBalance[0])}
                </h3>
                <h3 className="w-1/4 relative backdrop-blur-sm  lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-end px-2 sm:py-1  balanceText ">
                  {/* <CoinIcon /> */}
                  <Image className="absolute left-1 h-auto w-[1.25rem] sm:w-[2rem]" src={"/svgs/balanceContainer/GOLD.svg"} width={240} height={240} alt="food icon"/>

                  {inViewLand && formattedNumber(inViewLand.goodsBalance[1])}
                </h3>
                <button onClick={() =>{ setSelectedWindowComponent("workerComp"),setSelectedItem(null)}} className="w-1/4 relative backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10 balanceText lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-end px-2 sm:py-1 ">
                <Image className=" absolute left-1 h-auto w-[1.2rem] sm:w-[1.8rem]" src={"/svgs/balanceContainer/WORKER.svg"} width={240} height={240} alt="food icon"/>

                  {/* <HammerIcon /> */}
                  {workerStatus()}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
