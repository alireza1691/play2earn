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

  const { selectedLand, setSelectedLand } = useMapContext();
  const { ownedLands } = useUserDataContext();

  const {  selectedWindowComponent } =
  useSelectedWindowContext();

  return (
    <>
      <div
        className={`${
          selectedLand
            ? "z-100 sm:z-30 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-16"
            : "!-left-[50rem]"
        }  ${selectedWindowComponent == "attack" && "hidden"} flex flex-col transition-all  top-[4.55rem] absolute h-[75%] sm:h-[85%] w-[90%] md:w-[22.5rem]  px-3 bg-[#21302A]/60 backdrop-blur-sm rounded-2xl `}
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
