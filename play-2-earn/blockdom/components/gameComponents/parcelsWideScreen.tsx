"use client"
import React from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { inViewParcels, parcelLands, separatedCoordinate } from "@/lib/utils";
import { parcelsViewHookProps } from "@/lib/types";



export default function ParcelsWideScreen({
  setSelectedLand,
  setSlideBar,
  selectedParcel,
  setSelectedParcel
}: parcelsViewHookProps) {


  return (
    <>
   
    <div className="z-10 transition-all invisible md:visible absolute grid gap-[1px] w-[1080px] md:w-[1590px] 2xl:w-[2130px]  grid-cols-3 md:left-[20rem] 2xl:left-[27.5rem] top-0 viewGrid ">
      {inViewParcels(selectedParcel).map((parcel, key) => (
        <div
          key={key}
          className={`grid w-fit grid-cols-10 gap-[1px] ${
            key == 4 ? "" : "blur-md brightness-50 "
          }`}
        >
          {parcelLands(parcel.x, parcel.y).map(
            (land, index) => (
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
                      console.log(land);
                  }}
                  className={`${
                    key == 4
                      ? " cursor-pointer hover:bg-blue-gray-900/10 hover:opacity-90"
                      : "cursor-default"
                  } bg-[url("/parcels/parcel.png")]  transition-all duration-100 text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                >
                  {/* <Image
                    className=" h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10"
                    src={"/parcels/parcel.png"}
                    width={60}
                    height={60}
                    alt="parcel"
                    quality={30}
                  /> */}
                  {land}
                </a>
              </Tooltip>
            )
          )}
        </div>
      ))}
    </div>
    </>
  );
}
