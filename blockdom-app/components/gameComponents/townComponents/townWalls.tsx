import { landItems } from "@/lib/data";
import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";

export default function TownWalls() {
  const { setSelectedItem } = useSelectedBuildingContext();

  const wall = landItems[4];
  return (
    <div>
      {" "}
      <Image
        className="absolute top-[20rem] left-1/2 -translate-x-1/2 w-[65rem] h-auto"
        src={wall.imageUrl}
        width={580}
        height={480}
        alt="walls"
        priority
        quality={30}
        // onClick={() => {
        //     wall.name && wall.level && wall.imageUrl &&
        //   setSelectedItem(wall);
        // }}
      />
      <a
        onClick={() => {
          wall.name && wall.level && wall.imageUrl && setSelectedItem(wall);
        }}
        className="p-3 cursor-pointer text-black z-10 absolute left-1/2 -translate-x-1/2 top-[20rem]"
      >
        Wall lvl{wall.level}
      </a>
    </div>
  );
}
