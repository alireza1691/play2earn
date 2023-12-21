"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { getMintedLandsFromEvents, inViewParcels, parcelLands, separatedCoordinate } from "@/lib/utils";
import { parcelsViewHookProps } from "@/lib/types";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useApiData } from "@/context/api-data-context";

type MintedLand = {
  tokenId: string,
  owner: string,
}

export default function ParcelsWideScreen({
  setSelectedLand,
  setSlideBar,
  selectedParcel,
  isParcelSelected,
}: parcelsViewHookProps) {
  const { setSelectedWindowComponent } = useSelectedWindowContext();
  const [mintedLands, setMintedLands] = useState<MintedLand[]|null>(null)
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
  const isTokenIdPresent =(tokenId:number):boolean =>{
    let isPresent: boolean
    if (!mintedLands) {
      isPresent = false;
    } else{
      isPresent = mintedLands?.some(item => item.tokenId === tokenId.toString());
    }
    return isPresent
  }



  console.log(apiData);
  // console.log(apiData.result);



  useEffect(()=> {
    const getData =() => {
      if (apiData) {
        const mintedLandsFromEvents = getMintedLandsFromEvents(apiData.result )
        setMintedLands(mintedLandsFromEvents)
      }
    }
    getData()
  },[apiData])
  


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
                        : `cursor-default ${parcel.x >=100 && parcel.y >= 100 && "bg-yellow-300 "} `
                    }  ${isTokenIdPresent(land) && "brightness-50" } transition-all duration-100 text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                  >
                    {
                      key == 4 &&
                      <Image
                      className={`${isTokenIdPresent(land) && " brightness-50" }  h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10`}
                      src={"/parcels/parcel.png"}
                      width={60}
                      height={60}
                      alt="parcel"
                      quality={30}
                    />
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
