"use client";
import React, { useMemo, useState } from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { inViewParcels, parcelLands, separatedCoordinate } from "@/lib/utils";
import { parcelsViewHookProps } from "@/lib/types";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { landsPInst, provider } from "@/lib/instances";
import { useApiData } from "@/context/api-data-context";

export default function ParcelsWideScreen({
  setSelectedLand,
  setSlideBar,
  selectedParcel,
  isParcelSelected,
}: parcelsViewHookProps) {
  const { setSelectedWindowComponent } = useSelectedWindowContext();

  const { apiData, loading } = useApiData();
  // async function landClickHandler(selectedLand:number):Promise<string | null> {
  //   try {
  //     const owner =await landsPInst.ownerOf(selectedLand)
  //     const imageUrl = await landsPInst.URI(selectedLand)
  //     console.log(uri);
  //     setSelectedLand({})

  //   } catch (error) {
  //     console.log("land not minted");
  //     return null
  //   }
  // }
  type ApiDataType ={
    address: string;
    blockHash: string;
    blockNumber: string;
    data: string;
    gasPrice: string;
    gasUsed: string;
    logIndex: string;
    timeStamp: string;
    topics: string[];
    transactionHash: string;
    transactionIndex: string;
  }[];


  console.log(apiData, "111");
  console.log(apiData.result);
  // async function getMintedLandsFromEvents(events: ApiDataType) {
  //   let mintedLands = [];
  //   for (let index = 0; index < events.length; index++) {
  //     if (events[index].topics !== undefined) {
  //       const topics = events[index].topics;
  //       if (
  //         Array.isArray(topics) &&
  //         topics.length === 4 &&
  //         topics[1] ==
  //           "0x0000000000000000000000000000000000000000000000000000000000000000" &&
  //         100 <= parseInt(topics[3], 16) <= 200
  //       ) {
  //         let ownerAddress = topics[2].replace("000000000000000000000000", "");
  //         mintedLands.push({
  //           tokenId: parseInt(topics[3], 16).toString(),
  //           owner: ownerAddress,
  //         });
  //       }
  //     }
  //   }
  //   console.log("Here are all minted lands:", mintedLands);
  //   return mintedLands;
  // }

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
                      // key == 4 && setSelectedLand(land),
                      key == 4 && setSlideBar(true),
                        key == 4 && setSelectedWindowComponent("emptyLand"),
                        console.log(land);
                    }}
                    className={`${
                      key == 4
                        ? " cursor-pointer  hover:opacity-80 active:opacity-70  "
                        : "cursor-default bg-yellow-300"
                    }   transition-all duration-100 text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                  >
                    {
                      key == 4 && parcelImage
                      // <Image
                      //   className=" h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10"
                      //   src={"/parcels/parcel.png"}
                      //   width={60}
                      //   height={60}
                      //   alt="parcel"
                      //   quality={30}
                      // />
                    }

                    {/* {land} */}
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
