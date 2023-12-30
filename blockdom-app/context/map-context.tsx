"use client";


import { SelectedLandType, SelectedParcelType } from "@/lib/types";
import { createContext, useContext, useState } from "react";


type SelectedLandContextProviderProps = {
    children: React.ReactNode;
  };

type SelectedLandContextType = {
    selectedLand: SelectedLandType,
    setSelectedLand: React.Dispatch<React.SetStateAction<SelectedLandType>>
    selectedParcel: SelectedParcelType
    setSelectedParcel: React.Dispatch<React.SetStateAction<SelectedParcelType>>
}

const MapContext = createContext<SelectedLandContextType | null>(null)

export default function MapContextProvider({children}:SelectedLandContextProviderProps) {
    const [selectedLand, setSelectedLand] = useState<SelectedLandType>(null);
    const [selectedParcel, setSelectedParcel] = useState<SelectedParcelType>(null);
        

      return(
        <MapContext.Provider value={{ selectedLand, setSelectedLand,selectedParcel,setSelectedParcel}}>
            {children}
        </MapContext.Provider>
      )
}

export function useMapContext() {
    const context = useContext(MapContext)
    if (context === null) {
        throw new Error("useMapContext must be used within an useSelectedWindowContext")
    }
    return context
}