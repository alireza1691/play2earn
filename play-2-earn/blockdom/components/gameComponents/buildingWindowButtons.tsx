import { useSelectedBuildingContext } from "@/context/selected-building-context";
import TopDuobleArrow from "@/svg/topDuobleArrow";
import React from "react";
import Image from "next/image";


export default function BuildingWindowButtons() {
  const { selectedItem, setSelectedItem } = useSelectedBuildingContext();

  const earnedAmount = 12340;
  return (
    <div className="w-full mt-auto flex flex-col justify-end h-full">
         {/* <div className=" mt-auto flex flex-row justify-evenly p-1 ">
    <div className=" flex flex-row items-center ">
      <Image
        src={"/svgs/icons/goldIcon.svg"}
        width={30}
        height={30}
        alt="goldIcon"
      />
      <h4>1000</h4>
    </div>
    <div className=" flex flex-row items-center">
      <Image
        src={"/svgs/icons/foodIcon.svg"}
        width={30}
        height={30}
        alt="foodIcon"
      />
      <h4>1200</h4>
    </div>
  </div> */}
      {selectedItem?.name == "Barracks"&&
      <div className=" flex flex-row p-2 gap-2">
        <button className="greenButton !py-2 !w-[70%]">Upgrade</button>
        <button className="outlineGreenButton !py-1 !w-[30%] flex justify-center hover:brightness-150"><TopDuobleArrow/></button>
        </div>
      }
      {/* <div className="w-full px-3">
        {" "}
        <button className="greenButton !w-full">Claim {earnedAmount}</button>
      </div>

      <div className=" flex flex-row p-3 gap-2">
        <button className="redButton !w-[50%]">Cancel</button>
        <button className="greenButton !w-[50%]">Upgrade</button>
      </div> */}
    </div>
  );
}
