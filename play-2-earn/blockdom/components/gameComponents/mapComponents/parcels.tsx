"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { getMintedLandsFromEvents, inViewParcels, parcelLands, separatedCoordinate, zeroAddress } from "@/lib/utils";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { MintedLand } from "@/lib/types";



export default function Parcels() {
  const { setSelectedWindowComponent } = useSelectedWindowContext();
  const [mintedLands, setMintedLands] = useState<MintedLand[]|null>(null)
  const { apiData, loading} = useApiData();
  const {selectedParcel, setSelectedLand} = useMapContext()


  const getOwnerFromEvents =(tokenId:number):string =>{
    let isPresent: boolean
    let ownerAddress: string = zeroAddress
    if (!mintedLands) {
      isPresent = false;
    } else{
      isPresent = mintedLands?.some(item => item.tokenId === tokenId.toString());
      if (isPresent) {
        const land = mintedLands.find(item => item.tokenId === tokenId.toString());
        ownerAddress = land?.owner ?? ownerAddress;
      }

    }
    return ownerAddress 
  }


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

   
      {selectedParcel && (

        <>
               
                 {/* <div className="z-10 md:h-[1620px] relative overflow-hidden w-[1080px] md:w-[2240px] 2xl:w-[2130px]">
              <div className="left-20 z-10 bg-white w-[60rem] h-[40rem]  rounded-full blur-lg"></div>
                </div> */}

            {/* <div className="z-0 md:h-[1620px] relative overflow-hidden w-[1080px] md:w-[2240px] 2xl:w-[2130px]">
    <div className="z-30 bg-white/50 ml-auto mt-auto    xl:h-[52.5rem] xl:w-[70rem]  left-40 top-40"></div>
    <Image className=" overflow-hidden object-cover blur-sm translate-x-[10%]  !h-[100rem] !w-[800rem] top-0" src={"/map/Island.png"} width={1000} height={1000} alt="sea" quality={20} ></Image>
    </div> */}
        <div className="z-10 transition-all invisible md:visible absolute grid gap-[1px] w-[1080px] md:w-[1590px] 2xl:w-[2130px]  grid-cols-3 md:left-[20rem] 2xl:left-[27.5rem] top-0 viewGrid ">
          {inViewParcels(selectedParcel).map((parcel, key) => (
            <div
              key={key}
              className={` grid w-fit grid-cols-10 gap-[1px] ${
                key == 4 ? " " : "blur-sm brightness-50 "
              }${ parcel.x < 100 && parcel.y < 100 && parcel.y > 190 && parcel.x > 190 ? " bg-blue-400/80" :""} `}
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
                      key == 4 && setSelectedLand({coordinate: land,owner: getOwnerFromEvents(land),isMinted: getOwnerFromEvents(land) != zeroAddress}),
                      // key == 4 && setSlideBar(true),
                        key == 4 && setSelectedWindowComponent("emptyLand"),
                        console.log(land);
                    }}
                    className={`${
                      key == 4
                        ? " cursor-pointer  hover:opacity-80 active:opacity-70  "
                        : `cursor-default ${parcel.x >=100 && parcel.y >= 100 && parcel.y < 200 && parcel.x <200 ? "bg-yellow-300/80 " : " bg-blue-400/80"} `
                    }  ${getOwnerFromEvents(land) != zeroAddress && "brightness-50" } transition-all duration-100 text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                  >
                    {
                      key == 4 &&
                      <Image
                      className={`${getOwnerFromEvents(land) != zeroAddress && " brightness-50" }  h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10`}
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
                        //  key == 4 && setSlideBar(true),
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
         </>
      )}
    </>
  );
}
