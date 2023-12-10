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

        <a className=" transition-all cursor-pointer shadow-md hover:bg-[#06291D]/40 font- text-[#98FBD7] top-[10rem] z-10 flex flex-row items-center gap-3 rounded-md left-1/2 -translate-x-1/2 absolute bg-[#06291D]/50 px-4 py-3"><WorldVector/> Go to world map</a>
     

      <main className=" flex flex-row justify-center">

        <Slidebar slidebar={slidebar} setSlidebar={setSlidebar} selectedLand={selectedLand} />
        {attackBox && <Attack />}
     
      </main>
    </>
  );
}
