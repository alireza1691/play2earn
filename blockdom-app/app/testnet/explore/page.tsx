import Slidebar from "@/components/gameComponents/landSlideBarComponents/landSlideBar";
import Attack from "@/components/gameComponents/attack/attack";
import React from "react";

import BattleLog from "@/components/gameComponents/battleLog/battleLogContainer";
import ExploreView from "@/components/gameComponents/mapComponents/exploreView";

export default function Explore() {

  return (
    <div className=" overflow-hidden w-screen h-screen relative">
      {/* <BattleLog /> */}
      <ExploreView/>

      <div className=" flex flex-row justify-center">
        <Slidebar/>
        <Attack />
      </div>
    </div>
  );
}
