"use client"
import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { landItems } from "@/lib/data";
import TownBarracks from "./townBarracks";
import TownWalls from "./townWalls";
import TownTrainingCamp from "./townTrainingCamp";
import TownResourceBuildings from "./townResourceBuildings";
import TownHall from "./townHall";

export default function Town() {
  const { setSelectedItem } = useSelectedBuildingContext();

  const townHall = landItems[0]
  // const walls = landItems[4]
  return (
    <section>
      <TownHall/>
      {/* <Image
        onClick={() => {
          setSelectedItem(townHall);
        }}
        className="z-10 cursor-pointer absolute top-[12.5rem] left-1/2 -translate-x-1/2 w-[12.5%] h-auto"
        src={"/testTownHall.png"}
        width={100}
        height={100}
        alt="townHall"
      /> */}
      <TownBarracks/>
      <TownWalls/>
      <TownTrainingCamp/>
      <TownResourceBuildings/>

    </section>
  );
}
