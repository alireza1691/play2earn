"use client";

import React, { createContext, useContext, useState } from "react";

 const states = ["waitingWalletConnection","connected","waitingUserApproval","waitingBlockchainConfirmation","confirmed","failedConfirmation","txRejected","connectionRejected"] as const
 type TxStateType = typeof states[number]

 type TxError = Error

type BlockchainStateContextProviderProps = {
    children: React.ReactNode;
  };

/**
 * A place for the confirmation modal to send the player next, when the action
 * has one. Only mint sets it today; it exists so the modal can decide what to
 * offer from state rather than by matching on the success message's wording.
 */
export type TxSuccessLink = { href: string; label: string }

type BlockchainStateContextType = {
    // errorMsg: string | null,
    message: string | null
    setMessage: React.Dispatch<React.SetStateAction<string | null>>,
    successLink: TxSuccessLink | null,
    setSuccessLink: React.Dispatch<React.SetStateAction<TxSuccessLink | null>>,
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
    const [message, setMessage] = useState<null | string>(null)
    const [successLink, setSuccessLink] = useState<TxSuccessLink | null>(null)


      return(
        <BlockchainStateContext.Provider value={{txError, setTxError, transactionState, setTransactionState,reloadHandler,setReloadHandler, message,setMessage, successLink,setSuccessLink}}>
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