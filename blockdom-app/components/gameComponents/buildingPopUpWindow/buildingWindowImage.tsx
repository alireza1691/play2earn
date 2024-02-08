"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { barracksImage, farmImage,  goldMineImage, townHallImage, trainingCampImage, wallImage } from "@/lib/utils";

export default function BuildingWindowImage() {
  const [isImageSelected, setIsImageSelected] = useState(true);
  const { selectedItem, setSelectedItem ,selectedResourceBuilding,upgradeMode}  = useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();

  const getImage = () =>{
    if (selectedItem?.name == "Barracks") {
      const level = Number((inViewLand?.barracksLvl || 0))
      return barracksImage( upgradeMode ? level+1 : level)
    }
    if (selectedItem?.name == "Townhall") {
      const level = Number(inViewLand?.townhallLvl || 0)
      return townHallImage(upgradeMode ? level+1 : level)
    }
    if (selectedItem?.name ==  "TrainingCamp") {
      const level = Number(inViewLand?.trainingCampLvl || 0)
      return trainingCampImage(upgradeMode ? level+1 : level)
    }
    if (selectedItem?.name == "Wall") {
      const level = Number(inViewLand?.wallLvl || 0)
      return wallImage(upgradeMode ? level+1 : level)
    }
    if (selectedItem?.name == "Farm") {
      const level = Number(selectedResourceBuilding?.level || 0)
      return farmImage(upgradeMode ? level+1 : level)
    }
    // (selectedItem?.name == "GoldMine")
    else  {
      const level = Number(selectedResourceBuilding?.level || 0)
      return goldMineImage(upgradeMode ? level+1 : level)
    }
  }
  return (
    <>
    
    <div onClick={() => setIsImageSelected(!isImageSelected)}  className={`${!isImageSelected && ""}\ buildigImageContainer cursor-pointer relative !h-[25%]  sm:!h-[30%] !w-[80%] ml-auto mr-auto`}>
    {selectedItem  && isImageSelected && (
  <Image
          className="p-4 flex-shrink-0 top-0 !w-auto !h-full  object-contain ml-auto mr-auto mt-auto mb-auto"
          src={getImage()}
          fill
          alt="selectedItemImage"
        />
    )}
    {selectedItem  && !isImageSelected && (
        <p className=" !text-white px-4 mb-auto py-3 text-[14px] !text-justify">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente
        dolor fugiat suscipit tenetur at eaque eligendi. Sit magnam quam quo
        eos, temporibus rem eius tempore, esse cupiditate animi facere
        explicabo?
      </p>
      )}
  
 
  </div>
</>
  );
}
