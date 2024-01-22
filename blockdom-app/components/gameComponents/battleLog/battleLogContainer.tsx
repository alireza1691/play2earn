"use client";
import { usePathname } from "next/navigation";
import React from "react";
import BattleLogTabs from "./battleLogTabs";
import Logs from "./logs";

export default function BattleLogContainer() {

 
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");


  return (
    <>
      {/* {selectedWindowComponent == "battleLog" && ( */}
      <section className="flex absolute z-10 h-[70dvh] lg:h-[80dvh] w-[90%]  battleLogWindowBg -translate-x-1/2 left-1/2 top-[8rem] rounded-md ">
        <div className="flex flex-col p-5 w-full">
          <BattleLogTabs />
          <div className=" flex flex-col flex-grow gap-20 md:gap-2 mt-4 overflow-y-scroll custom-scrollbar h-full ">
            <Logs />
            {/* <Log /> */}
          </div>
        </div>
      </section>
      {/* )} */}
    </>
  );
}
