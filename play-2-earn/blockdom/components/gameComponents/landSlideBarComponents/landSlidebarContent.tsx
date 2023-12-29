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
      {!selectedLand?.isMinted && <>
      </>}
      {selectedLand?.isMinted && (
        <div className=" flex flex-col flex-grow items-center justify-center">
          <div className=" flex flex-row gap-3">
            <h3 className="balBg px-5 py-2 flex flex-row items-center gap-3">
              <CoinIcon /> 10000
            </h3>
            <h3 className="balBg px-5 py-2 flex flex-row items-center gap-3">
              <FoodIcon /> 20000
            </h3>
          </div>

          <div className="grid grid-cols-3 mt-4 gap-4 mr-auto ml-auto">
            {warriors.map((warrior, key) => (
              <div
                key={key}
                className="relative  !rounded-md cardBg px-1 pt-1 pb-6 justify-center items-center w-fit ml-auto mr-auto darkShadow"
              >
           
                <p className=" absolute bottom-0 left-1/2 -translate-x-1/2 font-semibold text-[14px]">
                  10
                </p>
                <Image
                  className={` w-[80px] !h-auto rounded-md`}
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
