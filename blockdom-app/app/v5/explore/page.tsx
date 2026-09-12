// v5 route: same pages and components as the live game, resolved against
// the rewritten contracts. See lib/deployments.ts — the deployment is
// taken from the URL, so nothing here differs but the path.
import Slidebar from "@/components/gameComponents/landSlideBarComponents/landSlideBar";
import Attack from "@/components/gameComponents/attack/attack";
import React from "react";

import BattleLog from "@/components/gameComponents/battleLog/battleLogContainer";
import ExploreView from "@/components/gameComponents/mapComponents/exploreView";
import { MapUrlState } from "@/components/gameComponents/urlState";

export default function V5Explore() {

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
