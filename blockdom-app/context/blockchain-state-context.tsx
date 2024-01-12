"use client";

import React, { createContext, useContext, useState } from "react";

 const states = ["waitingWalletConnection","waitingUserApproval","waitingBlockchainConfirmation","confirmed","failedConfirmation","txRejected","connectionRejected"] as const
 type TxStateType = typeof states[number]

 type TxError = Error

type BlockchainStateContextProviderProps = {
    children: React.ReactNode;
  };

type BlockchainStateContextType = {
    // errorMsg: string | null,
    txError: TxError | null,
    setTxError: React.Dispatch<React.SetStateAction<TxError | null>>,
    transactionState: TxStateType | null,
    setTransactionState: React.Dispatch<React.SetStateAction<TxStateType | null>>,
    reloadHandler: boolean,
    setReloadHandler:React.Dispatch<React.SetStateAction<boolean>>,
}

const BlockchainStateContext = createContext<BlockchainStateContextType | null>(null)

export default function BlockchainStateContextProvider({children}:BlockchainStateContextProviderProps) {
    const [txError, setTxError] = useState<any | null>(null);
    const [transactionState, setTransactionState] = useState<TxStateType| null>(null)
    const [reloadHandler,setReloadHandler] = useState(false)
        

      return(
        <BlockchainStateContext.Provider value={{txError, setTxError, transactionState, setTransactionState,reloadHandler,setReloadHandler}}>
            {children}
        </BlockchainStateContext.Provider>
      )
}

export function useBlockchainStateContext() {
    const context = useContext(BlockchainStateContext)
    if (context === null) {
        throw new Error("useBlockchainStateContext must be used within an useSelectedWindowContext")
    }
    return context
}