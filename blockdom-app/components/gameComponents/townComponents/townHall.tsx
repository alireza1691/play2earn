import { landItems } from "@/lib/data";
import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townHallImage } from "@/lib/utils";
import { Tooltip } from "@nextui-org/react";
export default function TownHall() {
  const { setSelectedItem } = useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();
  const townHall = landItems[0];
  return (
    <>
      {Number(inViewLand?.townhallLvl) > 0 ? (
        <Image
          className="z-10 cursor-pointer absolute top-[22.5rem] left-1/2 -translate-x-1/2 w-[12rem] h-auto"
          src={townHallImage(Number(inViewLand?.townhallLvl) || 0)}
          width={580}
          height={480}
          alt="townHall"
          onClick={() => {
            setSelectedItem(townHall);
          }}
        />
      ) : (
        <Tooltip
          closeDelay={0}
          content={
            <div>
              {" "}
              <Image
                className="w-[6rem] h-auto"
                src={townHallImage(1)}
                width={100}
                height={100}
                alt="townHall"
              />
              <h3 className=" py-3 text-center ">Townhall</h3>
            </div>
          }
        >
          <div
            onClick={() => {
              setSelectedItem(townHall);
            }}
            className="z-10 absolute buildPlace top-[25.5rem] left-[48%] -translate-x-1/2  h-[7rem] w-[7rem] cursor-pointer"
          ></div>
        </Tooltip>
      )}
    </>
  );
}
