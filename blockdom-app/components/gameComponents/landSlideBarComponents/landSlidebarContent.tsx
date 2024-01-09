"use client";
import { useMapContext } from "@/context/map-context";
import { warriors, warriorsInfo } from "@/lib/data";
import { townMainnetPInst, townPInst } from "@/lib/instances";
import CoinIcon from "@/svg/coinIcon";
import FoodIcon from "@/svg/foodIcon";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

type SelectedLandDataType = {
  gold: BigNumber;
  food: BigNumber;
  army: BigNumber[];
};
export default function LandSlidebarContent() {
  const { selectedLand, setSelectedLand } = useMapContext();
  const [data, setData] = useState<SelectedLandDataType | null>(null);

  const pathname = usePathname();
  const isTestnet = pathname.includes("/testnet/");

  useEffect(() => {
    const getBal = async () => {
      if (selectedLand) {
        try {
          console.log("getting slide bar data","selected land coordinate:",selectedLand.coordinate);
          console.log(isTestnet);
          
          const inst = isTestnet ? townPInst : townMainnetPInst;
          const army: BigNumber[] = await inst.getArmy(selectedLand?.coordinate);
          const landData = await inst.getLandIdData(selectedLand?.coordinate)
          const dataObj:SelectedLandDataType = {army: army, food:landData.goodsBalance[0],gold: landData.goodsBalance[1]}
          console.log("here is the data:",dataObj);
          
          setData(dataObj)
        } catch (error) {
          console.log(error);
          
        }
      }
    };
    getBal()
  },[isTestnet,selectedLand]);
  return (
    <>
      {!selectedLand?.isMinted && <></>}
      {selectedLand?.isMinted && (
        <div className=" flex flex-col flex-grow items-center justify-center mb-2">
          <div className=" flex flex-row gap-3 px-2 flex-shrink">
            <h3 className="!text-[10px]   sm:!text-[14px] balBg px-3 sm:px-5 sm:py-2 flex flex-row items-center gap-3">
              <div></div>
              <CoinIcon /> {formatEther(data?.gold || 0)}
            </h3>
            <h3 className="!text-[10px]  sm:!text-[14px] balBg px-5 sm:py-2 flex flex-row items-center gap-3">
              <FoodIcon /> {formatEther(data?.food || 0)}
            </h3>
          </div>

          <div className="flex flex-row overflow-x-scroll sm:overflow-auto p-1 sm:p-0 rounded-t-md bg-black/20 sm:bg-inherit sm:grid sm:grid-cols-3 mt-2  sm:mt-4 gap-4 mr-auto ml-auto sm:h-auto h-full w-full custom-scrollbar">
            {warriorsInfo.map((warrior, key) => (
              <div
                key={key}
                className="relative  sm:!rounded-md cardBg !pt-[2px] !px-[2px] sm:px-1 sm:pt-1 pb-[16px] sm:pb-6 justify-center items-center h-fit  w-max ml-auto mr-auto darkShadow"
              >
                <p className=" text-[10px] font-normal absolute bottom-0 left-1/2 -translate-x-1/2 sm:font-semibold sm:text-[14px]">
                  {Number(data?.army[key]|| 0)}
                </p>
                <Image
                  className={`sm:!w-[80px] !h-auto !w-auto rounded-sm sm:rounded-md`}
                  src={warrior.image}
                  width={60}
                  height={120}
                  alt="warrior image"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
