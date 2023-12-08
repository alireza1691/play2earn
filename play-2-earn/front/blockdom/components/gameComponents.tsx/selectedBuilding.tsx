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
    <section className={`buildingWindow transition-all  ${selectedItem === null && "!-left-[50rem]"}`}>
      <div className=" flex flex-col h-full justify-center items-center">
        <BuildingWindowHeader />
        <BuildingWindowImage />
        <UpgradeContainer/>
        <BuildingWindowDetails/>
        <BuildingWindowButtons/>
      </div>
    </section>
  );
}
