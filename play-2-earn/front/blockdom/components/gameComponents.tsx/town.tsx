import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { landItems } from "@/lib/data";

export default function Town() {
  const { setSelectedItem } = useSelectedBuildingContext();

  const townHall = landItems[0]
  return (
    <section>
      <Image
        className=" absolute top-[12.5rem] left-1/2 -translate-x-1/2 w-[65%] h-auto"
        src={"/testWalls.svg"}
        width={580}
        height={480}
        alt="walls"
      />
      <Image
        onClick={() => {
          setSelectedItem(townHall);
        }}
        className=" cursor-pointer absolute top-[25vw] left-1/2 -translate-x-1/2 w-[12.5%] h-auto"
        src={"/testTownHall.png"}
        width={100}
        height={100}
        alt="townHall"
      />
    </section>
  );
}
