import { useApiData } from "@/context/api-data-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townMainnetPInst, townPInst, townRead } from "@/lib/instances";
import { DispatchedArmy, WarLogType } from "@/lib/types";
import { filterLandLogs } from "@/lib/utils";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import OngoingLog from "./ongoing-logo";
import ResultLog from "./result-log";
import { useDeployment } from "@/lib/deployments";

type WarLogs = {
  attackLogs: WarLogType[];
  defenseLogs: WarLogType[];
};
export default function Logs() {
  const [dispatchedArmies, setDispatchedArmies] = useState<
    DispatchedArmy[] | null
  >(null);
  const [warLogs, setWarLogs] = useState<WarLogs | null>(null);
  const { battleLogs } = useApiData();
  const { battleLogTab } = useSelectedWindowContext();
  const { chosenLand } = useUserDataContext();
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");
  const deployment = useDeployment();

  useEffect(() => {
    const getLogs = async () => {
      if (chosenLand) {
        try {
          const townInstant = townRead(deployment);
          const tx: DispatchedArmy[] = await townInstant.getDispatchedArmies(
            chosenLand?.tokenId
          );
          // const remainedTimeInMinutes = await townInstant.getRemainedDispatchTimestamp()
          setDispatchedArmies(tx);
          console.log("dispatched Armies:", tx);
          if (battleLogs) {
            const landLogs = filterLandLogs(
              battleLogs,
              Number(chosenLand.tokenId)
            );
            setWarLogs(landLogs);
          }
        } catch (error) {
          console.log("Could not get dispatched armies");
          console.log(error);
        }
      }
    };
    getLogs();
    console.log("battle logs from there:", battleLogs);
  }, [chosenLand, battleLogs]);
  return (
    <>
      {battleLogTab == "Ongoing" &&
        dispatchedArmies?.map((dispatchLog, key) => (
          <OngoingLog
            key={key}
            dispatchedArmy={dispatchLog}
            dispatchIndex={key}
          />
        ))}
      {battleLogTab == "Attacks" &&
        warLogs &&
        warLogs.attackLogs.map((log, key) => (
          <ResultLog
            key={key}
            from={log.from}
            to={log.to}
            success={log.success}
            lootedAmounts={log.lootedAmounts}
            isAttack={true}
          />
        ))}
      {battleLogTab == "Defenses" &&
        warLogs &&
        warLogs.defenseLogs.map((log, key) => (
          <ResultLog
            key={key}
            from={log.from}
            to={log.to}
            success={log.success}
            lootedAmounts={log.lootedAmounts}
            isAttack={false}
          />
        ))}
    </>
  );
}
