"use client";
import { useBlockchainStateContext } from "@/context/blockchain-state-context";
import { useUserDataContext } from "@/context/user-data-context";
import BlockdomLogo from "@/svg/blockdomLogo";
import DoneIcon from "@/svg/doneIcon";
import FailedIcon from "@/svg/failedIcon";
import RejectIcon from "@/svg/rejectIcon";
import { Spinner } from "@nextui-org/react";
import { useAddress } from "@thirdweb-dev/react";
import { usePathname } from "next/navigation";
import React from "react";

export default function ActionStateComponent() {
  const { setTransactionState, transactionState, txError, setReloadHandler } =
    useBlockchainStateContext();
  const { isUserDataLoading } = useUserDataContext();
  const address = useAddress();
  const pathname = usePathname();

  const title = (): string => {
    let titleString: string = "";
    if (transactionState) {
      if (transactionState == "waitingUserApproval") {
        titleString = "Connect your wallet to Sepolia network";
      }
      if (transactionState == "waitingUserApproval") {
        titleString = "Approve transaction in your wallet";
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
    }
    return titleString;
  };
  return (
    <>
      {isUserDataLoading && address 
      // && pathname == "/myLand"
       && (
        <div className=" absolute z999 w-[90%] min-h-[12.5rem]  sm:w-[25.5rem] sm:min-h-[15rem] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 txStateBg flex flex-col">
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
        <div className=" absolute z999 w-[90%] min-h-[12.5rem]  sm:w-[25.5rem] sm:min-h-[15rem] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 txStateBg flex flex-col">
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
                onClick={() => {setTransactionState(null), transactionState == "confirmed" && window.location.reload();
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
  );
}
