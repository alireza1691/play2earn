"use client";

import Slidebar from "@/components/exploreComponents/slidebar";
import Attack from "@/components/gameComponents.tsx/attack";
import SelectedParcel from "@/components/gameComponents.tsx/selectedParcel";
import WorldVector from "@/svg/worldVector";
import Image from "next/image";
import React, { useState } from "react";

type Item = {
  x: number;
  y: number;
};

export default function Explore() {
  const [slidebar, setSlidebar] = useState(false);
  const [attackBox, setAttackBox] = useState(false);
  const [selectedLand, setSelectedLand] = useState<number | null>(null)



  return (
    <>
          <SelectedParcel setSelectedLand={setSelectedLand} setSlideBar={setSlidebar}/>

      <div className="z-0 right-0 absolute w-screen h-screen lg:w-[976px] 2xl:w-[1440px] overflow-hidden lg:bg-[url('/svg/gameItems/bg.svg')] bg-[url('/BGMobile.jpg')] bg-cover bg-center bg-no-repeat brightness-75 blur-sm "></div>
      {/* sm:w-[480px]  md:w-[768px] lg:w-[976px] */}
        {/* <Image
          className=" backdrop-brightness-0 brightness-75 absolute  h-[37.5rem] top-[3rem] md:h-[45rem] lg:h-screen w-full  2xl:w-[1290px]  sm:right-0 -z-10 blur-sm object-cover xl:top-[3rem] "
          src={"/svg/gameItems/bg.svg"}
          width={1008}
          height={629}
          alt="deactivedParcel"
        /> */}
        <div className=" absolute h-screen w-screen overflow-hidden">
        <Image
          className=" absolute left-20 -translate-x-1/2 md:top-0 -top-[7.5rem] h-[20rem]  w-auto z-10  object-cover"
          src={"/svg/gameItems/cloudTL.svg"}
          width={698}
          height={467}
          alt="tlcloud"
        />
        <Image
          className=" absolute right-0 translate-x-1/2  md:top-0 -top-[7.5rem] h-[20rem]  w-auto z-10  "
          src={"/svg/gameItems/cloudTR.svg"}
          width={698}
          height={467}
          alt="trcloud"
        />
        <Image
          className=" absolute -left-20  translate-y-1/2 bottom-0  h-[20rem]  w-auto z-10  "
          src={"/svg/gameItems/cloudBL.svg"}
          width={698}
          height={467}
          alt="deactivedParcel"
        />
        <Image
          className=" absolute translate-y-1/2 bottom-0  -right-20 h-[20rem]  w-auto  z-10 "
          src={"/svg/gameItems/cloudBR.svg"}
          width={1008}
          height={629}
          alt="deactivedParcel"
        />
        </div>
     
        {/* <a className=" cursor-pointer z-50 left-[21.5rem] bottom-[14rem] absolute">
        <Image src={"/svg/gameItems/bottomLeftArrow.svg"} width={65} height={65} alt="arrow"/>
        </a>
        <a className="cursor-pointer z-50 right-[22.5rem] bottom-[15rem] absolute">
        <Image src={"/svg/gameItems/bottomRightArrow.svg"} width={60} height={60} alt="arrow"/>
        </a>
        <a className="cursor-pointer z-50 right-[23.5rem] top-[22rem] absolute">
        <Image src={"/svg/gameItems/topRightArrow.svg"} width={60} height={60} alt="arrow"/>
        </a>
        <a className=" cursor-pointerz-50 left-[22.5rem] top-[23rem] absolute">
        <Image src={"/svg/gameItems/topLeftArrow.svg"} width={60} height={60} alt="arrow"/>
        </a> */}
        <a className=" transition-all cursor-pointer shadow-md hover:bg-[#06291D]/40 font- text-[#98FBD7] top-[10rem] z-10 flex flex-row items-center gap-3 rounded-md left-1/2 -translate-x-1/2 absolute bg-[#06291D]/50 px-4 py-3"><WorldVector/> Go to world map</a>
     

      <main>
        <Slidebar slidebar={slidebar} setSlidebar={setSlidebar} selectedLand={selectedLand} />
        {attackBox && <Attack />}
     
        {/* <div className=" p-4">
          <ul className="flow-root space-y-4 relative top-[10rem]">
            <li className="bg-white p-2 overflow-hidden relative">
              Item 1
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 top-10 z-50"></div>
            </li>
            <li className="bg-white p-2 relative overflow-hidden">
              Item 2
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 -top-8 z-50"></div>
            </li>
            <li className="bg-white p-2   overflow-hidden relative">
              Item 3
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 -top-28 z-50"></div>
            </li>
            <li className="bg-white  p-2 overflow-hidden relative">
              Item 4{" "}
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 -top-40 z-50"></div>
            </li>
            <li className="bg-white p-2 overflow-hidden relative">
              Item 5{" "}
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 -top-56 z-50"></div>
            </li>
          </ul>
        </div> */}
      </main>
    </>
  );
}
