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
      <TownBarracks/>
      <TownWalls/>
      <TownTrainingCamp/>
      <TownResourceBuildings/>

    </section>
  );
}
