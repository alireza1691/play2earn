"use client"
import Slidebar from "@/components/gameComponents/slidebar";
import Attack from "@/components/gameComponents/attack";
import SelectedParcel from "@/components/gameComponents/selectedParcel";
import React, { useState } from "react";



export default function Explore() {
  const [slidebar, setSlidebar] = useState(false);
  const [selectedLand, setSelectedLand] = useState<number | null>(null);

  return (
    <>
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
        {/* {attackBox && <Attack />} */}
      </main>    </>
  );
}
