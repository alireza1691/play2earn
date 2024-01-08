import { useMapContext } from "@/context/map-context";
import { warriors } from "@/lib/data";
import CoinIcon from "@/svg/coinIcon";
import FoodIcon from "@/svg/foodIcon";
import Image from "next/image";
import React from "react";

export default function LandSlidebarContent() {
  const { selectedLand, setSelectedLand } = useMapContext();
  return (
    <>
      {!selectedLand?.isMinted && <></>}
      {selectedLand?.isMinted && (
        <div className=" flex flex-col flex-grow items-center justify-center mb-2">
          <div className=" flex flex-row gap-3 px-2 flex-shrink">
            <h3 className="!text-[10px]   sm:!text-[14px] balBg px-3 sm:px-5 sm:py-2 flex flex-row items-center gap-3">
              <div></div>
              <CoinIcon /> 10000
            </h3>
            <h3 className="!text-[10px]  sm:!text-[14px] balBg px-5 sm:py-2 flex flex-row items-center gap-3">
              <FoodIcon /> 20000
            </h3>
          </div>

          <div className="flex flex-row overflow-x-scroll sm:overflow-auto p-1 sm:p-0 rounded-t-md bg-black/20 sm:bg-inherit sm:grid sm:grid-cols-3 mt-2  sm:mt-4 gap-4 mr-auto ml-auto sm:h-auto h-full w-full custom-scrollbar">
            {warriors.map((warrior, key) => (
              <div
                key={key}
                className="relative  sm:!rounded-md cardBg !pt-[2px] !px-[2px] sm:px-1 sm:pt-1 pb-[16px] sm:pb-6 justify-center items-center h-full  w-max ml-auto mr-auto darkShadow"
              >
           
                <p className=" text-[10px] font-normal absolute bottom-0 left-1/2 -translate-x-1/2 sm:font-semibold sm:text-[14px]">
                  10
                </p>
                <Image
                  className={`sm:!w-[80px] !h-full !w-auto rounded-sm sm:rounded-md`}
                  src={"/images/warriorTest.png"}
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
