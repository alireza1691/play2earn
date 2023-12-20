"use client"
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { apiKey, landsAddress } from '@/lib/blockchainData';

interface ApiDataProviderProps {
  children: ReactNode;
}

interface ApiDataContextProps {
  apiData: any;
  loading: boolean;
}

const ApiDataContext = createContext<ApiDataContextProps | undefined>(undefined);

const ApiDataProvider: React.FC<ApiDataProviderProps> = ({ children }) => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${landsAddress}&apikey=${apiKey}`
        );
        setApiData(response.data);
      } catch (error) {
        console.error('Error fetching API data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run the effect only once on mount

  return (
    <ApiDataContext.Provider value={{ apiData, loading }}>
      {children}
    </ApiDataContext.Provider>
  );
};

const useApiData = () => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error('useApiData must be used within an ApiDataProvider');
  }
  return context;
};

export { ApiDataProvider, useApiData };
