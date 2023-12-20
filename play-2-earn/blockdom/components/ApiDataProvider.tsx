// components/ApiDataProvider.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';

interface ApiDataProviderProps {
  children: (data: { apiData: any; loading: boolean }) => ReactNode;
}

const ApiDataProvider: React.FC<ApiDataProviderProps> = ({ children }) => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=someAddress&apikey=someApiKey'
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

  // Explicitly specify the return type
  return <>{children({ apiData, loading })}</>;
};

export default ApiDataProvider;
