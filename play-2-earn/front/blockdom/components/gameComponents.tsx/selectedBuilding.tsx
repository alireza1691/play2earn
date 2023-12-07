"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import CloseIcon from "@/svg/closeIcon";
import DoubleArrow from "@/svg/doubleArrow";
import Image from "next/image";
import React from "react";
import BuildingWindowHeader from "./buildingWindowHeader";
import BuildingWindowImage from "./buildingWindowImage";

export default function SelectedBuilding() {
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();
  const currentLvl = 2;

  return (
    <section className="buildingWindow">
      <div className=" flex flex-col h-full justify-center items-center">
        <BuildingWindowHeader />
        <BuildingWindowImage />
        <div className="z-10 flex flex-row mt-3 gap-8">
          <h3 className=" font-semibold">Level {currentLvl}</h3>
          <DoubleArrow />
          <h3 className=" font-semibold">Level {currentLvl + 1}</h3>
        </div>
        <div className="w-full mt-auto flex flex-row p-3 gap-2">
          <button className="redButton !w-[50%]">Cancel</button>
          <button className="greenButton !w-[50%]">Upgrade</button>
        </div>
      </div>
    </section>
  );
}
