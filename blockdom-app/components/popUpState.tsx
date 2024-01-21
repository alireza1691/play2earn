"use client";
import { useApiData } from "@/context/api-data-context";
import { useBlockchainStateContext } from "@/context/blockchain-state-context";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import BlockdomLogo from "@/svg/blockdomLogo";
import DoneIcon from "@/svg/doneIcon";
import FailedIcon from "@/svg/failedIcon";
import RejectIcon from "@/svg/rejectIcon";
import { Spinner } from "@nextui-org/react";
import { useAddress } from "@thirdweb-dev/react";
import { usePathname } from "next/navigation";
import React from "react";

export default function PopUpState() {
  const { setTransactionState, transactionState, txError, setReloadHandler } =
    useBlockchainStateContext();
  const { isUserDataLoading,setLandUpdateTrigger } = useUserDataContext();
  const {setApiTrigger} = useApiData()
  const address = useAddress();
  const pathname = usePathname();
  const {selectedLand} = useMapContext()

  const title = (): string => {
    let titleString: string = "";
    if (transactionState) {
      if (transactionState == "waitingUserApproval") {
        titleString = "Connect your wallet to Sepolia network";
      }
      if (transactionState == "waitingUserApproval") {
        titleString = "Approve the transaction in your wallet";
      }
      if (transactionState == "waitingBlockchainConfirmation") {
        titleString = "Confirming...";
      }
      if (transactionState == "txRejected") {
        titleString = "Transaction has been rejected";
      }
      if (transactionState == "failedConfirmation") {
        titleString =
          "Transaction failed. Please try again or contact support.";
      }
      if (transactionState == "confirmed") {
        titleString = "Transaction submitted";
      }
      if (transactionState == "connectionRejected") {
        titleString =
          "Connection rejected. Connect your wallet to correct network and try again";
      }
      if (transactionState == "connected") {
        titleString =
          "Your wallet connected to the right network. Please retry the action.";
      }
    }
    return titleString;
  };


  const isLoading = () =>{
    var isLoading = false
    if (pathname == "/myLand" ||pathname == "testnet/myLand") {
      isLoading =true
    }
    if (pathname == "/explore" || pathname == "testnet/explore") {
      if (selectedLand) {
        isLoading = true
      }
    }
    return isLoading
  }


  return (
    <>
    {pathname != "/" && 
    <>
 
      {isUserDataLoading && address 
      && isLoading() 
       && (
        <div className=" popUpStatus">
          <div className="flex flex-grow relative">
            {/* <Spinner color="success" size="lg" className='customSpinner ml-auto mr-auto absolute w-full mt-auto h-full '/> */}
            <div className="flex ml-auto mr-auto w-full h-full  mt-auto mb-auto  absolute ">
              <div className="spinner mt-auto mb-auto  ml-auto mr-auto "></div>
            </div>
            <div className="flex ml-auto mr-auto w-11 h-auto  mt-auto mb-auto  relative ">
              <BlockdomLogo />
            </div>
          </div>
        </div>
      )}{isUserDataLoading && address 
        && pathname == "/myLand"
         && (
          <div className=" popUpStatus">
            <div className="flex flex-grow relative">
              {/* <Spinner color="success" size="lg" className='customSpinner ml-auto mr-auto absolute w-full mt-auto h-full '/> */}
              <div className="flex ml-auto mr-auto w-full h-full  mt-auto mb-auto  absolute ">
                <div className="spinner mt-auto mb-auto  ml-auto mr-auto "></div>
              </div>
              <div className="flex ml-auto mr-auto w-11 h-auto  mt-auto mb-auto  relative ">
                <BlockdomLogo />
              </div>
            </div>
          </div>
        )}
      {transactionState != null && (
        <div className="popUpStatus">
          {/* <h3 className='px-[10%]  mt-4 text-center !text-white font-semibold'>{title()}</h3> */}
          <h3 className="px-[10%]  mt-4 text-center !text-white font-semibold">
            {title()}
          </h3>
          {transactionState == "txRejected" && (
            <div className="flex flex-grow">
              {" "}
              <div className="flex ml-auto mr-auto w-12 h-auto  mt-auto mb-auto ">
                <RejectIcon />
              </div>
            </div>
          )}
          {transactionState == "failedConfirmation" && (
            <div className="flex flex-grow">
              {" "}
              <div className="flex ml-auto mr-auto w-12 h-auto  mt-auto mb-auto ">
                <FailedIcon />
                {txError && txError?.message}
                <p></p>
              </div>
            </div>
          )}
          {transactionState == "confirmed" && (
            <div className="flex flex-grow">
              {" "}
              <div className="flex ml-auto mr-auto w-14 h-auto  mt-auto mb-auto ">
                <DoneIcon />
              </div>
            </div>
          )}
          {transactionState == "waitingBlockchainConfirmation" && (
            <div className="flex flex-grow relative">
              {/* <Spinner color="success" size="lg" className='customSpinner ml-auto mr-auto absolute w-full mt-auto h-full '/> */}
              <div className="flex ml-auto mr-auto w-full h-full  mt-auto mb-auto  absolute ">
                <div className="spinner mt-auto mb-auto  ml-auto mr-auto "></div>
              </div>
              <div className="flex ml-auto mr-auto w-11 h-auto  mt-auto mb-auto  relative ">
                <BlockdomLogo />
              </div>
            </div>
          )}
          {transactionState != "waitingBlockchainConfirmation" ? (
            <div className="mt-auto px-3 py-3 flex flex-shrink">
              {" "}
              <button
                onClick={() => {setTransactionState(null), transactionState == "confirmed" && setApiTrigger(true), transactionState == "confirmed" && setLandUpdateTrigger(true) ;
                 }}
                className=" !py-2 !w-full outlineGreenButton"
              >
                Close
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      )}
      </>
      }
    </>
  );
}
