import { landItems } from "@/lib/data";
import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { gateImage, wallImage } from "@/lib/utils";
import { usePathname } from "next/navigation";
import BuildingLabel from "./buildingLabel";

export default function TownWalls() {
  const { setSelectedItem } = useSelectedBuildingContext();
  const { inViewLand} = useUserDataContext()
  const currentRoute = usePathname()
  const isMyland = currentRoute.includes("myLand")
  const wall = landItems[4];
  return (
    <>
      {" "}
      <Image
        className="z-10 absolute top-[35rem] left-1/2 -translate-x-1/2 w-[55rem] h-auto"
        src={wallImage(Number(inViewLand?.wallLvl || 0))}
        width={1024}
        height={1024}
        alt="walls"
        priority
        quality={100}
      />
      {Number(inViewLand?.wallLvl) > 0 && 
              <Image
              className=" absolute top-[47.5rem] left-[48%] -translate-x-1/2 w-[55rem] h-auto"
              src={"/buildings/walls/wallsShadow.png"}
              width={1024}
              height={1024}
              alt="gate"
              priority
              quality={80}
            />
      }

      {/*
        Positioned by hand rather than hung off the click target below it: that
        target is rotated to sit flat against the wall in the isometric view,
        and a label inheriting the rotation would read at an angle.
      */}
      <BuildingLabel
        name={wall.name}
        level={Number(inViewLand?.wallLvl) || 0}
        className="top-[66.5rem] left-[54.5%] -translate-x-1/2"
      />
      <button
     onClick={() => { isMyland
     && inViewLand?.wallLvl && setSelectedItem(wall);
    }}
        className={`p-3 hover:blur-sm ${isMyland && " hover:bg-white/10"} h-24 w-52 rotate30 flex justify-center items-center  cursor-pointer  z-10 absolute left-[54.5%] -translate-x-1/2 top-[68rem]`}
      >
      </button>
    </>
  );
}
