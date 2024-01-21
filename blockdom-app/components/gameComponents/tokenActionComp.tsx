"use client";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import BMTIcon from "@/svg/bmtIcon";
import CloseIcon from "@/svg/closeIcon";
import React, { useState } from "react";

export default function TokenActionComp() {
  const { tokenCompTab, setTokenCompTab } = useSelectedWindowContext();
  const [isDeposit, setIsDeposit] = useState(true)

  return (
    <section className="z-30 absolute h-[75dvh] w-[25rem] top-[9rem] left-10 tokenActionBg flex flex-col">
      <div className="h-[2rem] rounded-t-xl px-3 py-1 blueText bg-[#06291D80]/50 flex flex-row items-center justify-between">
        <h3>BMT</h3>
        <CloseIcon />
      </div>
      <div className="flex flex-row  justify-center gap-4 py-4">
        <button
          onClick={() => setTokenCompTab("deposit/withdraw")}
          className={` ${
            tokenCompTab == "deposit/withdraw"
              ? "bg-gradient-to-t from-[#213830]/50 to-[#5ECFA4]/50"
              : " bg-[#555555]/60"
          } py-2 px-4 rounded-full cursor-pointer hover:brightness-110 transition-all`}
        >
          Deposit/Withdraw
        </button>
        <button
          onClick={() => setTokenCompTab("faucet")}
          className={` ${
            tokenCompTab == "faucet"
              ? "bg-gradient-to-t from-[#213830]/50 to-[#5ECFA4]/50"
              : " bg-[#555555]/60"
          } py-2 px-4 rounded-full cursor-pointer hover:brightness-110 transition-all`}
        >
          Faucet
        </button>
      </div>
      <div className=" px-4 flex flex-col gap-4">
        <button onClick={() => setIsDeposit(!isDeposit)} className=" blueText py-2 px-3 rounded-md bg-[#06291D80]/50 hover:brightness-125">
         {isDeposit ? "Deposit" : "Withdraw"}
        </button>
        <div className="inputBg flex flex-row py-1 px-2 gap-2">
          <BMTIcon />
          <input
            className=" bg-transparent w-full"
            placeholder="Enter amount..."
          ></input>
        </div>
      </div>
      <div className="flex mt-auto flex-col  px-3">
        <p className="balBg px-3 py-2 blueText text-[14px] !font-normal">Before deposit token you need to approve to spend token</p>
      </div>
      <div className=" flex flex-row  px-3 py-3 gap-3 !h-fit">
        <button className="outlineGreenButton !w-1/2">Clear</button>
        <button className="greenButton !w-1/2">Submit</button>
      </div>
    </section>
  );
}
