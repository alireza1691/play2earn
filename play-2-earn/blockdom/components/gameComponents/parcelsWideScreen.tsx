"use client";
import React, { useMemo } from "react";
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
 
  const allParcels = useMemo(() => {
    let parcelLandsArray = [];
    for (let y = 9; y > -1; y--) {
      for (let x = 0; x < 10; x++) {
        const item = parcelLands((x + 10) * 10, (y + 10) * 10);
        parcelLandsArray.push(item);
      }
    }
    return parcelLandsArray;
  }, []);
  const allParcelsAndTheirLands = allParcels



  const parcelImage = (
    <Image
      className=" h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10"
      src={"/parcels/parcel.png"}
      width={60}
      height={60}
      alt="parcel"
      quality={30}
    />
  );

  const landStyleMapView = " xl:w-5 xl:h-5 w-2 h-2 bg-yellow-500  text-white text-[4px]"
  const parcelStyleMapView = "relative hover:brightness-75 transition-all cursor-pointer grid grid-cols-10 gap-[2px] xl:!w-[13rem] !w-[7rem] !h-auto "
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
                        ? " cursor-pointer hover:bg-gray-900/10 hover:opacity-90 active:opacity-70 "
                        : "cursor-default bg-yellow-300"
                    }   transition-all duration-100 text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                  >
                    {key == 4 && (
                      parcelImage
                      // <Image
                      //   className=" h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10"
                      //   src={"/parcels/parcel.png"}
                      //   width={60}
                      //   height={60}
                      //   alt="parcel"
                      //   quality={30}
                      // />
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
        <div className="p-10 z-10 absolute left-[0rem]  grid grid-cols-10 gap-1 top-[4rem] !h-[80rem] xl:h-[180rem] xl:w-[137rem] ">
        {
        allParcelsAndTheirLands.map((parcel,key) => (
          <div key={key} className={parcelStyleMapView} >
            <a className=" opacity-10 hover:opacity-100 h-full w-full flex items-center justify-center   text-center absolute z-50 text-white  text-[25px]">{parcel[0]-9}</a>
          {parcel.map((land,index) => (
            <p key={index} className={landStyleMapView} ></p>
          ))}
          </div>
        ))}
  
        </div>
      )}
    </>
  );
}
