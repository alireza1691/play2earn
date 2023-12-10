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

export default function Explore2() {
  const [slidebar, setSlidebar] = useState(false);
  const [attackBox, setAttackBox] = useState(false);
  const [selectedLand, setSelectedLand] = useState<number | null>(null)



  return (
    <>
        

          {/* <SelectedParcel setSelectedLand={setSelectedLand} setSlideBar={setSlidebar}/> */}
          
      {/* sm:w-[480px]  md:w-[768px] lg:w-[976px] */}
        {/* <Image
          className=" backdrop-brightness-0 brightness-75 absolute  h-[37.5rem] top-[3rem] md:h-[45rem] lg:h-screen w-full  2xl:w-[1290px]  sm:right-0 -z-10 blur-sm object-cover xl:top-[3rem] "
          src={"/svg/gameItems/bg.svg"}
          width={1008}
          height={629}
          alt="deactivedParcel"
        /> */}
        {/* <div className=" absolute h-screen w-screen overflow-hidden">
       
        </div>
   */}
        <a className=" transition-all cursor-pointer shadow-md hover:bg-[#06291D]/40 font- text-[#98FBD7] top-[10rem] z-10 flex flex-row items-center gap-3 rounded-md left-1/2 -translate-x-1/2 absolute bg-[#06291D]/50 px-4 py-3"><WorldVector/> Go to world map</a>
     

      <main className=" flex flex-row justify-center">
      {/* <div className="z-0  relative w-screen  md:w-[768px] h-[50rem] lg:w-[976px] 2xl:w-[1440px] overflow-y-scroll overflow-x-scroll brightness-75">
            <Image className=" blur-sm !w-auto !h-[60rem] object-cover absolute " src={'/svg/gameItems/bg.svg'} width={400} height={400} alt="bg"/>
          </div> */}
        <Slidebar slidebar={slidebar} setSlidebar={setSlidebar} selectedLand={selectedLand} />
        {attackBox && <Attack />}
     
      </main>
    </>
  );
}
