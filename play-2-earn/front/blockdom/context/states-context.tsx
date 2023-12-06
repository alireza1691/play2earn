"use client"

import { landItems } from "@/lib/data";
import { createContext, useContext, useState } from "react";

type itemType = typeof landItems[number]


type StatesContextProviderProps = {
    children: React.ReactNode;
  };

type StateContextType = {
    selectedItem: itemType | null,
    setSelectedItem: React.Dispatch<React.SetStateAction<itemType|null>>
}

const StatesContext = createContext<StateContextType | null>(null)

export default function StatesContextProvider({children}:StatesContextProviderProps) {
      const [selectedItem, setSelectedItem] =  useState< itemType | null >(null)
    

      return(
        <StatesContext.Provider value={{ selectedItem, setSelectedItem}}>
            {children}
        </StatesContext.Provider>
      )
}

export function useStatesContext() {
    const context = useContext(StatesContext)
    if (context === null) {
        throw new Error("useActiveSectionContext must be used within an ActiveSectionContextProvider")
    }
    return context
}