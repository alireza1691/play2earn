"use client"
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { apiKey, landsAddress, townAddress } from '@/lib/blockchainData';
import { APICallData, MintedLand, MintedResourceBuildingType } from '@/lib/types';
import { getMintedLandsFromEvents, getOwnedLands, getResBuildingsFromEvents } from '@/lib/utils';



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
}

const ApiDataContext = createContext<ApiDataContextProps | undefined>(undefined);

const ApiDataProvider: React.FC<ApiDataProviderProps> = ({ children }) => {
  const [apiData, setApiData] = useState<APICallData | null>(null);
  const [townApiData, setTownApiData] = useState<APICallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mintedLands, setMintedLands] = useState< MintedLand[] | null>(null)
  const [buildedResourceBuildings, setBuildedResourceBuildings] = useState<MintedResourceBuildingType[] | null>(null)

  


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsAddress}&apikey=${apiKey}`
        );
        const response2 = await axios.get(
          `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${townAddress}&apikey=${apiKey}`
        );
        setApiData(response.data);
        console.log("Lands API response:",response);
        console.log("Town API response:",response2);
        const mintedLands = getMintedLandsFromEvents(response.data.result)
        setMintedLands (mintedLands)
        const mintedResourcesBuildings =  getResBuildingsFromEvents(response2.data.result)
        setBuildedResourceBuildings(mintedResourcesBuildings)
  
   
        
      } catch (error) {
        console.error('Error fetching API data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run the effect only once on mount

  return (
    <ApiDataContext.Provider value={{ apiData, loading ,townApiData, mintedLands,buildedResourceBuildings}}>
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
