import { useMapContext } from '@/context/map-context';
import { SelectedParcelType } from '@/lib/types';
import Image from 'next/image';
import React from 'react'



export default function ParcelSwitchArrows() {
  const {selectedParcel,setSelectedParcel} = useMapContext()


  return (
    <>
    {selectedParcel && (
     <div className=" absolute w-[42rem] h-[42rem] left-[29rem]  top-[29rem] md:h-[40rem] md:w-[40rem] md:top-[30rem] md:left-[800px] 2xl:left-[1140px] 2xl:top-[46rem] 2xl:w-[47rem] 2xl:h-[43rem] ">

     <a
       onClick={() => {
         selectedParcel.y < 190 &&
           setSelectedParcel({
             x: selectedParcel.x,
             y: selectedParcel.y + 10,
           });
       }}
       className={` ${
         selectedParcel.y >= 190
           ? "brightness-50  opacity-50 "
           : "cursor-pointer"
       } invisible md:visible   z-40 md:right-[4rem] md:top-[9.5rem] 2xl:top-[7.5rem] absolute`}
     >
       <Image
         src={"/svgs/gameItems/topRightArrow.svg"}
         width={60}
         height={60}
         alt="arrow"
       />
     </a>
     <a
       onClick={() => {
         selectedParcel.x >= 110 &&
           setSelectedParcel({
  
             x: selectedParcel.x - 10,
             y: selectedParcel.y
           });
       }}
       className={`${
         selectedParcel.x <= 100
           ? "brightness-50  opacity-50"
           : "cursor-pointer"
       } invisible md:visible   z-40 md:left-[3rem] md:top-[10.5rem] 2xl:top-[8rem] absolute`}
     >
       <Image
         src={"/svgs/gameItems/topLeftArrow.svg"}
         width={60}
         height={60}
         alt="arrow"
       />
     </a>
     <a
       onClick={() => {
         selectedParcel.y >= 110 &&
           setSelectedParcel({
             x: selectedParcel.x,
             y: selectedParcel.y - 10,
           });
       }}
       className={`${
         selectedParcel.y <= 100
           ? "brightness-50  opacity-50"
           : "cursor-pointer"
       } invisible md:visible  z-40  md:left-[2.5rem] md:bottom-[9.5rem] absolute`}
     >
       <Image
         src={"/svgs/gameItems/bottomLeftArrow.svg"}
         width={65}
         height={65}
         alt="arrow"
       />
     </a>
     <a
       onClick={() => {
        selectedParcel.x < 190 &&
           setSelectedParcel({
             x: selectedParcel.x + 10,
             y: selectedParcel.y
           });
       }}
       className={` ${
         selectedParcel.x >= 190
           ? "brightness-50  opacity-50"
           : "cursor-pointer"
       }  invisible md:visible  z-40 md:right-[4rem] bottom-[11rem] absolute`}
     >
       <Image
         src={"/svgs/gameItems/bottomRightArrow.svg"}
         width={60}
         height={60}
         alt="arrow"
       />
     </a>
     </div>
    )}

    </>
  )
}
