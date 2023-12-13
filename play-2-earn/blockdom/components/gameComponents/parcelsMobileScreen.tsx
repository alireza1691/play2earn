"use client"
import { inViewParcels, parcelLands, separatedCoordinate } from '@/lib/utils';
import React from 'react'
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { parcelsViewHookProps } from '@/lib/types';


export default function ParcelsMobileScreen({
    setSelectedLand,
    setSlideBar,
    selectedParcel,
    setSelectedParcel
  }: parcelsViewHookProps) {
  return (
    <div  className="z-10 md:-z-10 absolute grid gap-[1px] w-[1590px]  transform grid-cols-3 left-[0rem] top-0 md:invisible ">
    {inViewParcels(selectedParcel).map((parcel,key) =>(
        <div key={key} className={`grid w-fit grid-cols-10 gap-[1px] ${key == 4 ? "":"blur-md brightness-50"}`}>
            {parcelLands(selectedParcel.x, selectedParcel.y).map((land,index) => (
                       <Tooltip radius="sm" key={land} color={"default"} content={separatedCoordinate(land.toString())} className={`capitalize  !bg-[#06291D]/80 ${key != 4 && "invisible"}`}>
                       <a
                         onClick={() =>  
                           {key == 4 && setSelectedLand(land),key == 4 && setSlideBar(true),console.log(land);
                           }
                         }
                         className={`${key == 4 ? "cursor-pointer hover:bg-blue-gray-900/10" : "cursor-default"} text-black text-[8px] h-[52px] w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `} 
                       >
                         <Image
                           className=" h-[52px] w-[52px] absolute -z-10"
                           src={"/parcels/parcel.png"}
                           width={60}
                           height={60}
                           alt="parcel"
                           quality={30}
                         />
                         {land}
                       </a>
                       </Tooltip>
            ))}
      
        </div>
    ))}
</div>
  )
}
