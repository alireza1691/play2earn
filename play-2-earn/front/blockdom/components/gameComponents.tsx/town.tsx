"use client"
import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { landItems } from "@/lib/data";
import TownBarracks from "./townBarracks";
import TownWalls from "./townWalls";

export default function Town() {
  const { setSelectedItem } = useSelectedBuildingContext();

  const townHall = landItems[0]
  // const walls = landItems[4]
  return (
    <section>
      <Image
        onClick={() => {
          setSelectedItem(townHall);
        }}
        className="z-10 cursor-pointer absolute top-[25vw] left-1/2 -translate-x-1/2 w-[12.5%] h-auto"
        src={"/testTownHall.png"}
        width={100}
        height={100}
        alt="townHall"
      />
      <TownBarracks/>
      <TownWalls/>
    </section>
  );
}
