"use client"
import { DEFAULT_TESTNET, routeFor } from "@/lib/deployments";
import { useChainId, useSwitchChain } from "@thirdweb-dev/react";
import { Sepolia, Base } from "@thirdweb-dev/chains";
import React, { useState } from "react";
import Router from "next/router";
import { usePathname, useRouter } from "next/navigation";

export default function ChainIdButton() {
  const [isNotifActive, setIsNotifActive] = useState(false);
  const chainId = useChainId();
  const switchChain = useSwitchChain();
  const router = useRouter()
  const currentRoute = usePathname()

  const switchMainnet = async () => {
    try {
      await switchChain(Base.chainId);
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
    if (chainId == Base.chainId) {
      status = "Mainnet";
    }
    return status;
  };
  // !bg-[#06291D]/30 
  return (
    <>
    { currentRoute != "/" &&
      <div className="flex flex-col  top-[0.45rem] right-[14rem] z-400">
        <button
          onClick={() => setIsNotifActive(!isNotifActive)}
          data-open={isNotifActive}
          className="pwNavGhost min-w-[8rem]"
        >
          {chainIdStatus()}
        </button>
        <div
          className={`overflow-hidden transition-max-height duration-300  ${
            isNotifActive ? "max-h-40" : "hidden "
          }`}
        >
          <div
            className={` pwNavPanel darkShadow w-[12rem] absolute mt-2 py-2 px-1 max-h-40 gap-1 flex flex-col`}
          >
            <a onClick={() => {switchMainnet(),router.push("/explore"),setIsNotifActive(false)}} className="px-3 py-2 cursor-pointer hover:bg-[color:var(--pw-accent)] hover:!text-[color:var(--pw-on-accent)] transition-all">
              Base (Mainnet)
            </a>
            <a onClick={() => {switchTestnet(),router.push(routeFor(DEFAULT_TESTNET, "explore")),setIsNotifActive(false)}} className="px-3 py-2 cursor-pointer hover:bg-[color:var(--pw-accent)] hover:!text-[color:var(--pw-on-accent)] transition-all">
              Sepolia (Testnet)
            </a>
          </div>
        </div>
      </div>
     }
    </>
  );
}
