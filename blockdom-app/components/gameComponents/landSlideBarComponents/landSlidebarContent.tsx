"use client";
import { useMapContext } from "@/context/map-context";
import { warriors, warriorsInfo } from "@/lib/data";
import { townMainnetPInst, townPInst } from "@/lib/instances";
import { formattedNumber } from "@/lib/utils";
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
  const { selectedLand } = useMapContext();
  const [data, setData] = useState<SelectedLandDataType | null>(null);

  const pathname = usePathname();
  const isTestnet = pathname.includes("/testnet/");

  useEffect(() => {
    const getBal = async () => {
      if (selectedLand) {
        try {
          console.log(
            "getting slide bar data",
            "selected land coordinate:",
            selectedLand.coordinate
          );

          const inst = isTestnet ? townPInst : townMainnetPInst;
       
          if (isTestnet) {
                
          const army: BigNumber[] = await inst.getArmy(
            selectedLand?.coordinate
          );
          
          const landData = await inst.getLandIdData(selectedLand?.coordinate);
          const dataObj: SelectedLandDataType = {
            army: army,
            food: landData.goodsBalance[0],
            gold: landData.goodsBalance[1],
          };
          console.log("here is the data:", dataObj);

          setData(dataObj);
          }

      
        } catch (error) {
          console.log(error);
        }
      }
    };
    getBal();
  }, [isTestnet, selectedLand]);
  return (
    <>
      {!selectedLand?.isMinted && <></>}
      {selectedLand?.isMinted && (
        // <div className=" mt-auto mb-auto flex flex-col gap-3">
          <div className=" mt-auto  flex flex-col  items-center  flex-grow gap-3 justify-end mb-3">
            <div className=" flex flex-row gap-3 px-2 flex-shrink">
              <h3 className="!text-[10px]   sm:!text-[14px] balBg px-3 sm:px-5 sm:py-2 flex flex-row items-center gap-3">
                <div></div>
                <CoinIcon /> {formattedNumber(data?.gold || 0)}
              </h3>
              <h3 className="!text-[10px]  sm:!text-[14px] balBg px-5 sm:py-2 flex flex-row items-center gap-3">
                <FoodIcon /> {formattedNumber(data?.food || 0)}
              </h3>
            </div>
            <div className="w-full overflow-x-scroll h-auto p-2 bg-black/20 rounded-md custom-scrollbar">
              <div className="w-max  flex-grow relative flex flex-row   p-1 sm:p-0 rounded-t-md  gap-4 mr-auto ml-auto sm:h-full  ">
                {warriorsInfo.map((warrior, key) => (
                  <div
                    key={key}
                    className="  relative sm:!rounded-md cardBg !pt-[2px] !px-[2px] sm:px-1 sm:pt-1 pb-[16px] sm:pb-6 justify-center items-center h-full  ml-auto mr-auto darkShadow"
                  >
                    <p className=" text-[10px] font-normal absolute bottom-0 left-1/2 -translate-x-1/2 sm:font-semibold sm:text-[14px]">
                      {Number(data?.army[key] || 0)}
                    </p>
                    <Image
                      className={` !h-full !w-auto rounded-sm sm:rounded-md`}
                      src={warrior.image}
                      width={60}
                      height={120}
                      alt="warrior image"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        // </div>
      )}
    </>
  );
}
