"use client";

import { landItems } from "@/lib/data";
import { createContext, useContext, useState } from "react";

type itemType = typeof landItems[number]


type SelectedBuildingContextProviderProps = {
    children: React.ReactNode;
  };

type SelectedBuildingContextType = {
    selectedItem: itemType | null,
    setSelectedItem: React.Dispatch<React.SetStateAction<itemType|null>>
}

const StatesContext = createContext<SelectedBuildingContextType | null>(null)

export default function SelectedBuildingContextProvider({children}:SelectedBuildingContextProviderProps) {
      const [selectedItem, setSelectedItem] =  useState< itemType | null >(null)
    

      return(
        <StatesContext.Provider value={{ selectedItem, setSelectedItem}}>
            {children}
        </StatesContext.Provider>
      )
}

export function useSelectedBuildingContext() {
    const context = useContext(StatesContext)
    if (context === null) {
        throw new Error("useActiveSectionContext must be used within an ActiveSectionContextProvider")
    }
    return context
}