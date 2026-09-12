"use client";
import BlockchainUtilsContextProvider, {
  useBlockchainUtilsContext,
} from "@/context/blockchain-utils-context";
import { useUserDataContext } from "@/context/user-data-context";
import { warriors, warriorsInfo } from "@/lib/data";
import { townMainnetPInst, townPInst, townRead } from "@/lib/instances";
import { DispatchedArmy } from "@/lib/types";
import GoldIcon from "@/svg/goldIcon";

import FoodIcon from "@/svg/foodIcon";
import OpenIcon from "@/svg/openIcon";
import WinIcon from "@/svg/winIcon";
import { BigNumber } from "ethers";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDeployment } from "@/lib/deployments";
import AttackProgress from "./attackProgress";
import { formatEther } from "ethers/lib/utils";

type LogProps = {
  dispatchedArmy: DispatchedArmy;
  dispatchIndex: number;
};
export default function OngoingLog({
  dispatchedArmy,
  dispatchIndex,
}: LogProps) {
  // const [dispatchedArmies, setDispatchedArmies] = useState<
  //   DispatchedArmy[] | null
  // >(null);
  const [remainedTime, setRemainedTime] = useState<number | null>(null);
  const { chosenLand } = useUserDataContext();
  const StatusConditions = ["Ongoing", "Attack", "Defense"] as const;
  const relevantButton = "Revenge";
  let logStatus = "Ongoing";
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");
  const deployment = useDeployment();

  useEffect(() => {
    const getLogs = async () => {
      if (chosenLand) {
        try {
          const townInstant = townRead(deployment);

          const remainedTimeInMinutes =
            await townInstant.getRemainedDispatchTimestamp(
              Number(chosenLand.tokenId),
              dispatchIndex
            );
          setRemainedTime(Number(remainedTimeInMinutes));
        } catch (error) {
          console.log("Could not get dispatched armies");
        }
      }
    };
    getLogs();
  }, [chosenLand]);
  return (
    <div className="logBg flex flex-col"
    >
    <div className="  flex flex-col md:flex-row ">
      <div className=" flex flex-col md:max-w-[60%] ">
        <div className="flex flex-col md:flex-row px-3  items-center gap-2 ">
          <h3 className="mt-3 md:mt-0 md:items-center gap-2 text-[color:var(--pw-accent)] flex flex-row text-[16px] font-light">
            <span className=" font-bold">Defender: </span>{" "}
            {dispatchedArmy && Number(dispatchedArmy.target)}
            <OpenIcon />{" "}
          </h3>
          <h3 className=" md:items-center gap-2 text-[color:var(--pw-accent)] flex flex-row text-[16px] font-light">
            <span className="ml-3 font-semibold">Land:</span>
            {chosenLand && Number(chosenLand.tokenId)}
          </h3>
          {/* <h3 className=" text-[12px] font-light ml-4 mb-3 md:mb-0">
            Time: 11/10/2023 22:30
          </h3> */}
        </div>
        <div className="px-3 md:px-0 flex md:flex-row flex-col  h-full justify-around items-center gap-6 w-full">
          <div className=" flex w-full  md:w-[42.5%]  bg-white/10 p-1 rounded-[4px] overflow-x-scroll custom-scrollbar">
            <div className="flex flex-row  h-full w-auto gap-2">
              {warriorsInfo.map((warrior, key) => (
                <div key={key} className="h-full w-max relative">
                  <h3 className="text-[14px] text-black absolute  w-full text-center bottom-0 balHighlight">
                    {dispatchedArmy && Number(dispatchedArmy.amounts[key])}
                  </h3>
                  <Image
                    src={warrior.image}
                    className=" glassBg p-[2px] h-full w-auto"
                    width={40}
                    height={60}
                    alt="warrior"
                  />
                </div>
              ))}
            </div>
          </div>
          <WinIcon />
          <div className=" flex  w-full  md:w-[42.5%] overflow-x-scroll bg-white/10 p-1 rounded-[4px] custom-scrollbar">
            <div className="flex flex-row  h-full w-auto gap-2">
              {warriorsInfo.map((warrior, key) => (
                <React.Fragment key={key}>
                  <Image
                    src={warrior.image}
                    className="glassBg p-[2px] h-full w-auto"
                    width={40}
                    height={20}
                    alt="warrior"
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* {logStatus == "Attack" && <AttackLogAction />} */}
      {logStatus == "Ongoing" && (
        <OngoingLogAction
          dispatchedArmy={dispatchedArmy}
          dispatchIndex={dispatchIndex}
        />
      )}
      {/* {logStatus == "Defense" && <DefenseLogAction />} */}
    </div>
    {/* The trip has four steps and the countdown alone does not say which one
        this is, so the phases are named. */}
    <AttackProgress
      isReturning={Boolean(dispatchedArmy?.isReturning)}
      minutesLeft={remainedTime ?? 0}
    />

    {/* Loot only exists once the battle has happened. Before that this row used
        to show a hardcoded figure, which read as "this is what you will take"
        for an army that had not fought anything yet. */}
    {dispatchedArmy?.isReturning ? (
      <div className="flex flex-row py-3 px-3 gap-3 rounded-b-lg items-center flex-wrap">
        <h3 className="blueText mr-4">Carrying home:</h3>
        <h3 className="balBg flex flex-row items-center px-3 gap-3">
          <GoldIcon />
          {Number(formatEther(dispatchedArmy.lootedAmounts[1] ?? 0))}
        </h3>
        <h3 className="balBg flex flex-row items-center px-3 gap-3">
          <FoodIcon />
          {Number(formatEther(dispatchedArmy.lootedAmounts[0] ?? 0))}
        </h3>
      </div>
    ) : (
      <div className="flex flex-row py-3 px-3 gap-3 rounded-b-lg items-center">
        <h3 className="text-[12px] text-white/50">
          Nothing looted yet — this army has not fought.
        </h3>
      </div>
    )}
    </div>
  );
}

type OngoingLogProps = {
  dispatchedArmy: DispatchedArmy | null;
  dispatchIndex: number;
};
export const OngoingLogAction = ({
  dispatchedArmy,
  dispatchIndex,
}: OngoingLogProps) => {
  const [remainedTime, setRemainedTime] = useState<number>(0);
  const { dispatchedArmyAction, retreatArmy } = useBlockchainUtilsContext();
  const { chosenLand } = useUserDataContext();
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");
  const deployment = useDeployment();
  useEffect(() => {
    const getLogs = async () => {
      if (chosenLand && dispatchedArmy) {
        console.log("hello");
        try {
          const townInstant = townRead(deployment);
          const remainedTimeInMinutes =
            await townInstant.getRemainedDispatchTimestamp(
              Number(chosenLand.tokenId),
              dispatchIndex
            );
          setRemainedTime(Number(remainedTimeInMinutes));
          console.log(
            "Remained time in minutes:",
            Number(remainedTimeInMinutes)
          );
        } catch (error) {
          console.log("Could not get remained time ");
        }
      }
    };
    getLogs();
  }, [chosenLand]);
  return (
    <div
      className={`${
        dispatchedArmy?.isReturning == true && ""
      } ml-auto h-full flex flex-col md:flex-row gap-2 py-2 px-2 w-full md:w-auto`}
    >
      <div className=" flex flex-row gap-2 ">
        {/* <div className="w-[200px] h-full flex items-center justify-center  bg-[#0D0F12]/85">
          <a className="  ml-auto mr-auto  px-3 text-center py-3">
            Army arrived at the enemy land
          </a>
        </div> */}
        <div className=" flex flex-row md:flex-col justify-around w-full md:w-auto my-3 md:my-0 ">
          {" "}
          <a
            className={`rounded-full bg-[color:var(--pw-accent)]/30 w-6 h-6 border border-white/20 `}
          ></a>
          <a
            className={`rounded-full bg-white/10 w-6 h-6 border border-white/20 ${
              dispatchedArmy?.isReturning && " !bg-green-400/30"
            }`}
          ></a>
          <a className=" rounded-full bg-white/10 w-6 h-6 border border-white/20"></a>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full min-w-[8rem] justify-around">
        <a className=" bg-[#0D0F12]/85 px-3 text-center py-3">
          {remainedTime > 0 ? `${Number(remainedTime)} min` : "Ready"}{" "}
        </a>
        <button
          onClick={() => {
            dispatchedArmyAction(
              dispatchIndex,
              dispatchedArmy?.isReturning || false
            );
          }}
          disabled={Number(remainedTime) > 0}
          className=" !rounded-[4px] cursor-pointer greenButton !w-full px-3 text-center  py-3"
        >
          {dispatchedArmy?.isReturning ? "Join" : "Attack"}
        </button>

        {/* An army that has not turned around can still be called back. Unlike
            Attack this is not gated on the countdown — the whole point is to
            change your mind mid-march, and the sooner you do the shorter the
            walk home. */}
        {!dispatchedArmy?.isReturning && (
          <button
            onClick={() => retreatArmy(dispatchIndex)}
            title={`Turn back now. Costs ${
              5 * Number(dispatchedArmy?.totalArmyAmount ?? 0)
            } gold, and the march home is however far they have already come.`}
            className="!rounded-[4px] cursor-pointer !w-full px-3 text-center py-2 text-[12px] text-white/70 bg-white/10 hover:bg-white/20 hover:text-white transition-colors"
          >
            Retreat
          </button>
        )}
      </div>
    </div>
  );
};
