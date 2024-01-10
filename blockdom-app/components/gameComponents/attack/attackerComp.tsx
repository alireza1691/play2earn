import { useUserDataContext } from "@/context/user-data-context";
import { MintedLand } from "@/lib/types";
import Image from "next/image";
import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import LandCard from "../landCard";
import WarriorsSliders from "./warriorsSliders";

export default function AttackerComp() {
  const [dropDown, setDropDown] = useState<boolean>(false);
  const {
    ownedLands,
    inViewLand,
    chosenLand,
    setChosenLand,
    setIsUserDataLoading,
  } = useUserDataContext();
  // const [selectedLand, setSelectedLand] = useState<number | null>(ownedLands && Number(ownedLands[0].tokenId));

  return (
    <div className="relative flex flex-col gap-3 items-center w-full px-4 md:px-1 md:w-[35%] max-w-[22.5rem]">
      {/* <div className=" flex-shrink flex relative h-[45%]  w-auto mb-6 md:mb-10 object-fill">
      <Image
        className="h-full w-full  "
        src={"/cards/LandCard.png"}
        height={364}
        width={256}
        alt="card"
      />
      
      <div className=" bottom-0 absolute w-full ">
        <ul
          onClick={() => setDropDown(!dropDown)}
          className={`${
            dropDown ? " " : "bg-[#06291D]/50"
          } transition-all active:opacity-60 ring-gray-600 group  cursor-pointer flex flex-row justify-between items-center bg-[#06291D]/50 text-[#98FBD7] font-medium text-[16px] w-full px-6 py-3 rounded-b-[1.02rem] backdrop-blur-sm`}
        >
          {chosenLand?.tokenId}
          {dropDown ? (
            <IoIosArrowUp className="  group-active:-translate-y-1" />
          ) : (
            <IoIosArrowDown className=" group-active:translate-y-1" />
          )}
        </ul>
        {dropDown && (
          <div className="z-10   absolute w-[225px] mt-2 bg-gradient-to-r from-[#34594B] to-[#213830] rounded-lg border border-[#D4D4D4]/20">
            {ownedLands && ownedLands.map((land, key) => (
              <li
                key={key}
                onClick={() => {
                  setChosenLand(land), setDropDown(false);
                }}
                className=" text-white cursor-pointer px-3 py-2 hover:bg-green-100/10 rounded-lg"
              >
                {Number(land.tokenId)}
              </li>
            ))}
          </div>
        )}
      </div>
    </div> */}
      <div className=" max-w-[72%]  relative">
        <LandCard tokenId={Number(chosenLand?.tokenId)} />
        <div className=" bottom-0 absolute w-full ">
          <ul
            onClick={() => setDropDown(!dropDown)}
            className={`${
              dropDown ? " " : "bg-[#06291D]/50"
            } transition-all active:opacity-60 ring-gray-600 group  cursor-pointer flex flex-row justify-between items-center bg-[#06291D]/50 text-[#98FBD7] font-medium text-[16px] w-full px-6 py-3 rounded-b-[0.5rem] backdrop-blur-sm`}
          >
            {chosenLand?.tokenId}
            {dropDown ? (
              <IoIosArrowUp className="  group-active:-translate-y-1" />
            ) : (
              <IoIosArrowDown className=" group-active:translate-y-1" />
            )}
          </ul>
          {dropDown && (
            <div className="z-10   absolute w-full mt-2 bg-gradient-to-r from-[#34594B] to-[#213830] rounded-lg border border-[#D4D4D4]/20">
              {ownedLands &&
                ownedLands.map((land, key) => (
                  <li
                    key={key}
                    onClick={() => {
                      setChosenLand(land), setDropDown(false);
                    }}
                    className=" text-white cursor-pointer px-3 py-2 hover:bg-green-100/10 rounded-lg"
                  >
                    {Number(land.tokenId)}
                  </li>
                ))}
            </div>
          )}
        </div>
      </div>
    
      <WarriorsSliders />

   
    </div>
  );
}
