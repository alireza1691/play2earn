import { warriors } from "@/lib/data";
import CoinIcon from "@/svg/coinIcon";

import FoodIcon from "@/svg/foodIcon";
import OpenIcon from "@/svg/openIcon";
import WinIcon from "@/svg/winIcon";
import Image from "next/image";
import React from "react";

export default function Log() {
  const StatusConditions = ["Ongoing", "Attack", "Defense"] as const;
  const relevantButton = "Revenge";
  let logStatus = "Ongoing";
  return (
    <div className="logBg  flex flex-row ">
      <div className=" flex flex-col w-full">
        <div className="flex flex-row px-3 w-full ">
          <h3 className=" items-center gap-2 text-[#98FBD7] flex flex-row text-[16px] font-light">
            <span className=" font-bold">Defender: </span> 0x...1234
            <OpenIcon /> <span className="ml-3 font-semibold">Land:</span>{" "}
            100120
            <span className=" text-[12px] font-light ml-4">
              {" "}
              Time: 11/10/2023 22:30
            </span>
          </h3>
        </div>
        <div className=" flex flex-row  h-full flex-grow  items-center gap-6 ">
          <div className=" flex flex-row gap-1">
            {warriors.map((warrior, key) => (
              <React.Fragment key={key}>
                <Image
                  src={"/svgs/images/warriorCard.svg"}
                  className="!w-[40px] h-auto"
                  width={40}
                  height={20}
                  alt="warrior"
                />
              </React.Fragment>
            ))}
          </div>
          <WinIcon />
          <div className=" flex flex-row gap-1">
            {warriors.map((warrior, key) => (
              <React.Fragment key={key}>
                <Image
                  src={"/svgs/images/warriorCard.svg"}
                  className="!w-[40px] h-auto"
                  width={40}
                  height={20}
                  alt="warrior"
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {logStatus == "Attack" && <AttackLogAction />}
      {logStatus == "Ongoing" && <OngoingLogAction />}
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

export const OngoingLogAction = () => {
  return (
    <div className=" ml-auto  h-full flex flex-col md:flex-row gap-2 py-2 px-2">
      <div className=" flex flex-row gap-2 ">
        <div className="w-[200px] h-full flex items-center justify-center  bg-[#06291D80]/50">
          <a className="  ml-auto mr-auto  px-3 text-center py-3">
            Army arrived at the enemy land
          </a>
        </div>
        <div className=" flex flex-col justify-around">
          {" "}
          <a className=" rounded-full bg-white/10 w-6 h-6 border border-white/20"></a>
          <a className=" rounded-full bg-white/10 w-6 h-6 border border-white/20"></a>
          <a className=" rounded-full bg-white/10 w-6 h-6 border border-white/20"></a>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-[182px]">
        <a className=" bg-[#06291D80]/50 px-3 text-center py-3">Ready</a>
        <a className=" !rounded-md cursor-pointer greenButton !w-full px-3 text-center  py-3">
          Start war
        </a>
      </div>
    </div>
  );
};
