import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";

// type buildingWindowImageProps = {
//     imageUrl: string
// }
type BuildingWindowImageProps = {
  imageUrl?: string;
};

export default function BuildingWindowImage() {
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();
  const imageUrl = selectedItem?.imageUrl || "";
  return (
    <div className=" relative px-8 shadow-large rounded-lg w-[20rem] h-[15rem] bg-gradient-to-tr from-[#FFFFFF]/10 via-[#FFFFFF]/40 to-[#FFFFFF]/20">
      <Image className="p-4" src={imageUrl} fill alt="selectedItemImage" />
    </div>
  );
}
