import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import { MintedLand } from "@/lib/types";
import {
  getOwnerFromEvents,
  shortenAddress,
  tokenIdAsString,
} from "@/lib/utils";
import WalletIcon from "@/svg/walletIcon";
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
  const { selectedLand } = useMapContext();
  const { mintedLands } = useApiData();

  const WideScreen = () => {
    return (
      <>
        <div className="relative hidden md:flex flex-col gap-3 items-center w-full px-4 md:px-1 md:w-[35%] max-w-[22.5rem] pb-[3rem] ">
          <div className="flex flex-col  max-h-[20rem] w-auto relative">
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
      </>
    );
  };
  const PhoneScreen = () => {
    return (
      <div className="relative md:hidden flex flex-col gap-3 items-center px-4  ">
        <div className=" flex flex-row w-full gap-3 justify-around">
          <div className="bg-[#06291D80]/50 w-fit  rounded-lg border border-[#98FBD7]/70 flex flex-col">
            <div className="p-2 text-center justify-center w-full flex flex-row items-center"><h1>Land:<small>{selectedLand?.coordinate}</small></h1></div>
            <div className=" flex flex-row items-center gap-3 p-3">
              <WalletIcon />
              <p className=" blueText !text-[14px] !font-normal">
                Owner:{" "}
                {selectedLand &&
                  mintedLands &&
                  shortenAddress(
                    getOwnerFromEvents(selectedLand.coordinate, mintedLands)
                  )}
              </p>
            </div>
          </div>

          {selectedLand && (
            <div className="relative  flex flex-shrink h-fit w-fit glassBg p-1">
              <h3 className=" text-[10px] text-[#98FBD7] absolute right-[17%] top-[5%]">
                {tokenIdAsString(selectedLand.coordinate)}
              </h3>
              <Image
                className="h-auto w-[5rem] "
                src={"/cards/landCardBlankNumber.png"}
                width={240}
                height={360}
                alt="card"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <WideScreen />
      <PhoneScreen />
    </>
  );
}
