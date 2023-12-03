import Card from "@/svg/card";
import CloseIcon from "@/svg/closeIcon";
import GoldIcon from "@/svg/goldIcon";

import Image from "next/image";
import React, { useState } from "react";

type sliderHookProps = {
  slideBar: boolean;
  setSlideBar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Slidebar({
  slideBar, setSlideBar
}:sliderHookProps) {

  const isMinted = true;

  return (
    <>
    <div
      className={`${
        slideBar
          ? " left-1/2 -translate-x-1/2 md:translate-x-0 md:left-16"
          : "-left-[30rem]"
      } flex flex-col transition-all  top-28 absolute h-[50rem] w-[90%] md:w-[25rem] xl:w-[30rem] bg-[#21302A]/60 backdrop-blur-sm rounded-2xl `}
    >
      <div className="p-4 flex flex-row justify-between">
        <h3 className=" text-white ">Land 101101</h3>
        <a onClick={() => {setSlideBar(false)}}><CloseIcon/></a>

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
        <div className=" flex flex-col gap-2">
          <div className=" flex flex-row justify-around">
            <Image
              src={"/svg/gameItems/goldIcon.svg"}
              width={32}
              height={32}
              alt="goldIcon"
            />
            <h4 className=" text-white">12314123</h4>
          </div>
          <div className=" flex flex-row justify-around">
            <Image
              src={"/svg/gameItems/goldIcon.svg"}
              width={32}
              height={32}
              alt="goldIcon"
            />
            <h4 className=" text-white">12314123</h4>
          </div>
          <div className=" flex flex-row justify-around">
            <Image
              src={"/svg/gameItems/goldIcon.svg"}
              width={32}
              height={32}
              alt="goldIcon"
            />
            <h4 className=" text-white">12314123</h4>
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
