"use client";


import { battleLogTabs } from "@/lib/data";
import { createContext, useContext, useState } from "react";


const windowComponentsList = [
    "attack",
    "mintedLand",
    "emptyLand",
    "myLand",
    "battleLog",
    "attackStatus",
    "tokenActions",
    "workerComp"
] as const

const tokenCompTabs = [
    "deposit/withdraw",
    "faucet"
] as const

type itemType = typeof windowComponentsList[number]


type SelectedBuildingContextProviderProps = {
    children: React.ReactNode;
  };

type SelectedBuildingContextType = {
    selectedWindowComponent: itemType | null,
    setSelectedWindowComponent: React.Dispatch<React.SetStateAction<itemType|null>>
    selectedArmy:number[],
    setSelectedArmy: React.Dispatch<React.SetStateAction<number[]>>
    battleLogTab: typeof battleLogTabs[number]
    setBattleLogTab: React.Dispatch<React.SetStateAction<typeof battleLogTabs[number]>>
    tokenCompTab: typeof tokenCompTabs[number]
    setTokenCompTab: React.Dispatch<React.SetStateAction<typeof tokenCompTabs[number]>>
}

const StatesContext = createContext<SelectedBuildingContextType | null>(null)

export default function SelectedWindowContextProvider({children}:SelectedBuildingContextProviderProps) {
      const [selectedWindowComponent, setSelectedWindowComponent] =  useState< itemType | null >(null)
      const [selectedArmy,setSelectedArmy] = useState<number[]>([0,0,0,0,0,0])
      const [battleLogTab, setBattleLogTab] = useState<typeof battleLogTabs[number]>("Ongoing")
      const [tokenCompTab,setTokenCompTab] = useState<typeof tokenCompTabs[number]>("deposit/withdraw")
        

      return(
        <StatesContext.Provider value={{ selectedWindowComponent, setSelectedWindowComponent,selectedArmy,setSelectedArmy,battleLogTab,setBattleLogTab,tokenCompTab,setTokenCompTab}}>
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