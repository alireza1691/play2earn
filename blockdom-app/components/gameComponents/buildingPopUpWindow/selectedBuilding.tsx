"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";

import React from "react";
import BuildingWindowButtons from "./buildingWindowButtons";
import BuildingWindowDetails from "./buildingWindowDetails";
import BuildingWindowHeader from "./buildingWindowHeader";
import BuildingWindowImage from "./buildingWindowImage";

import SelectedBuildingActive from "./selectedBuildingActive";

export default function SelectedBuilding() {
  const {
    selectedItem,
    activeMode,
  } = useSelectedBuildingContext();

  return (
    <>
      <section
        className={`${selectedItem == null && "!-left-[50rem]"} ${
          selectedItem &&
          activeMode &&
          "!-left-[50rem]"
        } !z-30 transition-all !flex-shrink-0 flex flex-col buildingWindow`}
      >
        <BuildingWindowHeader />
        <BuildingWindowImage />

        <BuildingWindowDetails />

        <BuildingWindowButtons />
      </section>
        <SelectedBuildingActive/>
    </>
  );

}
