"use client";
import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townRead } from "@/lib/instances";
import {
  formattedNumber,
  getOwnerFromEvents,
  shortenAddress,
} from "@/lib/utils";
import GoldIcon from "@/svg/goldIcon";
import FoodIcon from "@/svg/foodIcon";
import WalletIcon from "@/svg/walletIcon";
import { useAddress } from "@thirdweb-dev/react";
import { formatEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import LandCard from "../landCard";
import WarriorsSliders from "./warriorsSliders";
import { useDeployment } from "@/lib/deployments";

type EnemyInfoType = {
  gold: string;
  food: string;
};

/**
 * The wide and phone layouts used to be declared inside AttackerComp's body and
 * rendered as <WideScreen />. A function declared during render is a new
 * component type on every render, so React unmounted and rebuilt both subtrees
 * each time — which is what reset the phone layout's `enteredCoordinate` to 0
 * whenever anything else on the screen changed, sending "Check" after land 0.
 * They are module-level components now, and read what they need from the same
 * contexts the parent does.
 */

/** Which of the wallet's lands the attack is launched from. */
function LandPicker({
  triggerClassName,
  listClassName,
}: {
  triggerClassName: string;
  listClassName: string;
}) {
  const { ownedLands, chosenLand, setChosenLand } = useUserDataContext();
  const [dropDown, setDropDown] = useState(false);

  return (
    <>
      <ul
        onClick={() => setDropDown(!dropDown)}
        className={`${
          dropDown ? " " : "bg-[#0D0F12]/85"
        } ${triggerClassName}`}
      >
        {chosenLand?.tokenId}
        {dropDown ? (
          <IoIosArrowUp className="  group-active:-translate-y-1" />
        ) : (
          <IoIosArrowDown className=" group-active:translate-y-1" />
        )}
      </ul>
      {dropDown && (
        <div className={listClassName}>
          {ownedLands &&
            ownedLands.map((land, key) => (
              <li
                key={key}
                onClick={() => {
                  setChosenLand(land), setDropDown(false);
                }}
                className=" text-white cursor-pointer px-3 py-2 hover:bg-green-100/10 rounded-[4px]"
              >
                {Number(land.tokenId)}
              </li>
            ))}
        </div>
      )}
    </>
  );
}

const pickerTrigger =
  "transition-all active:opacity-60 ring-gray-600 group  cursor-pointer flex flex-row justify-between items-center bg-[#0D0F12]/85 text-[color:var(--pw-accent)] font-medium text-[16px] w-full px-6 py-3 backdrop-blur-sm";

function WideScreen() {
  const { chosenLand } = useUserDataContext();

  return (
    <>
      <div className="relative hidden lg:flex flex-col gap-3 items-center w-full px-4 lg:px-1 lg:w-[35%] max-w-[22.5rem] pb-[3rem] ">
        <div className="flex flex-col  max-h-[20rem] w-auto relative">
          <LandCard tokenId={Number(chosenLand?.tokenId)} />
          <div className=" bottom-0 absolute w-full ">
            <LandPicker
              triggerClassName={`${pickerTrigger} rounded-b-[0.5rem]`}
              listClassName="z-10 max-h-[340px] overflow-y-scroll custom-scrollbar  absolute w-full mt-2 bg-gradient-to-r from-[#34594B] to-[#213830] rounded-[4px] border border-[#D4D4D4]/20"
            />
          </div>
        </div>

        <WarriorsSliders />
      </div>
    </>
  );
}

function PhoneScreen({
  isValidLand,
  setIsValidLand,
  info,
}: {
  isValidLand: boolean | null;
  setIsValidLand: React.Dispatch<React.SetStateAction<boolean | null>>;
  info: EnemyInfoType | null | undefined;
}) {
  const { selectedLand, setSelectedLand } = useMapContext();
  const { mintedLands } = useApiData();
  const [enteredCoordinate, setEnteredCoordinate] = useState(0);

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
    <div className="relative lg:hidden flex flex-col gap-3 items-center px-4  w-full">
      <div className=" w-full justify-center">
        <h2 className="darkGreenBg blueText p-2 w-full text-center">
          Target land
        </h2>
      </div>
      <div className=" flex flex-row  gap-3 w-full justify-around">
        <div className="bg-[#0D0F12]/85  w-full  rounded-[4px] border border-[color:var(--pw-accent)]/70 flex flex-col">
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
                className=" focus:outline-0  py-1 px-2 w-full rounded-l-lg bg-black/20 border border-[color:var(--pw-accent)]/30 text-[12px]"
                placeholder="Enter token ID (Coordinate)..."
              ></input>
              <button
                onClick={() => handleCheck()}
                className="p-1 hover:bg-[color:var(--pw-accent)]/20 text-[12px] bg-[color:var(--pw-accent)]/10 rounded-r-lg border border-[color:var(--pw-accent)]/30"
              >
                Check
              </button>
            </div>
          </div>
        </div>

        {/*
          The same card, at the width this panel has room for. It used to draw
          the artwork itself, which meant the Plotwar brand LandCard overlays
          would have been missing here.
        */}
        {selectedLand && (
          <LandCard
            tokenId={selectedLand.coordinate}
            imageClassName="w-[6rem] h-auto"
            className="p-1"
            idClassName="text-[8px] right-[17%] top-[6%]"
          />
        )}
      </div>
      <div className=" flex flex-row w-full gap-3">
        <div className="flex flex-row blueText !text-[14px] justify-evenly  balBg items-center px-2 py-1 gap-3 w-1/2">
          <GoldIcon />
          <p>{info?.gold}</p>
        </div>
        <div className="flex flex-row blueText !text-[14px] justify-evenly  balBg items-center px-2 py-1 gap-3 w-1/2">
          <FoodIcon />
          <p>{ info?.food}</p>
        </div>
      </div>
      <div className=" w-full justify-center">
        <h2 className="darkGreenBg blueText p-2 w-full text-center">
          Your land
        </h2>
      </div>
      <div className=" flex flex-row gap-3 w-full">
      <div className="w-[50%] ml-auto mr-auto flex flex-col">
        <h3 className=" p-1 ml-1 !text-white/60">Select your army:</h3>
        <WarriorsSliders/>
      </div>
      <div className="w-[50%] flex flex-col">
      <h3 className=" p-1 ml-1 !text-white/60">Select your land:</h3>
      <div className=" w-full relative">
            <LandPicker
              triggerClassName={`${pickerTrigger} rounded-[0.5rem] border border-[color:var(--pw-accent)]/50`}
              listClassName="z-10  max-h-[380px] overflow-y-scroll custom-scrollbar absolute w-full mt-2 bg-gradient-to-r from-[#34594B] to-[#213830] rounded-[4px] border border-[#D4D4D4]/20"
            />
          </div>
      </div>
      </div>

    </div>
  );
}

export default function AttackerComp() {
  const [isValidLand, setIsValidLand] = useState<boolean | null>(null);
  const [info, setInfo] = useState<EnemyInfoType | null>();

  const { chosenLand } = useUserDataContext();
  const { selectedLand } = useMapContext();
  const deployment = useDeployment();

  useEffect(() => {
    const getCurrentState = async () => {
      if (selectedLand) {
        if (selectedLand.isMinted) {
          setIsValidLand(true);
        }
        try {
          const landData = await townRead(deployment).getLandIdData(
            selectedLand.coordinate
          );
          const goods = landData.goodsBalance;

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
  }, [chosenLand, selectedLand, deployment]);

  return (
    <>
      <WideScreen />
      <PhoneScreen
        isValidLand={isValidLand}
        setIsValidLand={setIsValidLand}
        info={info}
      />
    </>
  );
}
