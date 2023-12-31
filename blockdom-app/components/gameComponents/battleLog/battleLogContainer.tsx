"use client"
import { useSelectedWindowContext } from "@/context/selected-window-context";
import React, { useState } from "react";
import BattleLogTabs from "./battleLogTabs" 
import Log from "./log";

export default function BattleLogContainer() {
  const { selectedWindowComponent } = useSelectedWindowContext();

  return (
    <>
      {/* {selectedWindowComponent == "battleLog" && ( */}
        <section className=" absolute z-10 h-[90%] w-[90%]  battleLogWindowBg -translate-x-1/2 left-1/2 top-[4.5rem] rounded-md ">
          <div className="flex flex-col p-5">
            <BattleLogTabs/>
            <div className=" flex flex-col gap-2 mt-4">
              
              <Log/>
              <Log/>
            </div>
          </div>
        </section>
      {/* )} */}
    </>
  );
}
