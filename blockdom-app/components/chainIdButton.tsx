"use client";
import { useChainId, useSwitchChain } from "@thirdweb-dev/react";
import { Sepolia, Arbitrum } from "@thirdweb-dev/chains";
import React, { useState } from "react";

export default function ChainIdButton() {
  const [isNotifActive, setIsNotifActive] = useState(false);
  const chainId = useChainId();
  const switchChain = useSwitchChain();

  const switchMainnet = async () => {
    try {
      await switchChain(Arbitrum.chainId);
    } catch (error) {
      console.log("Network change failed");
    }
    setIsNotifActive(false)
  };
  const switchTestnet = async () => {
    try {
      await switchChain(Sepolia.chainId);
    } catch (error) {
      console.log("Network change failed");
    }
    setIsNotifActive(false)
  };

  const chainIdStatus = (): string => {
    let status = "Wrong network";
    if (chainId == Sepolia.chainId) {
      status = "Testnet";
    }
    if (chainId == Arbitrum.chainId) {
      status = "Mainnet";
    }
    return status;
  };

  return (
    <>
      <div className=" flex flex-col absolute top-[0.45rem] right-[14rem] ">
        <button
          onClick={() => setIsNotifActive(!isNotifActive)}
          className={`${
            isNotifActive ? "!bg-black/30" :" hover:brightness-110 "
          } !bg-[#06291D] !bg-opacity-50 py-3 px-3 rounded-xl `}
        >
          {chainIdStatus()}
        </button>
        <div
          className={`overflow-hidden transition-max-height duration-300 mt-1 ${
            isNotifActive ? "max-h-40" : "hidden "
          }`}
        >
          <div
            className={` w-[12rem] absolute py-2 px-1 chainIdDropDownBg rounded-lg   max-h-40 gap-1 flex  flex-col`}
          >
            <a onClick={() => {switchMainnet()}} className="px-3 py-1 cursor-pointer rounded-md hover:bg-[#98FBD7] hover:text-gray-900 transition-all">
              Arbitrum (Mainnet)
            </a>
            <a onClick={() => {switchTestnet()}} className="px-3 py-1 cursor-pointer rounded-md hover:bg-[#98FBD7] hover:text-gray-900 transition-all">
              Sepolia (Testnet)
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
