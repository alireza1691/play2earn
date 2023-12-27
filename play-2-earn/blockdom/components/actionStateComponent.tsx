"use client"
import { useBlockchainStateContext } from '@/context/blockchain-state-context'
import React from 'react'

export default function ActionStateComponent() {
    const {setTransactionState,transactionState} = useBlockchainStateContext()

    setTransactionState("waitingWalletConnection")
    const title = () :string => {

        let titleString : string = ""
        if (transactionState) {
            if (     transactionState == "waitingWalletConnection" ) {
                titleString = "Connect your wallet to Sepolia network"
            }
            if (     transactionState == "waitingUserApproval" ) {
                titleString = "Approve transaction in your wallet"
            }
            if (     transactionState == "waitingBlockchainConfirmation" ) {
                titleString = "Confirming..."
            }
            if (     transactionState == "txRejected" ) {
                titleString = "User rejected the reansaction"
            }
            if (     transactionState == "failedConfirmation" ) {
                titleString = "Transaction failed. Please tyy again or contact support."
            }
            if (     transactionState ==  "confirmed") {
                titleString = "Transaction submitted"
            }
            if (     transactionState ==  "connectionRejected") {
                titleString = "Connection rejected. Connect your wallet to correct network and try again"
            }
       
        } 
        return titleString
    }
  return (
    <div className=' absolute z999 md:w-[25.5rem] md:h-[12.5rem] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 txStateBg flex flex-col'>
        <h3 className='px-[10%]  mt-4 text-center !text-white font-semibold'>{title()}</h3>
        <div className='mt-auto px-3 py-3'> <button onClick={() => setTransactionState(null) } className=' !py-2 !w-full outlineGreenButton'>Cancel</button></div>
       
    </div>
  )
}
