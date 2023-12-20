"use client";
import { inViewParcels, parcelLands, separatedCoordinate } from "@/lib/utils";
import React from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { parcelsViewHookProps } from "@/lib/types";
import { useSelectedWindowContext } from "@/context/selected-window-context";

export default function ParcelsMobileScreen({
  setSelectedLand,
  setSlideBar,
  selectedParcel,
  isParcelSelected,
}: parcelsViewHookProps) {
  const { setSelectedWindowComponent } =
    useSelectedWindowContext();

  return (
    <>
      {isParcelSelected && (
        <div className="z-10 md:-z-10 absolute grid gap-[1px] w-[1590px]  transform grid-cols-3 left-[0rem] top-0 md:invisible ">
          {inViewParcels(selectedParcel).map((parcel, key) => (
            <div
              key={key}
              className={`grid w-fit grid-cols-10 gap-[2px] ${
                key == 4 ? "" : "blur-md brightness-50"
              }`}
            >
              {parcelLands(parcel.x, parcel.y).map((land) => (
                <Tooltip
                  radius="sm"
                  key={land}
                  color={"default"}
                  content={separatedCoordinate(land.toString())}
                  className={`capitalize  !bg-[#06291D]/80 ${
                    key != 4 && "invisible"
                  }`}
                >
                  <a
                    onClick={() => {
                      // key == 4 && setSelectedLand(land),
                        key == 4 && setSlideBar(true),
                        key == 4 && setSelectedWindowComponent("emptyLand"),
                        console.log(land);
                    }}
                    className={`${
                      key == 4
                        ? "cursor-pointer hover:opacity-90 active:opacity-70"
                        : " bg-yellow-300 cursor-default"
                    } text-black text-[8px] h-[52px] w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                  >
                    {key == 4 && (
                      <Image
                        className=" h-[52px] w-[52px] absolute -z-10"
                        src={"/parcels/parcel.png"}
                        width={60}
                        height={60}
                        alt="parcel"
                        quality={20}
                      />
                    )}

                    {key == 4 && land}
                  </a>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
