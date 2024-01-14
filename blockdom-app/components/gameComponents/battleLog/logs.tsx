import { useApiData } from "@/context/api-data-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { warriors, warriorsInfo } from "@/lib/data";
import { townMainnetPInst, townPInst } from "@/lib/instances";
import { DispatchedArmy, WarLogType } from "@/lib/types";
import { filterLandLogs } from "@/lib/utils";
import CoinIcon from "@/svg/coinIcon";

import FoodIcon from "@/svg/foodIcon";
import OpenIcon from "@/svg/openIcon";
import WinIcon from "@/svg/winIcon";
import { BigNumber } from "ethers";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import OngoingLog from "./ongoingLog";
import ResultLog from "./resultLog";


type WarLogs = {
  attackLogs: WarLogType[] 
  defenseLogs: WarLogType[] 
}
export default function Logs() {
  const [dispatchedArmies, setDispatchedArmies] = useState<
    DispatchedArmy[] | null
  >(null);
  const [warLogs,setWarLogs] = useState<WarLogs | null>(null)
  const { battleLogs } = useApiData()
  const { battleLogTab} = useSelectedWindowContext()
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
        if (battleLogs) {
          const landLogs = filterLandLogs(battleLogs, Number(chosenLand.tokenId))
          setWarLogs(landLogs)
         }
      } catch (error) {
        console.log("Could not get dispatched armies");
        console.log(error);
        
      }
 
    }
    
    };
    getLogs();
    console.log("battle logs from there:",battleLogs);
    
  }, [chosenLand,battleLogs]);
  return (
    <>{
      battleLogTab == "Ongoing" && dispatchedArmies?.map((dispatchLog,key) => (
            <OngoingLog key={key} dispatchedArmy={dispatchLog} dispatchIndex={key}/>
        ))
    }
    {battleLogTab == "Attacks" && warLogs && warLogs.attackLogs.map((log,key) => (
 
      <ResultLog key={key} from={log.from} to={log.to} success={log.success} lootedAmounts={log.lootedAmounts} isAttack={true}/>
  
    ))}
    {battleLogTab == "Defenses" && warLogs && warLogs.defenseLogs.map((log,key) => (
 
 <ResultLog key={key} from={log.from} to={log.to} success={log.success} lootedAmounts={log.lootedAmounts} isAttack={false}/>

))}
    </>
  );
}
