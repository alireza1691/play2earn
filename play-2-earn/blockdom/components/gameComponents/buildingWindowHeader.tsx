"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import React from "react";
import CloseIcon from "@/svg/closeIcon";
import { useUserDataContext } from "@/context/user-data-context";

export default function BuildingWindowHeader() {
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();
  const { inViewLand} = useUserDataContext()

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
    }
  }
  return (
    <div className=" w-full p-2 flex flex-row justify-between flex-shrink-0">
      {" "}
      <h3 className="font-semibold">{selectedItem?.name}</h3>{" "}
      <h2 className=" font-bold">Level: {getLevel()}</h2>
      <a className="closeIcon" onClick={() => setSelectedItem(null)}>
        <CloseIcon />
      </a>{" "}
    </div>
  );
}
