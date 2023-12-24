"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import React from "react";
import CloseIcon from "@/svg/closeIcon";

export default function BuildingWindowHeader() {
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();
  return (
    <div className=" w-full p-2 flex flex-row justify-between flex-shrink-0">
      {" "}
      <h3 className="font-semibold">{selectedItem?.name}</h3>{" "}
      <h2 className=" font-bold">Level: {selectedItem?.level}</h2>
      <a className="closeIcon" onClick={() => setSelectedItem(null)}>
        <CloseIcon />
      </a>{" "}
    </div>
  );
}
