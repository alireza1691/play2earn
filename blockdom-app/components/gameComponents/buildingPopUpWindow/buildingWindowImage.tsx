"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";

export default function BuildingWindowImage() {
  const [isImageSelected, setIsImageSelected] = useState(true);
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();
  const imageUrl = selectedItem?.imageUrl || "";
  return (
    <>
    
    <div onClick={() => setIsImageSelected(!isImageSelected)}  className={`${!isImageSelected && ""} buildigImageContainer cursor-pointer relative !h-[30%] !w-[80%] ml-auto mr-auto`}>
    {selectedItem  && isImageSelected && (
  <Image
          className="p-4 flex-shrink-0 top-0 !w-auto ml-auto mr-auto"
          src={imageUrl}
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
