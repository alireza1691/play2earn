"use client";

import React, { createContext, useContext, useState } from "react";

 const states = ["waitingWalletConnection","waitingUserApproval","waitingBlockchainConfirmation","confirmed","failedConfirmation","txRejected","connectionRejected"] as const
 type TxStateType = typeof states[number]

type BlockchainStateContextProviderProps = {
    children: React.ReactNode;
  };

type BlockchainStateContextType = {
    // errorMsg: string | null,
    errorMsg: any | null,
    setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>,
    transactionState: TxStateType | null,
    setTransactionState: React.Dispatch<React.SetStateAction<TxStateType | null>>,
}

const BlockchainStateContext = createContext<BlockchainStateContextType | null>(null)

export default function BlockchainStateContextProvider({children}:BlockchainStateContextProviderProps) {
    // const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<any | null>(null);
    const [transactionState, setTransactionState] = useState<TxStateType| null>(null)
        

      return(
        <BlockchainStateContext.Provider value={{errorMsg, setErrorMsg, transactionState, setTransactionState}}>
            {children}
        </BlockchainStateContext.Provider>
      )
}

export function useBlockchainStateContext() {
    const context = useContext(BlockchainStateContext)
    if (context === null) {
        throw new Error("useSelectedWindowContext must be used within an useSelectedWindowContext")
    }
    return context
}