"use client";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townMainnetPInst, townPInst } from "@/lib/instances";
import { DispatchedArmy } from "@/lib/types";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import BattleLogTabs from "./battleLogTabs";
import Log from "./log";
import Logs from "./logs";

export default function BattleLogContainer() {
  const [dispatchedArmies, setDispatchedArmies] = useState<
    DispatchedArmy[] | null
  >(null);

  const { selectedWindowComponent } = useSelectedWindowContext();
  const { chosenLand } = useUserDataContext();

  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");

  // useEffect(() => {
  //   const getLogs = async () => {
  //     if (chosenLand) {
  //       try {
  //         const townInstant = isTestnet ? townPInst : townMainnetPInst;
  //         const tx: DispatchedArmy[] = await townInstant.getDispatchedArmies(
  //           chosenLand?.tokenId
  //         );
  //         const remainedTimeInMinutes =
  //           await townInstant.getRemainedDispatchTimestamp();
  //         setDispatchedArmies(tx);
  //         console.log("dispatched Armies:", tx);
  //       } catch (error) {
  //         console.log("Could not get dispatched armies");
  //       }
  //     }
  //   };
  //   getLogs();
  // }, [chosenLand]);

  return (
    <>
      {/* {selectedWindowComponent == "battleLog" && ( */}
      <section className=" absolute z-10 h-[90%] w-[90%]  battleLogWindowBg -translate-x-1/2 left-1/2 top-[4.5rem] rounded-md ">
        <div className="flex flex-col p-5">
          <BattleLogTabs />
          <div className=" flex flex-col gap-2 mt-4">
            <Logs />
            {/* <Log /> */}
          </div>
        </div>
      </section>
      {/* )} */}
    </>
  );
}
