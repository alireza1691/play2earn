"use client";
import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townPInst } from "@/lib/instances";
import {
  formattedNumber,
  getOwnerFromEvents,
  shortenAddress,
  tokenIdAsString,
} from "@/lib/utils";
import CoinIcon from "@/svg/coinIcon";
import FoodIcon from "@/svg/foodIcon";
import WalletIcon from "@/svg/walletIcon";
import { useAddress } from "@thirdweb-dev/react";
import { formatEther } from "ethers/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import LandCard from "../landCard";
import WarriorsSliders from "./warriorsSliders";

export default function AttackerComp() {
  const [dropDown, setDropDown] = useState<boolean>(false);
  const [isValidLand, setIsValidLand] = useState<boolean | null>(null);
  const [info, setInfo] = useState<EnemyInfoType | null>();

  type EnemyInfoType = {
    gold: string;
    food: string;
  };

  // const [isValidLand,setIsValidLand] = useState<boolean | null>(null)
  // const [enteredCoordinate,setEnteredCoordinate] = useState(0)
  const {
    ownedLands,
    inViewLand,
    chosenLand,
    setChosenLand,
    setIsUserDataLoading,
  } = useUserDataContext();
  const { selectedLand, setSelectedLand } = useMapContext();
  const { mintedLands } = useApiData();
  const address = useAddress();

  useEffect(() => {
    const getCurrentState = async () => {
      if (selectedLand) {
        if (selectedLand.isMinted) {
          setIsValidLand(true);
        }
        try {
          const landData = await townPInst.getLandIdData(
            selectedLand.coordinate
          );
          const goods = landData.goodsBalance;
          //  const army = await townPInst.getArmy(selectedLand.coordinate)

          const infoObj = {
            gold: formattedNumber(goods[1]),
            food: formattedNumber(goods[0]),
          };
          setInfo(infoObj);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getCurrentState();
  }, [chosenLand, selectedLand]);

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
    const [enteredCoordinate, setEnteredCoordinate] = useState(0);

    const isMinted = (enteredTokenId: number) => {
      return (
        mintedLands?.some((obj) => obj.tokenId === enteredTokenId.toString()) ||
        false
      );
    };

    const handleCheck = () => {
      let isMinted = false;
      if (mintedLands) {
        isMinted = mintedLands.some(
          (obj) => obj.tokenId === enteredCoordinate.toString()
        );
        if (isMinted) {
          setIsValidLand(true);
          const selectedLand = {
            coordinate: enteredCoordinate,
            isMinted: true,
            owner: getOwnerFromEvents(enteredCoordinate, mintedLands),
          };
          setSelectedLand(selectedLand);
        } else {
          setIsValidLand(false);
          setSelectedLand(null);
        }
      }
      return isMinted;
    };

    return (
      <div className="relative md:hidden flex flex-col gap-3 items-center px-4  w-full">
        <div className=" w-full justify-center">
          <h2 className="darkGreenBg blueText p-2 w-full text-center">
            Target land
          </h2>
        </div>
        <div className=" flex flex-row  gap-3 w-full justify-around">
          <div className="bg-[#06291D80]/50  w-full  rounded-lg border border-[#98FBD7]/70 flex flex-col">
            <div className="p-2 text-center justify-center w-full flex flex-row items-center">
              <h1>
                <small>Land:</small>{" "}
                {selectedLand ? selectedLand.coordinate : "not selected"}
              </h1>
            </div>
            <div className=" flex flex-row items-center gap-3 ml-3">
              {isValidLand && <WalletIcon />}

              <p className=" blueText !text-[14px] !font-normal">
                {isValidLand ? (
                  <>
                    {" "}
                    Owner:{" "}
                    {selectedLand &&
                      mintedLands &&
                      shortenAddress(
                        getOwnerFromEvents(selectedLand.coordinate, mintedLands)
                      )}
                  </>
                ) : (
                  "Select a valid land"
                )}
              </p>
            </div>
            <div className=" mx-3 mt-2  flex flex-col">
              <label className="text-[10px] opacity-70 font-light">
                To choose new target enter token ID below
              </label>
              <div className=" flex flex-row">
                <input
                  type="number"
                  onChange={(event) =>
                    setEnteredCoordinate(Number(event.target.value))
                  }
                  className=" focus:outline-0  py-1 px-2 w-full rounded-l-lg bg-black/20 border border-[#98FBD7]/30 text-[12px]"
                  placeholder="Enter token ID (Coordinate)..."
                ></input>
                <button
                  onClick={() => handleCheck()}
                  className="p-1 hover:bg-[#98FBD7]/20 text-[12px] bg-[#98FBD7]/10 rounded-r-lg border border-[#98FBD7]/30"
                >
                  Check
                </button>
              </div>
            </div>
          </div>

          {selectedLand && (
            <div className="relative  flex flex-shrink h-fit w-fit glassBg p-1">
              <h3 className=" text-[8px] text-[#98FBD7] absolute right-[17%] top-[6%]">
                {tokenIdAsString(selectedLand.coordinate)}
              </h3>
              <Image
                className="h-auto w-[6rem] "
                src={"/cards/landCardBlankNumber.png"}
                width={240}
                height={360}
                alt="card"
              />
            </div>
          )}
        </div>
        <div className=" flex flex-row w-full gap-3">
          <div className="flex flex-row blueText !text-[14px] justify-evenly  balBg items-center px-2 py-1 gap-3 w-1/2">
            <CoinIcon />
            <p>{info?.gold}</p>
          </div>
          <div className="flex flex-row blueText !text-[14px] justify-evenly  balBg items-center px-2 py-1 gap-3 w-1/2">
            <FoodIcon />
            <p>{ info?.food}</p>
          </div>
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
