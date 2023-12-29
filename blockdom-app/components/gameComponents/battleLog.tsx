"use client"
import { useSelectedWindowContext } from "@/context/selected-window-context";
import React from "react";

export default function BattleLog() {
  const { selectedWindowComponent } = useSelectedWindowContext();
  let selectedTab = "All";
  let battleLogTabs = ["All", "Ongoing", "Attacks", "Defenses"];
  return (
    <>
      {selectedWindowComponent == "battleLog" && (
        <section className=" absolute z-100 h-[90%] w-[90%]  battleLogWindowBg -translate-x-1/2 left-1/2 top-[4.5rem] rounded-md ">
          <div className="flex flex-col p-5">
            <div className=" flex flex-row w-full justify-center gap-4">
              {battleLogTabs.map((tab, key) => (
                <a
                  className={` ${
                    selectedTab == tab
                      ? "bg-gradient-to-t from-[#213830]/50 to-[#5ECFA4]/50"
                      : " bg-[#555555]/60"
                  } py-2 px-4 rounded-full `}
                  key={key}
                >
                  {tab}
                </a>
              ))}
            </div>
            <div className=" flex flex-col"></div>
          </div>
        </section>
      )}
    </>
  );
}
