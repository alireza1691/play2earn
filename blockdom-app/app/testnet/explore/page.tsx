import Slidebar from "@/components/gameComponents/landSlideBarComponents/landSlideBar";
import Attack from "@/components/gameComponents/attack/attack";
import React from "react";

import BattleLog from "@/components/gameComponents/battleLog/battleLogContainer";
import ExploreView from "@/components/gameComponents/mapComponents/exploreView";

export default function Explore() {

  return (
    <div className=" overflow-hidden w-[100dvw] h-[100dvh] relative">
      {/* <BattleLog /> */}
      <ExploreView/>

      <div className=" flex flex-row justify-center">
        <Slidebar/>
  
      </div>
    </div>
  );
}
