"use client";
import { landsPInst } from "@/lib/instances";
import CloseIcon from "@/svg/closeIcon";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import SlideBarButtons from "./slideBarButtons";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";

import LandSlideBarCard from "./landSlideBarCard";
import LandSlideBarHeader from "./landSlideBarHeader";
import LandSlidebarContent from "./landSlidebarContent";

export default function Slidebar() {
  const [imageUrl, setImageUrl] = useState<null | string>(null);

  const { selectedLand, setSelectedLand } = useMapContext();
  const { ownedLands } = useUserDataContext();

 
  return (
    <>
      <div
        className={`${
          selectedLand
            ? "z-50 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-16"
            : "-left-[50rem]"
        } flex flex-col transition-all  top-[4.55rem] absolute h-[85%] w-[90%] md:w-[22.5rem] xl:w-[30rem] px-3 bg-[#21302A]/60 backdrop-blur-sm rounded-2xl `}
      >
        <LandSlideBarHeader/>
        <LandSlideBarCard/>
<LandSlidebarContent/>
        {/* <div className="flex flex-col justify-around h-full max-h-[35%]">
          <div className=" flex flex-row justify-evenly items-center w-full">
            <div className="goldBg goodsBalanceKeeper !w-[45%] h-full">
              <Image
                src={"/svgs/icons/goldIcon.svg"}
                width={32}
                height={32}
                alt="goldIcon"
              />
              <h4 className=" text-white font-semibold ">12314123</h4>
            </div>
            <div className="foodBg goodsBalanceKeeper !w-[45%] h-full">
              <Image
                src={"/svgs/icons/foodIcon.svg"}
                width={32}
                height={32}
                alt="goldIcon"
              />
              <h4 className=" text-white font-semibold">12314123</h4>
            </div>
          </div>
          <div className="flex flex-row gap-4 justify-center ">
            <div className="cardBg ml-auto mr-auto darkShadow">
              <Image
                src={"/images/warriorTest.png"}
                alt="warriorCard"
                width={40}
                height={64}
                className={" w-[50px] h-auto  rounded-sm"}
              />
              <h4 className="mt-1 text-center text-[10px]">100</h4>
            </div>
            <div className="cardBg ml-auto mr-auto darkShadow">
              <Image
                src={"/images/warriorTest.png"}
                alt="warriorCard"
                width={40}
                height={64}
                className={" w-[50px] h-auto  rounded-sm"}
              />
              <h4 className="mt-1 text-center text-[10px]">100</h4>
            </div>
            <div className="cardBg ml-auto mr-auto darkShadow">
              <Image
                src={"/images/warriorTest.png"}
                alt="warriorCard"
                width={40}
                height={64}
                className={" w-[50px] h-auto  rounded-sm"}
              />
              <h4 className="mt-1 text-center text-[10px]">100</h4>
            </div>
            <div className="cardBg ml-auto mr-auto darkShadow">
              <Image
                src={"/images/warriorTest.png"}
                alt="warriorCard"
                width={40}
                height={64}
                className={" w-[50px] h-auto  rounded-sm"}
              />
              <h4 className="mt-1 text-center text-[10px]">100</h4>
            </div>
            <div className="cardBg ml-auto mr-auto darkShadow">
              <Image
                src={"/images/warriorTest.png"}
                alt="warriorCard"
                width={40}
                height={64}
                className={" w-[50px] h-auto rounded-sm"}
              />
              <h4 className="mt-1 text-center text-[10px]">100</h4>
            </div>
          </div>
        </div> */}
        <SlideBarButtons
          // selectedLand={selectedLand}
          // isOwnedLand={isOwnedLand}
        />
      </div>
    </>
  );
}
