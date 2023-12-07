"use client";
import SelectedBuilding from "@/components/gameComponents.tsx/selectedBuilding";
import Town from "@/components/gameComponents.tsx/town";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import Image from "next/image";
import React from "react";

export default function MyLand() {
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();
  // const [selectedItem, setSelectedItem] =  useState< string | null >(null)
  return (
    <>
      <Image
        className=" absolute w-screen h-screen"
        src={"/testBg.png"}
        width={1024}
        height={720}
        alt="bg"
      />
      <Town />
      {/* <Image className=' absolute top-[12.5rem] left-1/2 -translate-x-1/2 w-[860px] h-auto' src={"/testWalls.svg"} width={580} height={480} alt="walls"/>
      <Image onClick={() => {setSelectedItem("Townhall")}} className=' cursor-pointer absolute top-[20rem] left-1/2 -translate-x-1/2 w-[200px] h-auto' src={"/testTownHall.png"} width={100} height={100} alt="townHall" /> */}
      <div> MyLand</div>
      {selectedItem && <SelectedBuilding />}
    </>
  );
}
