import Slidebar from "@/components/gameComponents/slidebar";
import Attack from "@/components/gameComponents/attack";
import SelectedParcel from "@/components/gameComponents/selectedParcel";
import React from "react";

import BattleLog from "@/components/gameComponents/battleLog";

export default function Explore() {

  return (
    <div className=" overflow-hidden w-screen h-screen relative">
      <BattleLog />
      <SelectedParcel />

      <div className=" flex flex-row justify-center">
        <Slidebar/>
        <Attack />
      </div>
    </div>
  );
}
