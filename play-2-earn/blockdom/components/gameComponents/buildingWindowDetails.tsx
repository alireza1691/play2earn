"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import Image from "next/image";
import React from "react";
import { Progress } from "@nextui-org/react";
import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import { warriors } from "@/lib/data";

export default function BuildingWindowDetails() {
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();
  return (
    <div className="h-full flex flex-col w-full py-3">
      {selectedItem?.name == "Barracks" && (
        <div className="px-3 h-full ">
          <div className=" flex flex-col h-[20%]">
            <h3 className="gap-2 text-[14px] font-bold flex flex-row items-center">
              {" "}
              <ArmyCapacityIcon /> 100/250 Units{" "}
            </h3>
            <Progress
              color="default"
              aria-label="Loading..."
              value={70}
              classNames={{
                indicator: "!bg-[#98DDFB]",
                track: "bg-gray-800/20 border border-gray-300/30 darkShadow",
              }}
            />
          </div>
          <div className="mt-6 grid grid-cols-3 h-[80%] px-2   gap-3  ">
            {warriors.map((warrior, key) => (
              <div key={key} className={"cardBg w-full "}>
                <Image
                  src={"/images/warriorTest.png"}
                  width={50}
                  height={80}
                  alt="warrior"
                  className="w-full h-auto"
                />
                <p className=" text-[10px] text-center">{warrior}<br></br>100</p>
              
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}
