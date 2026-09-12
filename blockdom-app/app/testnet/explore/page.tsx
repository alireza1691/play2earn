import Slidebar from "@/components/gameComponents/landSlideBarComponents/landSlideBar";
import Attack from "@/components/gameComponents/attack/attack";
import React from "react";

import BattleLog from "@/components/gameComponents/battleLog/battleLogContainer";
import ExploreView from "@/components/gameComponents/mapComponents/exploreView";
import { MapUrlState } from "@/components/gameComponents/urlState";

export default function Explore() {

  return (
    <div className=" overflow-hidden w-[100dvw] h-[100dvh] relative">
      {/* <BattleLog /> */}
      <MapUrlState />
      <ExploreView/>

      <div className=" flex flex-row justify-center">
        <Slidebar/>
  
      </div>
    </div>
  );
}
