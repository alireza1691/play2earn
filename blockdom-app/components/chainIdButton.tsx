"use client";
import { useChainId, useSwitchChain } from "@thirdweb-dev/react";
import { Sepolia, Arbitrum ,Polygon} from "@thirdweb-dev/chains";
import React, { useState } from "react";
import Router from "next/router";
import { useRouter } from "next/navigation";

export default function ChainIdButton() {
  const [isNotifActive, setIsNotifActive] = useState(false);
  const chainId = useChainId();
  const switchChain = useSwitchChain();
  const router = useRouter()

  const switchMainnet = async () => {
    try {
      await switchChain(Polygon.chainId);
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
    if (chainId == Polygon.chainId) {
      status = "Mainnet";
    }
    return status;
  };
  // !bg-[#06291D]/30 
  return (
    <>
      <div className="flex flex-col  top-[0.45rem] right-[14rem] ">
        <button
          onClick={() => setIsNotifActive(!isNotifActive)}
          className={`${
            isNotifActive ? "!bg-black/20  " :" hover:brightness-110 "
          } border border-[#98FBD7] text-[14px] text-[#98FBD7] !bg-opacity-50 py-[12px] px-3 rounded-xl `}
        >
          {chainIdStatus()}
        </button>
        <div
          className={`overflow-hidden transition-max-height duration-300  ${
            isNotifActive ? "max-h-40" : "hidden "
          }`}
        >
          <div
            className={` darkShadow w-[12rem] absolute py-2 px-1 chainIdDropDownBg rounded-lg   max-h-40 gap-1 flex  flex-col`}
          >
            <a onClick={() => {switchMainnet(),router.push("/explore"),setIsNotifActive(false)}} className="px-3 py-1 cursor-pointer rounded-md hover:bg-[#98FBD7] hover:text-gray-900 transition-all">
              Polygon (Mainnet)
            </a>
            <a onClick={() => {switchTestnet(),router.push("/testnet/explore"),setIsNotifActive(false)}} className="px-3 py-1 cursor-pointer rounded-md hover:bg-[#98FBD7] hover:text-gray-900 transition-all">
              Sepolia (Testnet)
            </a>
          </div>
        </div>
      </div>
     
    </>
  );
}
