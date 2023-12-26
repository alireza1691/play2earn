"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";

import React from "react";
import BuildingWindowButtons from "./buildingPopUpWindow/buildingWindowButtons";
import BuildingWindowDetails from "./buildingPopUpWindow/buildingWindowDetails";
import BuildingWindowHeader from "./buildingPopUpWindow/buildingWindowHeader";
import BuildingWindowImage from "./buildingPopUpWindow/buildingWindowImage";

import SelectedBuildingActive from "./buildingPopUpWindow/selectedBuildingActive";

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
        } transition-all !flex-shrink-0 flex flex-col buildingWindow`}
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
