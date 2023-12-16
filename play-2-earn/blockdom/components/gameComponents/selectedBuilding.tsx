"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import CloseIcon from "@/svg/closeIcon";
import DoubleArrow from "@/svg/doubleArrow";
import Image from "next/image";
import React from "react";
import BuildingWindowButtons from "./buildingWindowButtons";
import BuildingWindowDetails from "./buildingWindowDetails";
import BuildingWindowHeader from "./buildingWindowHeader";
import BuildingWindowImage from "./buildingWindowImage";
import UpgradeContainer from "./upgradeContainer";

export default function SelectedBuilding() {
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();

  return (
    <section
      className={`buildingWindow transition-all z-20 ${
        selectedItem === null && "!-left-[50rem]"
      }`}
    >
      <div className=" flex flex-col h-full justify-center items-center ">
        <div className="h-[7.5%] w-full">
          <BuildingWindowHeader />
        </div>
        <div className="h-[35%] w-full">
          <BuildingWindowImage />
        </div>
        <div className="h-[7.5%]">        <UpgradeContainer/></div>
      
        <div className="h-[30%] overflow-y-scroll custom-scrollbar warriorsGridBg rounded-md w-[80%] ml-auto mr-auto ">
          <BuildingWindowDetails />
        </div>
    
        <div className="h-[20%] w-full">
        <BuildingWindowButtons/>
        </div>
     
      </div>
    </section>
  );
}
