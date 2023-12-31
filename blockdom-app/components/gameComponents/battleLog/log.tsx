import { warriors } from "@/lib/data";
import CoinIcon from "@/svg/coinIcon";

import FoodIcon from "@/svg/foodIcon";
import OpenIcon from "@/svg/openIcon";
import Image from "next/image";
import React from "react";

export default function Log() {
  const relevantButton = "Revenge";
  return (
    <div className="logBg  flex flex-row ">
      <div className=" flex flex-col">
        <div className="flex flex-row px-3 flex-shrink ">
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
        <div className=" flex flex-row  h-full flex-grow bg-white/10 ">
          <div className=" flex flex-row ">
            {warriors.map((warrior, key) => (
              <Image
                src={"/svgs/images/warriorCard.svg"}
                className="!w-[40px] h-auto"
                width={40}
                height={20}
                alt="warrior"
              />
            ))}
          </div>
        
        </div>
      </div>
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
    </div>
  );
}
