import CloseIcon from "@/svg/closeIcon";
import Image from "next/image";
import React, { useState } from "react";

type sliderHookProps = {
  slidebar: boolean;
  setSlidebar: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLand: number | null;
};

type StringArray = string[];

export default function Slidebar({
  slidebar, setSlidebar, selectedLand
}:sliderHookProps) {

  const isMinted = true;

  // function getPermutations2(str:string) {
  //   const results:string[] = [];
  //   const chars = str.split('');
  
  
  //   function generatePermutations(current:string, remaining:string[]) {
  //       results.push(current);
  //       for (let i = 0; i < remaining.length; i++) {
  //         const nextChar = remaining[i];
  //         const newCurrent = current + nextChar;
  //         const newRemaining = remaining.slice(0, i).concat(remaining.slice(i + 1));
  //           generatePermutations(newCurrent, newRemaining);
  //       }
  //   }
  //     generatePermutations('', chars);
  //   console.log( results);
    
  //   return results;
  // }
  
  return (
    <>
    <div
      className={`${
        slidebar
          ? "z-10 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-16"
          : "-left-[50rem]"
      } flex flex-col transition-all  top-28 absolute h-[50rem] w-[90%] md:w-[25rem] xl:w-[30rem] bg-[#21302A]/60 backdrop-blur-sm rounded-2xl `}
    >
      <div className="p-4 flex flex-row justify-between">
        <h3 className=" text-white ">Land { selectedLand =! null && selectedLand}</h3>
        <a className=" closeIcon" onClick={() => {setSlidebar(false)}}><CloseIcon/></a>

      </div>
      <div className=" flex justify-center mt-2">
        <Image
          src={"/svg/gameItems/landCard.svg"}
          width={256}
          height={364}
          alt="card"
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className=" flex flex-row justify-evenly items-center">
          <div className=" backdrop-brightness-50 shadow-xl items-center rounded-xl px-4 py-2 bg-[#9E9547]/40 bg-gradient-to-r from-[#FFFFFF]/40 via-[#FFFFFF]/20 to-[#FFFFFF]/30 flex flex-row gap-2">
            <Image
              src={"/svg/gameItems/goldIcon.svg"}
              width={32}
              height={32}
              alt="goldIcon"
            />
            <h4 className=" text-white font-semibold">12314123</h4>
          </div>
          <div className="backdrop-brightness-50 shadow-xl items-center rounded-xl px-4 py-2 bg-[#599E47]/40 bg-gradient-to-r from-[#FFFFFF]/20 via-[#FFFFFF]/10 to-[#FFFFFF]/30 flex flex-row gap-2">
            <Image
              src={"/svg/gameItems/goldIcon.svg"}
              width={32}
              height={32}
              alt="goldIcon"
            />
            <h4 className=" text-white font-semibold">12314123</h4>
          </div>
        </div>
        <div className="flex flex-row justify-around">
          <Image
            src={"/svg/gameItems/warriorCard.svg"}
            width={109}
            height={177}
            alt="warriorCard"
          />
          <Image
            src={"/svg/gameItems/warriorCard.svg"}
            width={109}
            height={177}
            alt="warriorCard"
          />
          <Image
            src={"/svg/gameItems/warriorCard.svg"}
            width={109}
            height={177}
            alt="warriorCard"
          />
        </div>
      </div>
      <div className=" mt-auto p-3">
        <button className="greenButton !w-full  ">Do something</button>
      </div>
    </div>
    </>
  );
}
