"use client"
import Slidebar from "@/components/gameComponents/slidebar";
import Attack from "@/components/gameComponents/attack";
import SelectedParcel from "@/components/gameComponents/selectedParcel";
import WorldVector from "@/svg/worldVector";
import React, { useState } from "react";



export default function Explore() {
  const [slidebar, setSlidebar] = useState(false);
  const [attackBox, setAttackBox] = useState(true);
  const [selectedLand, setSelectedLand] = useState<number | null>(null);

  return (
    <>
      <SelectedParcel
        setSelectedLand={setSelectedLand}
        setSlideBar={setSlidebar}
      />

      <a onClick={() => {setAttackBox(!attackBox)}} className="z-50 transition-all cursor-pointer shadow-md hover:bg-[#06291D]/40 font- text-[#98FBD7] top-[10rem]  flex flex-row items-center gap-3 rounded-md left-1/2 -translate-x-1/2 absolute bg-[#06291D]/50 px-4 py-3">
        <WorldVector /> Go to world map
      </a>

      <main className=" flex flex-row justify-center">
        <Slidebar
          slidebar={slidebar}
          setSlidebar={setSlidebar}
          selectedLand={selectedLand}
        />
        {attackBox && <Attack />}
      </main>    </>
  );
}
