import { useSelectedBuildingContext } from "@/context/selected-building-context";
import TopDuobleArrow from "@/svg/topDuobleArrow";
import React from "react";

export default function BuildingWindowButtons() {
  const { selectedItem,  setUpgradeMode, setActiveMode } = useSelectedBuildingContext();

  const relevantButton = () =>{
    if (   selectedItem?.name == "Townhall") {
      return "Approve"
    }
    if (   selectedItem?.name == "Barracks") {
      return "Train army"
    }
    if (   selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm") {
      return "Claim resources"
    }
    if (   selectedItem?.name == "Wall") {
      return "Approve"
    }
 
  }


  return (
    <div className="flex justify-between gap-2 p-2  flex-shrink-0 ">
      <button onClick={() => setActiveMode(true) } className="greenButton !py-2 !w-[70%]">{relevantButton()}</button>
      <button onClick={() => setUpgradeMode(true) } className="outlineGreenButton !py-1 !w-[30%] flex justify-center hover:brightness-150">
        <TopDuobleArrow />
      </button>
    </div>
  );
}
