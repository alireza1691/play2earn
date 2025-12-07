"use client"
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { apiKey, arbitrumApiKey, landsAddress, landsMainnetAddress, polygonApiKey, townAddress } from '@/lib/blockchainData';
import { APICallData, ArmyType, MintedLand, MintedResourceBuildingType, WarLogType } from '@/lib/types';
import { getMintedLandsFromEvents, getOwnedLands, getResBuildingsFromEvents, getWarLogsFromEvents } from '@/lib/utils';
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
  armyTypes: ArmyType[] | null
  setArmyTypes: React.Dispatch<React.SetStateAction<ArmyType[] | null>>
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
  const [armyTypes, setArmyTypes] = useState <ArmyType[] | null>(null)
  const [battleLogs,setBattleLogs] = useState <WarLogType[] | null>(null)
  const [apiTrigger, setApiTrigger] = useState<boolean>(false)

  const currentRoute = usePathname()

  // const isTestnet = () =>{
  //   if ( currentRoute == "/testnet/explore" ||currentRoute == "/testnet/myLand" ||currentRoute == "/testnet/battleLog"  ) {
  //    return true
  //   } 
  //   else {return false}
   
  // }
  const isTestnet = currentRoute.includes("/testnet/");

  const sepoliaAPIRequest= (address: string) =>{
     const url = `https://api.etherscan.io/v2/api?chainid=11155111&module=logs&action=getLogs&address=${address}&apikey=${apiKey}`;
    return url;
   // return `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${address}&apikey=${apiKey}`
  }   
  const polygonAPIRequest = (address: string) => {
    // return `https://api.polygonscan.com/api
    // ?module=logs
    // &action=getLogs
    // &address=${address}
    // &apikey=${polygonApiKey} `
    return `https://api.polygonscan.com/api?module=logs&action=getLogs&address=${address}&apikey=${polygonApiKey}`;

  }


  useEffect(() => {

    const fetchData = async () => {
      try {
        if (isTestnet ) {
          const response = await axios.get(
            sepoliaAPIRequest(landsAddress)
          );
          const response2 = await axios.get(
            sepoliaAPIRequest(townAddress)
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
          
    
        } else {
          const response = await axios.get(
            polygonAPIRequest(landsMainnetAddress)
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

    };

    fetchData();

    if (apiTrigger) {
      const fetchDataWithDelay = () => {
        setTimeout(() => {
          fetchData();
        }, 3000); // 3 seconds delay (adjust as needed)
      };
      fetchDataWithDelay()
      setApiTrigger(false)
    }
  }, [isTestnet, apiTrigger]); // Run the effect only once on mount

  return (
    <ApiDataContext.Provider value={{ apiData, loading ,townApiData, mintedLands,buildedResourceBuildings, armyTypes, setArmyTypes, battleLogs,setApiTrigger}}>
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
