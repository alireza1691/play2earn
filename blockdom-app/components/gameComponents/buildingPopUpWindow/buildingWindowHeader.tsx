"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import React from "react";
import CloseIcon from "@/svg/closeIcon";
import { useUserDataContext } from "@/context/user-data-context";

export default function BuildingWindowHeader() {
  const { selectedItem, setSelectedItem, setActiveMode, setUpgradeMode,activeMode,selectedResourceBuilding } = useSelectedBuildingContext();
  const { inViewLand} = useUserDataContext()

  const handleClose = () => {
    setSelectedItem(null)
    setActiveMode(false)
    setUpgradeMode(false)
  }

  const getLevel = () => {
    if (inViewLand) {
      if ( selectedItem?.name == "Barracks") {
        return (Number(inViewLand.barracksLvl))
      }
      if ( selectedItem?.name == "Townhall") {
        return (Number(inViewLand.townhallLvl))
      }
      if ( selectedItem?.name == "Wall") {
        return (Number(inViewLand.wallLvl))
      }
      if ( selectedItem?.name == "TrainingCamp") {
        return (Number(inViewLand.trainingCampLvl))
      }
      if (selectedItem?.name == "Farm"|| selectedItem?.name == "GoldMine" ) {
        if (selectedResourceBuilding) {
          return selectedResourceBuilding.level
        }
      }
    }
  }
  return (
    <div className=" w-full p-2 flex flex-row justify-between flex-shrink-0">
      {" "}
      <h3 className="font-semibold">{selectedItem?.name}</h3>{" "}
      {!activeMode &&   <h2 className=" absolute left-1/2 -translate-x-1/2 font-bold">Level: {getLevel()}</h2>}
      <a className="closeIcon" onClick={() => handleClose()}>
        <CloseIcon />
      </a>{" "}
    </div>
  );
}
