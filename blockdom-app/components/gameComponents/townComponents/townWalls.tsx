import { landItems } from "@/lib/data";
import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { gateImage, wallImage } from "@/lib/utils";

export default function TownWalls() {
  const { setSelectedItem } = useSelectedBuildingContext();
  const { inViewLand} = useUserDataContext()

  const wall = landItems[4];
  return (
    <>
      {" "}
      <Image
        className="z-10 absolute top-[27.5rem] left-1/2 -translate-x-1/2 w-[55rem] h-auto"
        src={wallImage(Number(inViewLand?.wallLvl || 0))}
        width={1024}
        height={1024}
        alt="walls"
        priority
        quality={100}
      />
      {Number(inViewLand?.wallLvl) > 0 && 
              <Image
              className=" absolute top-[40rem] left-[48%] -translate-x-1/2 w-[55rem] h-auto"
              src={"/buildings/walls/wallsShadow.png"}
              width={1024}
              height={1024}
              alt="gate"
              priority
              quality={80}
            />
      }

      <button
     onClick={() => {
      wall.name && inViewLand?.wallLvl && wall.imageUrl && setSelectedItem(wall);
    }}
        className="p-3 hover:blur-sm hover:bg-white/10 h-24 w-52 rotate30 flex justify-center items-center  cursor-pointer  z-10 absolute left-[55.5%] -translate-x-1/2 top-[60rem]"
      >
       {/* <h3 className="text-white text-center "> Wall lvl{Number(inViewLand?.wallLvl) ||0 }</h3> */}
      </button>
    </>
  );
}
