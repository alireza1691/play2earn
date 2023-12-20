"use client"
import Slidebar from "@/components/gameComponents/slidebar";
import Attack from "@/components/gameComponents/attack";
import SelectedParcel from "@/components/gameComponents/selectedParcel";
import React, { useState } from "react";

import BattleLog from "@/components/gameComponents/battleLog";
import { SelectedLandType } from "@/lib/types";



export default function Explore() {
  const [slidebar, setSlidebar] = useState(false);
  const [selectedLand, setSelectedLand] = useState<SelectedLandType | null>(null);

  return (
    <div className=" overflow-hidden w-screen h-screen relative">
      <BattleLog/>
      <SelectedParcel
        setSelectedLand={setSelectedLand}
        setSlideBar={setSlidebar}
      />

 

      <div className=" flex flex-row justify-center">
        <Slidebar
          slidebar={slidebar}
          setSlidebar={setSlidebar}
          selectedLand={selectedLand}
        />
        <Attack />
      </div>
          </div>
  );
}
