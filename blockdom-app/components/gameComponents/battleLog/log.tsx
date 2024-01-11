"use client"
import BlockchainUtilsContextProvider, { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useUserDataContext } from "@/context/user-data-context";
import { warriors, warriorsInfo } from "@/lib/data";
import { townMainnetPInst, townPInst } from "@/lib/instances";
import { DispatchedArmy } from "@/lib/types";
import CoinIcon from "@/svg/coinIcon";

import FoodIcon from "@/svg/foodIcon";
import OpenIcon from "@/svg/openIcon";
import WinIcon from "@/svg/winIcon";
import { BigNumber } from "ethers";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

type LogProps = {
  dispatchedArmy: DispatchedArmy,
  dispatchIndex: number
}
export default function Log({dispatchedArmy,dispatchIndex}:LogProps) {
  // const [dispatchedArmies, setDispatchedArmies] = useState<
  //   DispatchedArmy[] | null
  // >(null);
  const [remainedTime,setRemainedTime] = useState<number | null>(null)
  const { chosenLand } = useUserDataContext();
  const StatusConditions = ["Ongoing", "Attack", "Defense"] as const;
  const relevantButton = "Revenge";
  let logStatus = "Ongoing";
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");

  useEffect(() => {
    const getLogs = async () => {
      if (chosenLand) {

      try { 
        const townInstant = isTestnet ? townPInst : townMainnetPInst;
 
        const remainedTimeInMinutes = await townInstant.getRemainedDispatchTimestamp(Number(chosenLand.tokenId),dispatchIndex)
        setRemainedTime(Number(remainedTimeInMinutes))
      } catch (error) {
        console.log("Could not get dispatched armies");
      }
    }
    };
    getLogs();
  }, [chosenLand]);
  return (
    <div className="logBg  flex flex-row ">
      <div className=" flex flex-col w-full">
        <div className="flex flex-row px-3 w-full ">
          <h3 className=" items-center gap-2 text-[#98FBD7] flex flex-row text-[16px] font-light">
            <span className=" font-bold">Defender: </span> {dispatchedArmy && Number(dispatchedArmy.target)}
            <OpenIcon /> <span className="ml-3 font-semibold">Land:</span>{" "}
            {chosenLand && Number(chosenLand.tokenId)}
            <span className=" text-[12px] font-light ml-4">
              {" "}
              Time: 11/10/2023 22:30
            </span>
          </h3>
        </div>
        <div className=" flex flex-row  h-full flex-grow  items-center gap-6 ">
          <div className=" flex  w-[30%]  bg-white/10 p-1 rounded-md overflow-x-scroll custom-scrollbar">
            <div className="flex flex-row  h-full w-auto gap-2">
            {warriorsInfo.map((warrior, key) => (
              <div key={key} className='h-full w-max relative'>
                <h3 className="text-[14px] text-black absolute  w-full text-center bottom-0 balHighlight">{dispatchedArmy && Number(dispatchedArmy.amounts[key])}</h3>
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
          <div className=" flex  w-[30%] overflow-x-scroll bg-white/10 p-1 rounded-md custom-scrollbar">
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
      {logStatus == "Attack" && <AttackLogAction />}
      {logStatus == "Ongoing" && <OngoingLogAction dispatchedArmy={dispatchedArmy} dispatchIndex={dispatchIndex}/>}
      {logStatus == "Defense" && <DefenseLogAction />}
    </div>
  );
}

export const AttackLogAction = () => {
  return (
    <div className=" ml-auto  h-full flex flex-col md:flex-row gap-2 py-2 px-2">
      <div className=" flex flex-col gap-2 w-[182px]">
        <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
          {" "}
          <CoinIcon /> <p>12312</p>
        </div>
        <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
          <FoodIcon />
          <p>12312234</p>{" "}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-[182px]">
        <a className="logResultBg px-3 text-center py-3">You won</a>
        <a className="logResultBg px-3 text-center  py-3">You won</a>
      </div>
    </div>
  );
};
export const DefenseLogAction = () => {
  return (
    <div className=" ml-auto  h-full flex flex-col md:flex-row gap-2 py-2 px-2">
      <div className=" flex flex-col gap-2 w-[182px]">
        <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
          {" "}
          <CoinIcon /> <p>12312</p>
        </div>
        <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
          <FoodIcon />
          <p>12312234</p>{" "}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-[182px]">
        <a className="logResultBg px-3 text-center py-3">You won</a>
        <a className="logResultBg px-3 text-center  py-3">You won</a>
      </div>
    </div>
  );
};

type OngoingLogProps ={
  dispatchedArmy:DispatchedArmy | null
  dispatchIndex:number
} 
export const OngoingLogAction = ({dispatchedArmy,dispatchIndex}:OngoingLogProps) => {
  const [remainedTime,setRemainedTime] = useState<number >(0)
  const {dispatchedArmyAction} = useBlockchainUtilsContext()
  const { chosenLand } = useUserDataContext();
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");
  useEffect(() => {
    const getLogs = async () => {
    
      
      if (chosenLand && dispatchedArmy) {
        console.log("hello");
      try { 
        const townInstant = isTestnet ? townPInst : townMainnetPInst;
        const remainedTimeInMinutes = await townInstant.getRemainedDispatchTimestamp(Number(chosenLand.tokenId),dispatchIndex)
        setRemainedTime(Number(remainedTimeInMinutes));
        console.log("Remained time in minutes:",Number(remainedTimeInMinutes));
        
      } catch (error) {
        console.log("Could not get remained time ");
      }
    }
    };
    getLogs();
  }, [chosenLand]);
  return (
    <div className=" ml-auto  h-full flex flex-col md:flex-row gap-2 py-2 px-2">
      <div className=" flex flex-row gap-2 ">
        {/* <div className="w-[200px] h-full flex items-center justify-center  bg-[#06291D80]/50">
          <a className="  ml-auto mr-auto  px-3 text-center py-3">
            Army arrived at the enemy land
          </a>
        </div> */}
        <div className=" flex flex-col justify-around">
          {" "}
          <a className={`rounded-full bg-green-400/30 w-6 h-6 border border-white/20 `}></a>
          <a className={`rounded-full bg-white/10 w-6 h-6 border border-white/20 ${dispatchedArmy?.isReturning && " bg-green-400/30"}`}></a>
          <a className=" rounded-full bg-white/10 w-6 h-6 border border-white/20"></a>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full min-w-[8rem]">
        <a className=" bg-[#06291D80]/50 px-3 text-center py-3">{remainedTime > 0 ? `${Number(remainedTime)} min`  : "Ready"} </a>
        <button onClick={() => {dispatchedArmyAction(dispatchIndex, dispatchedArmy?.isReturning || false)}} disabled={Number(remainedTime) > 0 } className=" !rounded-md cursor-pointer greenButton !w-full px-3 text-center  py-3">
        {dispatchedArmy?.isReturning ?"Join" : "Attack"}
        </button>
      </div>
    </div>
  );
};
