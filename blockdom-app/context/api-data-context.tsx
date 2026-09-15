"use client"
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { explorerLogsRequest, landsAddress, landsMainnetAddress, landsV4Address, landsV5Address, baseChainId, sepoliaChainId, townAddress, townV4Address, townV5Address, v5Deployed } from '@/lib/blockchainData';
import { useDeployment } from '@/lib/deployments';
import { APICallData, ArmyType, MintedLand, MintedResourceBuildingType, WarLogType } from '@/lib/types';
import { getLastRaidsFromEvents, getMintedLandsFromEvents, getOwnedLands, getResBuildingsFromEvents, getTownhallLevelsFromEvents, getWarLogsFromEvents } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useBlockchainStateContext } from './blockchain-state-context';



interface ApiDataProviderProps {
  children: ReactNode;
}

interface ApiDataContextProps {
  // apiData: any;
  apiData: APICallData | null;
  loading: boolean;
  townApiData: APICallData | null;
  mintedLands: MintedLand[] | null;
  buildedResourceBuildings: MintedResourceBuildingType[] | null
  /** Land token id -> town hall level. Empty until the Town logs land. */
  townhallLevels: Map<number, number>
  armyTypes: ArmyType[] | null
  setArmyTypes: React.Dispatch<React.SetStateAction<ArmyType[] | null>>
  /**
   * Land token id -> when it was last attacked, in unix seconds. The map reads
   * it for wild lands, whose goods and garrison regrow on a clock — see
   * wildFill() in lib/landTypes.
   */
  lastRaids: Map<number, number>
  /**
   * When that log scan was taken, in unix seconds. Regrowth is measured against
   * this rather than a clock read during render — a component asking the time
   * while it renders is not idempotent, and this value moves once per fetch,
   * which is exactly how often anything derived from it can change.
   */
  logsFetchedAt: number
  battleLogs: WarLogType[] | null
  setApiTrigger: React.Dispatch<React.SetStateAction<boolean>>
}

const ApiDataContext = createContext<ApiDataContextProps | undefined>(undefined);

const ApiDataProvider: React.FC<ApiDataProviderProps> = ({ children }) => {
  const [apiData, setApiData] = useState<APICallData | null>(null);
  const [townApiData, setTownApiData] = useState<APICallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mintedLands, setMintedLands] = useState< MintedLand[] | null>(null)
  const [buildedResourceBuildings, setBuildedResourceBuildings] = useState<MintedResourceBuildingType[] | null>(null)
  const [townhallLevels, setTownhallLevels] = useState<Map<number, number>>(new Map())
  const [armyTypes, setArmyTypes] = useState <ArmyType[] | null>(null)
  const [battleLogs,setBattleLogs] = useState <WarLogType[] | null>(null)
  const [lastRaids, setLastRaids] = useState<Map<number, number>>(new Map())
  const [logsFetchedAt, setLogsFetchedAt] = useState<number>(0)
  const [apiTrigger, setApiTrigger] = useState<boolean>(false)

  const currentRoute = usePathname()

  // const isTestnet = () =>{
  //   if ( currentRoute == "/testnet/explore" ||currentRoute == "/testnet/myLand" ||currentRoute == "/testnet/battleLog"  ) {
  //    return true
  //   } 
  //   else {return false}
   
  // }
  const isTestnet = currentRoute.includes("/testnet/");
  const deployment = useDeployment();

  // Which pair of addresses this route's log history comes from. v4 lives on
  // Sepolia like v3-testnet does, but at its own addresses, so it needs its own
  // scan — otherwise the new deployment would render the old one's events.
  const scanned =
    deployment === "v5-testnet"
      // Before v5 is broadcast its addresses are empty, and scanning an empty
      // address returns nothing at all rather than erroring — an empty world
      // that looks real. Read v4's history until v5 has one of its own.
      ? v5Deployed && townV5Address
        ? { lands: landsV5Address, town: townV5Address }
        : { lands: landsV4Address, town: townV4Address }
      : deployment === "v4-testnet"
      ? { lands: landsV4Address, town: townV4Address }
      : { lands: landsAddress, town: townAddress };

  const sepoliaAPIRequest = (address: string) =>
    explorerLogsRequest(address, sepoliaChainId);

  const baseAPIRequest = (address: string) =>
    explorerLogsRequest(address, baseChainId);


  const fetchData = useCallback(
    async () => {
      try {
        if (deployment !== "v3-mainnet") {
          const response = await axios.get(
            sepoliaAPIRequest(scanned.lands)
          );
          const response2 = await axios.get(
            sepoliaAPIRequest(scanned.town)
          );
          setApiData(response.data);
          console.log("Lands testnet API response:",response);
          console.log("Town testnet API response:",response2);
          const mintedLands = getMintedLandsFromEvents(response.data.result)       
          setMintedLands (mintedLands)
          const mintedResourcesBuildings =  getResBuildingsFromEvents(response2.data.result)
          setBuildedResourceBuildings(mintedResourcesBuildings)
          const warLogs = getWarLogsFromEvents(response2.data.result)
          setBattleLogs(warLogs)
          setLastRaids(getLastRaidsFromEvents(response2.data.result))
          setLogsFetchedAt(Date.now() / 1000)
          setTownhallLevels(getTownhallLevelsFromEvents(response2.data.result))
          
    
        } else {
          const response = await axios.get(
            baseAPIRequest(landsMainnetAddress)
          );
          setApiData(response.data);
          console.log("Mainnet lands API response:",response);
          const mintedLands = getMintedLandsFromEvents(response.data.result)
          setMintedLands (mintedLands)
        }
    
  
   
        
      } catch (error) {
        console.error('Error fetching API data:', error);
      } finally {
        setLoading(false);
      }

    },
    [deployment, scanned.lands, scanned.town]
  );

  // The initial load, and a reload when the route moves to another deployment.
  //
  // set-state-in-effect sees that fetchData reaches a setState and stops there;
  // it does not follow the await in front of every one of them. Nothing here
  // sets state during the effect itself — it all happens when the explorer
  // answers, which is the case the rule exists to allow.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  /**
   * A transaction has just landed, so the explorer needs a moment to index the
   * block before its logs carry the new event.
   *
   * This used to share the effect above: it fetched immediately, scheduled the
   * delayed fetch, then cleared the flag — and clearing it re-ran the effect,
   * which fetched a third time. Only the delayed one could ever see the new
   * block. Clearing the flag from the timeout also keeps the reset out of the
   * effect body, where a synchronous setState costs an extra render pass.
   */
  useEffect(() => {
    if (!apiTrigger) return;
    const timer = setTimeout(() => {
      fetchData();
      setApiTrigger(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [apiTrigger, fetchData]);

  return (
    <ApiDataContext.Provider value={{ apiData, loading ,townApiData, mintedLands,buildedResourceBuildings, townhallLevels, armyTypes, setArmyTypes, battleLogs, lastRaids, logsFetchedAt, setApiTrigger}}>
      {children}
    </ApiDataContext.Provider>
  );
};

const useApiData = () => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error('useApiDataContext must be used within an ApiDataProvider');
  }
  return context;
};

export { ApiDataProvider, useApiData };
