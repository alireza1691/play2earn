"use client";
import React from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { allLands, getParcelStartIndexes, inViewParcels, parcelLands, separatedCoordinate } from "@/lib/utils";
import { parcelsViewHookProps } from "@/lib/types";
import { useSelectedWindowContext } from "@/context/selected-window-context";

export default function ParcelsWideScreen({
  setSelectedLand,
  setSlideBar,
  selectedParcel,
  setSelectedParcel,
}: parcelsViewHookProps) {
  const { selectedWindowComponent, setSelectedWindowComponent } =
    useSelectedWindowContext();
  const isParcelSelected = false;

  const parcels = getParcelStartIndexes()
  const allParcelsAndTheirLands = allLands()

  return (
    <>
      {isParcelSelected && (
        <div className="z-10 transition-all invisible md:visible absolute grid gap-[1px] w-[1080px] md:w-[1590px] 2xl:w-[2130px]  grid-cols-3 md:left-[20rem] 2xl:left-[27.5rem] top-0 viewGrid ">
          {inViewParcels(selectedParcel).map((parcel, key) => (
            <div
              key={key}
              className={`grid w-fit grid-cols-10 gap-[1px] ${
                key == 4 ? " " : "blur-md brightness-50 "
              }`}
            >
              {parcelLands(parcel.x, parcel.y).map((land, index) => (
                <Tooltip
                  radius="sm"
                  key={land}
                  color={"default"}
                  content={separatedCoordinate(land.toString())}
                  className={`capitalize p-2 rounded-xl text-[12px] text-white !bg-[#06291D]/60 ${
                    key != 4 && "invisible"
                  }`}
                >
                  <a
                    key={land}
                    onClick={() => {
                      key == 4 && setSelectedLand(land),
                        key == 4 && setSlideBar(true),
                        key == 4 && setSelectedWindowComponent("emptyLand"),
                        console.log(land);
                    }}
                    className={`${
                      key == 4
                        ? " cursor-pointer hover:bg-blue-gray-900/10 hover:opacity-90 active:opacity-70 "
                        : "cursor-default bg-yellow-300"
                    }   transition-all duration-100 text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                  >
                    {key == 4 && (
                      <Image
                        className=" h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10"
                        src={"/parcels/parcel.png"}
                        width={60}
                        height={60}
                        alt="parcel"
                        quality={30}
                      />
                    )}

                    {/* {land} */}
                  </a>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      )}
      {!isParcelSelected && (
        <div className="p-10 z-10 absolute left-[0rem]  grid grid-cols-10 gap-1 top-[4.5rem] !h-[80rem] xl:h-[180rem] xl:w-[147rem] ">
        {
        allParcelsAndTheirLands.map((parcel,key) => (
          <div key={key} className=" grid grid-cols-10 gap-[1px] xl:!w-[14rem] !w-[7rem] !h-auto">
          {parcel.map((land,index) => (
            <p key={index} className=" xl:w-5 xl:h-5 w-2 h-2 bg-yellow-500 blur-sm text-white text-[4px]"></p>
          ))}
          </div>
        ))}
  
        </div>
      )}
    </>
  );
}
