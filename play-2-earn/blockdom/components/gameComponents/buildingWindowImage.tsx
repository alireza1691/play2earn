"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";

export default function BuildingWindowImage() {
  const [isImageSelected, setIsImageSelected] = useState(true);
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();
  const imageUrl = selectedItem?.imageUrl || "";
  return (
    <div onClick={() => setIsImageSelected(!isImageSelected)} className={`${!isImageSelected && " overflow-y-scroll custom-scrollbar py-4"} cursor-pointer relative px-8 shadow-large rounded-lg !w-[80%] !h-full ml-auto mr-auto  bg-gradient-to-tr from-[#FFFFFF]/10 via-[#FFFFFF]/40 to-[#FFFFFF]/20 hover:from-[#FFFFFF]/20 hover:via-[#FFFFFF]/50 hover:to-[#FFFFFF]/30`}  >
      {selectedItem !== null && isImageSelected && (

        <Image
          className="p-4 top-0 h-[30%] w-auto"
          src={imageUrl}
          fill
          alt="selectedItemImage"
        />
      )}
      {" "}
      {selectedItem !== null && !isImageSelected && (
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente
          dolor fugiat suscipit tenetur at eaque eligendi. Sit magnam quam quo
          eos, temporibus rem eius tempore, esse cupiditate animi facere
          explicabo?
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente
          dolor fugiat suscipit tenetur at eaque eligendi. Sit magnam quam quo
          eos, temporibus rem eius tempore, esse cupiditate animi facere
          explicabo?
        </p>
      )}
    </div>
  );
}