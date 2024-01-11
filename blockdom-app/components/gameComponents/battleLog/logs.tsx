import { useUserDataContext } from "@/context/user-data-context";
import { warriors, warriorsInfo } from "@/lib/data";
import { townMainnetPInst, townPInst } from "@/lib/instances";
import { DispatchedArmy } from "@/lib/types";
import CoinIcon from "@/svg/coinIcon";

import FoodIcon from "@/svg/foodIcon";
import OpenIcon from "@/svg/openIcon";
import WinIcon from "@/svg/winIcon";
import { BigNumber } from "ethers";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Log from "./log";


export default function Logs() {
  const [dispatchedArmies, setDispatchedArmies] = useState<
    DispatchedArmy[] | null
  >(null);
  const { chosenLand } = useUserDataContext();
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");

  useEffect(() => {
    const getLogs = async () => {
      if (chosenLand) {

      try { 
        const townInstant = isTestnet ? townPInst : townMainnetPInst;
        const tx: DispatchedArmy[] = await townInstant.getDispatchedArmies(
          chosenLand?.tokenId
        );
        // const remainedTimeInMinutes = await townInstant.getRemainedDispatchTimestamp()
        setDispatchedArmies(tx);
        console.log("dispatched Armies:",tx);
        
      } catch (error) {
        console.log("Could not get dispatched armies");
        console.log(error);
        
      }
    }
    };
    getLogs();
  }, [chosenLand]);
  return (
    <>{
        dispatchedArmies?.map((dispatchLog,key) => (
            <Log key={key} dispatchedArmy={dispatchLog} dispatchIndex={key}/>
        ))
    }
    </>
  );
}
