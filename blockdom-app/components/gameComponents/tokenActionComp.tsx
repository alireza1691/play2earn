"use client";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townAddress } from "@/lib/blockchainData";
import { bmtPInst } from "@/lib/instances";
import { formattedNumber } from "@/lib/utils";
import PlotCoin from "@/svg/plotCoin";
import CloseIcon from "@/svg/closeIcon";
import { useAddress } from "@thirdweb-dev/react";
import { BigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";

export default function TokenActionComp() {
  const {
    tokenCompTab,
    setTokenCompTab,
    selectedWindowComponent,
    setSelectedWindowComponent,
  } = useSelectedWindowContext();
  const [isDeposit, setIsDeposit] = useState(true);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [enteredAmount, setEnteredAmount] = useState(0);
  const address = useAddress();
  const { approve, deposit, withdraw, faucet } = useBlockchainUtilsContext();
  const { plotBalance } = useUserDataContext();

  const handleApprove = async () => {
    const approvedAm = await approve(enteredAmount);
    setApprovedAmount(approvedAm);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        if (address) {
          const inst = bmtPInst;
          const allowance: BigNumberish = await inst.allowance(
            address,
            townAddress
          );
          console.log("allowance:", formatEther(allowance));
          setApprovedAmount(Number(formatEther(allowance)));
        }
      } catch (error) {}
    };
    getData();
  }, [address]);

  return (
    <>
      {selectedWindowComponent == "tokenActions" && (
        <section className="z-40 absolute h-[70dvh] lg:h-[80dvh] w-[91dvw] lg:w-[25rem] top-[8rem] lg:left-9 left-1/2 -translate-x-1/2 lg:-translate-x-0 tokenActionBg flex flex-col">
          <div className="h-[2rem] rounded-[4px] px-3 py-1 blueText bg-[#0D0F12]/85 flex flex-row items-center justify-between">
            <h3>PLOT</h3>
            <button
              onClick={() => setSelectedWindowComponent(null)}
              className=" hover:bg-white/10 rounded-[4px] p-1 transition-all"
            >
              {" "}
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-row  justify-center gap-4 py-4">
            <button
              onClick={() => setTokenCompTab("deposit/withdraw")}
              data-active={tokenCompTab == "deposit/withdraw"}
              className="pwTab"
            >
              Deposit/Withdraw
            </button>
            <button
              onClick={() => setTokenCompTab("faucet")}
              data-active={tokenCompTab == "faucet"}
              className="pwTab"
            >
              Faucet
            </button>
          </div>
          <div className=" px-4 flex flex-col gap-4 flex-grow">
            {tokenCompTab == "deposit/withdraw" && (
              <>
                <button
                  onClick={() => setIsDeposit(!isDeposit)}
                  className=" blueText py-2 px-3 rounded-[4px] bg-[#0D0F12]/85 hover:brightness-125"
                >
                  {isDeposit ? "Deposit" : "Withdraw"}
                </button>
                <div className="inputBg flex flex-row py-1 px-2 gap-2">
                  <PlotCoin size={32} />
                  <input
                    type="number"
                    onChange={(event) =>
                      setEnteredAmount(Number(event.target.value))
                    }
                    // style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    className=" bg-transparent w-full focus:outline-none"
                    placeholder="Enter amount..."
                  />
                </div>
                <div className="flex mt-auto flex-col  px-3">
                  <p className="balBg px-3 py-2 blueText text-[14px] !font-normal">
                    Before deposit token you need to approve to spend token
                  </p>
                </div>
              </>
            )}
            {tokenCompTab == "faucet" && (
              <div className="flex mt-auto flex-col  px-3">
                <p className="balBg px-3 py-2 blueText text-[14px] !font-normal">
                  Claim test PLOT and conver them to Gold/Food (Convert them in
                  townhall).
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-row  px-3 py-3 gap-3 !h-fit">
            <button
              onClick={() => handleApprove()}
              disabled={
                approvedAmount > 0 ||
                !isDeposit ||
                tokenCompTab !== "deposit/withdraw"
              }
              className="outlineGreenButton !w-1/2"
            >
              Approve
            </button>
            {tokenCompTab == "deposit/withdraw" && isDeposit && (
              <button
                onClick={() => deposit(approvedAmount)}
                disabled={approvedAmount <= 0}
                className="greenButton !w-1/2"
              >
                Deposit
              </button>
            )}
            {tokenCompTab == "deposit/withdraw" && !isDeposit && (
              <button
                onClick={() => withdraw(approvedAmount)}
                disabled={
                  enteredAmount > Number(formattedNumber(plotBalance || 0))
                }
                className="greenButton !w-1/2"
              >
                Withdraw
              </button>
            )}
            {tokenCompTab == "faucet" && (
              <button onClick={() => faucet()} className="greenButton !w-1/2">
                Get PLOT
              </button>
            )}
          </div>
        </section>
      )}
    </>
  );
}
// {isDeposit && activeInput == "Deposit/Withdraw" ?
// <>
//   <button onClick={() => handleApprove()} disabled={approvedAmount > 0} className="greenButton !py-2 !px-3 !text-[14px]">Approve</button>
//   <button onClick={() => deposit(approvedAmount)} disabled={approvedAmount <= 0} className="greenButton !py-2 !px-3 !text-[14px]">Execute</button>
//   </>
// :
// <button onClick={() => buttonAction()} disabled={isDisable()} className="greenButton !py-2 !px-3 !text-[14px]">Submit</button>
// }
