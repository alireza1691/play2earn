"use client";


import { createContext, useContext, useState } from "react";


const windowComponentsList = [
    "attack",
    "mintedLand",
    "emptyLand",
    "myLand",
    "battleLog",
    "attackStatus"
] as const
type itemType = typeof windowComponentsList[number]


type SelectedBuildingContextProviderProps = {
    children: React.ReactNode;
  };

type SelectedBuildingContextType = {
    selectedWindowComponent: itemType | null,
    setSelectedWindowComponent: React.Dispatch<React.SetStateAction<itemType|null>>
}

const StatesContext = createContext<SelectedBuildingContextType | null>(null)

export default function SelectedWindowContextProvider({children}:SelectedBuildingContextProviderProps) {
      const [selectedWindowComponent, setSelectedWindowComponent] =  useState< itemType | null >(null)
    

      return(
        <StatesContext.Provider value={{ selectedWindowComponent, setSelectedWindowComponent}}>
            {children}
        </StatesContext.Provider>
      )
}

export function useSelectedWindowContext() {
    const context = useContext(StatesContext)
    if (context === null) {
        throw new Error("useSelectedWindowContext must be used within an useSelectedWindowContext")
    }
    return context
}