"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { warriors } from "@/lib/data";
import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import CloseIcon from "@/svg/closeIcon";
import DoubleArrow from "@/svg/doubleArrow";
import TopDuobleArrow from "@/svg/topDuobleArrow";
import Image from "next/image";
import React from "react";
import BuildingWindowButtons from "./buildingWindowButtons";
import BuildingWindowDetails from "./buildingWindowDetails";
import BuildingWindowHeader from "./buildingWindowHeader";
import BuildingWindowImage from "./buildingWindowImage";
import CapacityProgressBar from "./capacityProgressBar";

import UpgradeContainer from "./upgradeContainer";

export default function SelectedBuilding() {
  const { selectedItem, setSelectedItem, activeMode, upgradeMode } =
    useSelectedBuildingContext();

  const { ownedLands } = useUserDataContext();
  const imageUrl = selectedItem?.imageUrl || "";
  return (
    // <section
    //   className={`buildingWindow transition-all z-20 ${
    //     selectedItem === null && "!-left-[50rem]"
    //   }`}
    // >
    //   <div className=" flex flex-col h-full justify-center items-center ">
    //     <div className="h-[7.5%] w-full">
    //       <BuildingWindowHeader />
    //     </div>
    //     <div className="h-[35%] w-full">
    //       <BuildingWindowImage />
    //     </div>
    //     <div className="h-[7.5%]">        <UpgradeContainer/></div>
    //     <BuildingWindowDetails />

    //     <div className="h-[20%] w-full">
    //     <BuildingWindowButtons/>
    //     </div>

    //   </div>
    // </section>
    <>
      <section
        className={`${selectedItem == null && "!-left-[50rem]"} ${
          selectedItem &&
          selectedItem.name == "Barracks" &&
          activeMode &&
          "!-left-[50rem]"
        } transition-all !flex-shrink-0 flex flex-col buildingWindow`}
      >
        <BuildingWindowHeader />
        <BuildingWindowImage />

        <BuildingWindowDetails />

        <BuildingWindowButtons />
      </section>
      <section
        className={`barracksActiveBg flex flex-col absolute h-[85%] w-[95%] left-1/2 -translate-x-1/2 z-10 top-[4.5rem]`}
      >
        <div className=" flex flex-row justify-between py-2 px-3 !text-white items-center flex-shrink-0">
          <h3>Barracks</h3>
          <a className="closeIcon" onClick={() => setSelectedItem(null)}>
            <CloseIcon />
          </a>
        </div>
        <div className=" flex flex-row justify-evenly flex-shrink-0 ">
            <div className="w-[30%] flex flex-col">
              <div className=" flex flex-row items-center font-semibold !text-white ">
                <ArmyCapacityIcon/><h3 className="ml-3"> Capacity:</h3><h3 className="ml-auto"><span className="lightBlue">40</span>/100 </h3></div>
              <CapacityProgressBar amount={50} />
            </div>
            <div className="w-[30%]" >
        
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-[80%] ml-auto mr-auto flex-grow pt-8">
        {warriors.map((warrior,key) => (
          <div key={key} className=" flex flex-col gap-1  !rounded-lg">
            <div className=" glassBg darkShadow blueText !font-normal text-center py-2 ">{warrior}</div>
            <div className=" flex flex-row relative h-full glassBg">
              <Image className="py-1 px-1 rounded-lg !h-[100%] w-auto" src={"/images/warriorTest.png"} width={100} height={150} alt="warrior" />
            <div className=" flex flex-col"></div>
            </div>
          </div>
        ))}
        </div>
        <div className=" flex-shrink flex flex-row justify-center gap-3 mb-2 mt-4">
          <button className="!w-[12.5rem] redButton">Reset</button>
          <button className="!w-[12.5rem] greenButton">Confirm</button>
        </div>
      </section>
    </>
  );
}
// ${!activeMode && "-bottom-[50rem]"} ${
//   selectedItem && selectedItem.name != "Barracks" && "-bottom-[50rem]"
// }
