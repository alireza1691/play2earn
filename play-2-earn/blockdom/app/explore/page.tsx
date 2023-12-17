"use client"
import Slidebar from "@/components/gameComponents/slidebar";
import Attack from "@/components/gameComponents/attack";
import SelectedParcel from "@/components/gameComponents/selectedParcel";
import React, { useState } from "react";
import MapHandler from "@/components/mapHandler";
import BattleLog from "@/components/gameComponents/battleLog";



export default function Explore() {
  const [slidebar, setSlidebar] = useState(false);
  const [selectedLand, setSelectedLand] = useState<number | null>(null);

  return (
    <div className=" overflow-hidden w-screen h-screen relative">
      <BattleLog/>
    <MapHandler/>
      <SelectedParcel
        setSelectedLand={setSelectedLand}
        setSlideBar={setSlidebar}
      />

 

      <main className=" flex flex-row justify-center">
        <Slidebar
          slidebar={slidebar}
          setSlidebar={setSlidebar}
          selectedLand={selectedLand}
        />
        <Attack />
      </main>    </div>
  );
}
