"use client"
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { apiKey, arbitrumApiKey, landsAddress, landsMainnetAddress, polygonApiKey, townAddress } from '@/lib/blockchainData';
import { APICallData, ArmyType, MintedLand, MintedResourceBuildingType } from '@/lib/types';
import { getMintedLandsFromEvents, getOwnedLands, getResBuildingsFromEvents } from '@/lib/utils';
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
}

const ApiDataContext = createContext<ApiDataContextProps | undefined>(undefined);

const ApiDataProvider: React.FC<ApiDataProviderProps> = ({ children }) => {
  const [apiData, setApiData] = useState<APICallData | null>(null);
  const [townApiData, setTownApiData] = useState<APICallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mintedLands, setMintedLands] = useState< MintedLand[] | null>(null)
  const [buildedResourceBuildings, setBuildedResourceBuildings] = useState<MintedResourceBuildingType[] | null>(null)
  const [armyTypes, setArmyTypes] = useState <ArmyType[] | null>(null)
  // const [isTestnetNetwork,setIsTestnetNetwork] = useState<boolean|null>(null)

  const currentRoute = usePathname()

  // const isTestnet = () =>{
  //   if ( currentRoute == "/testnet/explore" ||currentRoute == "/testnet/myLand" ||currentRoute == "/testnet/battleLog"  ) {
  //    return true
  //   } 
  //   else {return false}
   
  // }
  const isTestnet = currentRoute.includes("/testnet/");

  const sepoliaAPIRequest= (address: string) =>{
   return `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${address}&apikey=${apiKey}`
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
      
      // setIsTestnetNetwork(isTestnet)
      try {
        if (isTestnet ) {
          const response = await axios.get(
            sepoliaAPIRequest(landsAddress)
          );
          const response2 = await axios.get(
            sepoliaAPIRequest(townAddress)
          );
          setApiData(response.data);
          console.log("Lands API response:",response);
          console.log("Town API response:",response2);
          const mintedLands = getMintedLandsFromEvents(response.data.result)
          setMintedLands (mintedLands)
          const mintedResourcesBuildings =  getResBuildingsFromEvents(response2.data.result)
          setBuildedResourceBuildings(mintedResourcesBuildings)
    
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
  }, [isTestnet]); // Run the effect only once on mount

  return (
    <ApiDataContext.Provider value={{ apiData, loading ,townApiData, mintedLands,buildedResourceBuildings, armyTypes, setArmyTypes}}>
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
