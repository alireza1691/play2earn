"use client";
import { useBlockchainStateContext } from "@/context/blockchain-state-context";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import PlotwarMark from "@/svg/plotwarMark";
import DoneIcon from "@/svg/doneIcon";
import FailedIcon from "@/svg/failedIcon";
import RejectIcon from "@/svg/rejectIcon";
import { useAddress } from "@thirdweb-dev/react";
import { usePathname } from "next/navigation";

export default function PopUpState() {
  const {
    setTransactionState,
    transactionState,
    txError,
    setReloadHandler,
    message,
    setMessage,
    successLink,
    setSuccessLink,
  } = useBlockchainStateContext();
  const { isUserDataLoading } = useUserDataContext();
  const address = useAddress();
  const pathname = usePathname();
  const { selectedLand } = useMapContext();

  /**
   * What the modal says for each point in the transaction's life.
   *
   * Every state now has exactly one line. There used to be two branches for
   * waitingUserApproval, the first of which was dead — it was overwritten by
   * the second on the very next line — and "confirmed" reported whichever
   * message the previous action happened to leave behind.
   */
  const title = (): string => {
    switch (transactionState) {
      case "waitingWalletConnection":
        return "Waiting for your wallet…";
      case "connected":
        return "Wallet connected. Please retry the action.";
      case "waitingUserApproval":
        return "Approve the transaction in your wallet";
      case "waitingBlockchainConfirmation":
        return "Confirming…";
      case "confirmed":
        // Set by the action itself, so it names what actually happened.
        return message ?? "Done";
      case "txRejected":
        return "Transaction was rejected";
      case "failedConfirmation":
        return "Transaction failed. Please try again or contact support.";
      case "connectionRejected":
        return "Connection rejected. Connect your wallet to the correct network and try again.";
      default:
        return "";
    }
  };

  const isLoading = () => {
    var isLoading = false;
    if (pathname == "/myLand" || pathname == "testnet/myLand") {
      isLoading = true;
    }
    if (pathname == "/explore" || pathname == "testnet/explore") {
      if (selectedLand) {
        isLoading = true;
      }
    }
    return isLoading;
  };

  return (
    <>
      {pathname != "/" && (
        <>
          {isUserDataLoading && address && isLoading() && (
            <div className=" popUpStatus ">
              <div className="flex flex-grow relative">
                {/* <Spinner color="success" size="lg" className='customSpinner ml-auto mr-auto absolute w-full mt-auto h-full '/> */}
                <div className="flex ml-auto mr-auto w-full h-full  mt-auto mb-auto  absolute ">
                  <div className="spinner mt-auto mb-auto  ml-auto mr-auto "></div>
                </div>
                <div className="flex ml-auto mr-auto w-11 h-auto  mt-auto mb-auto  relative ">
                  <PlotwarMark size={44} />
                </div>
              </div>
            </div>
          )}
          {isUserDataLoading && address && pathname.includes("myLand") && (
            <div className=" popUpStatus">
              <div className="flex flex-grow relative">
                {/* <Spinner color="success" size="lg" className='customSpinner ml-auto mr-auto absolute w-full mt-auto h-full '/> */}
                <div className="flex ml-auto mr-auto w-full h-full  mt-auto mb-auto  absolute ">
                  <div className="spinner mt-auto mb-auto  ml-auto mr-auto "></div>
                </div>
                <div className="flex ml-auto mr-auto w-11 h-auto  mt-auto mb-auto  relative ">
                  <PlotwarMark size={44} />
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
              {transactionState == "confirmed" && successLink && (
                <h3 className="px-[10%]  mt-4 text-center !text-white font-semibold">
                  Visit{" "}
                  <a
                    className=" hover:text-[#98FBD7] underline cursor-pointer"
                    href={successLink.href}
                  >
                    {successLink.label}
                  </a>{" "}
                </h3>
              )}
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
                    <PlotwarMark size={44} />
                  </div>
                </div>
              )}
              {transactionState != "waitingBlockchainConfirmation" ? (
                <div className="mt-auto px-3 py-3 flex flex-shrink">
                  {" "}
                  <button
                    onClick={() => {
                      // Just dismiss. The refresh now happens the moment the
                      // transaction confirms, in handleResult — doing it again
                      // here meant every action refetched the whole explorer
                      // log twice and reloaded the screen a second time.
                      setTransactionState(null);
                      setMessage(null);
                      setSuccessLink(null);
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
      )}
    </>
  );
}
