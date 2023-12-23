"use client"
import {  landsPInst } from "@/lib/instances";
import CloseIcon from "@/svg/closeIcon";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import SlideBarButtons from "./slideBarButtons";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";


export default function Slidebar() {
  const [imageUrl,setImageUrl] = useState<null| string>(null)
  const [isOwnedLand, setIsOwnedLands] = useState(false)
  const {selectedLand,setSelectedLand} = useMapContext()
  const {ownedLands} = useUserDataContext()



  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!imageUrl) {
          const url = await landsPInst.URI()
          setImageUrl(url)
        }
        if (selectedLand && ownedLands) {
          if (ownedLands.some(item => item.tokenId == selectedLand.coordinate.toString())) {
            setIsOwnedLands(true)            
          }
        }
        if (!selectedLand) {
          setIsOwnedLands(false)
        }
      } catch (error) {
        console.log(error);
        
      }
    }
    fetchData()
  },[imageUrl,selectedLand])

  

  return (
    <>
    <div
      className={`${
        selectedLand
          ? "z-50 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-16"
          : "-left-[50rem]"
      } flex flex-col transition-all  top-[4.55rem] absolute h-[85%] w-[90%] md:w-fit px-3 bg-[#21302A]/60 backdrop-blur-sm rounded-2xl `}
    >
      <div className="p-4 flex flex-row justify-between">
        <h3 className=" text-white ">Land { selectedLand  && selectedLand?.coordinate}</h3>
        <a className=" transition-all closeIcon" onClick={() => {setSelectedLand(null)}}><CloseIcon/></a>

      </div>
      <div className=" flex justify-center mt-2 h-[35%]  ">
        {imageUrl && 
        <div className=" w-auto  h-auto !p-2 cardBg !rounded-lg darkShadow">
                 <Image
                 src={imageUrl}
                 width={256}
                 height={364}
                 alt="card"
                 className=" h-full w-auto "
               />
             </div>
        }
      </div>
      <div className="flex flex-col justify-around h-full max-h-[35%]">
        <div className=" flex flex-row justify-evenly items-center w-full">
      
          <div className="goldBg goodsBalanceKeeper !w-[45%] h-full">
            <Image
              src={"/svgs/icons/goldIcon.svg"}
              width={32}
              height={32}
              alt="goldIcon"
            />
            <h4 className=" text-white font-semibold ">12314123</h4>
          </div>
          <div className="foodBg goodsBalanceKeeper !w-[45%] h-full">
            <Image
              src={"/svgs/icons/foodIcon.svg"}
              width={32}
              height={32}
              alt="goldIcon"
            />
            <h4 className=" text-white font-semibold">12314123</h4>
          </div>
        </div>
        <div className="flex flex-row gap-4 justify-center ">
        <div  className="cardBg ml-auto mr-auto darkShadow">
            <Image
                   src={"/images/warriorTest.png"}
              alt="warriorCard"
              width={40}
              height={64}
               className ={" w-[50px] h-auto  rounded-sm"}
            />
            <h4 className="mt-1 text-center text-[10px]">100</h4>
          </div>
          <div  className="cardBg ml-auto mr-auto darkShadow">
            <Image
                   src={"/images/warriorTest.png"}
              alt="warriorCard"
              width={40}
              height={64}
               className ={" w-[50px] h-auto  rounded-sm"}
            />
            <h4 className="mt-1 text-center text-[10px]">100</h4>
          </div>
          <div  className="cardBg ml-auto mr-auto darkShadow">
            <Image
                   src={"/images/warriorTest.png"}
              alt="warriorCard"
              width={40}
              height={64}
               className ={" w-[50px] h-auto  rounded-sm"}
            />
            <h4 className="mt-1 text-center text-[10px]">100</h4>
          </div>
          <div  className="cardBg ml-auto mr-auto darkShadow">
            <Image
                   src={"/images/warriorTest.png"}
              alt="warriorCard"
              width={40}
              height={64}
               className ={" w-[50px] h-auto  rounded-sm"}
            />
            <h4 className="mt-1 text-center text-[10px]">100</h4>
          </div>
          <div  className="cardBg ml-auto mr-auto darkShadow">
            <Image
                   src={"/images/warriorTest.png"}
              alt="warriorCard"
              width={40}
              height={64}
               className ={" w-[50px] h-auto rounded-sm"}
            />
            <h4 className="mt-1 text-center text-[10px]">100</h4>
          </div>
        </div>
      </div>
      <SlideBarButtons selectedLand={selectedLand} isOwnedLand={isOwnedLand}/>

    </div>
    </>
  );
}
