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
import { useSelectedWindowContext } from "@/context/selected-window-context";

export default function Slidebar() {
  const [imageUrl, setImageUrl] = useState<null | string>(null);

  const { selectedLand } = useMapContext();

  const {  selectedWindowComponent } =
  useSelectedWindowContext();

  return (
    <>
      <div
        className={`${
          selectedLand
            ? "z-400 sm:z-30 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6"
            : "!-left-[120rem]"
        }  ${selectedWindowComponent == "attack" && "hidden"} flex flex-col transition-all top-[4.5rem]  md:top-[8rem] absolute h-[75dvh] lg:h-[80dvh]  w-[90%] md:w-[22.5rem]  px-3 bg-[#21302A]/60 backdrop-blur-sm rounded-2xl `}
      >
        <LandSlideBarHeader/>
        <LandSlideBarCard/>
<LandSlidebarContent/>
        <SlideBarButtons
        />
      </div>
    </>
  );
}
