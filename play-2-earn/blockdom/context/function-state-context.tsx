"use client";

import { landItems } from "@/lib/data";
import { createContext, useContext, useState } from "react";

const states = ["waitingFromUser","rejectedByUser","waitingConfirmation","confirmed","rejectedByError"] as const

type StateType = typeof states


type FunctionStateContextProviderProps = {
    children: React.ReactNode;
  };

type FunctionStateContextType = {
    functionState: StateType | null,
    setFunctionState: React.Dispatch<React.SetStateAction<StateType|null>>
}

const StatesContext = createContext<FunctionStateContextType | null>(null)

export default function SelectedBuildingContextProvider({children}:FunctionStateContextProviderProps) {
      const [functionState, setFunctionState] =  useState< StateType | null >(null)
    

      return(
        <StatesContext.Provider value={{ functionState, setFunctionState}}>
            {children}
        </StatesContext.Provider>
      )
}

export function useFunctionState() {
    const context = useContext(StatesContext)
    if (context === null) {
        throw new Error("useSelectedBuildingContext must be used within an useSelectedBuildingContext")
    }
    return context
}