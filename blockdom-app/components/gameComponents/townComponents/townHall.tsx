import { landItems } from "@/lib/data";
import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townHallImage } from "@/lib/utils";
import { Tooltip } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import BuildingLabel from "./buildingLabel";
export default function TownHall() {
  const { setSelectedItem } = useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();
  const townHall = landItems[0];
  const currentRoute = usePathname()
  const isMyland = currentRoute.includes("myLand")
  return (
    <>

        {/*
          The positioning moved from the image to this wrapper so the nameplate
          can hang off it — an absolutely positioned box is a containing block
          for its own absolute children, so the label needs no coordinates.
        */}
        <div className="z-20 absolute top-[47rem] left-1/2 -translate-x-1/2 w-[12rem]">
          <BuildingLabel
            name={townHall.name}
            level={Number(inViewLand?.townhallLvl) || 0}
          />
          <Image
            className="cursor-pointer w-full h-auto"
            src={townHallImage(Number(inViewLand?.townhallLvl) || 0)}
            width={580}
            height={480}
            alt="townHall"
            onClick={() => {isMyland &&
              setSelectedItem(townHall);
            }}
          />
        </div>
          <Image
    className="z-10 absolute top-[52rem] -translate-x-1/2 left-[47.5%] xl:left-[48%]  w-[10rem] h-auto"
    src={"/buildings/shadow.png"}
    width={580}
    height={480}
    alt="shadow"

  />
     
    </>
  );
}
