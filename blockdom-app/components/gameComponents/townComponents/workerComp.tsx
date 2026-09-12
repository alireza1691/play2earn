"use client";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { isRewrite, useDeployment } from "@/lib/deployments";
import CloseIcon from "@/svg/closeIcon";
import { formatEther } from "ethers/lib/utils";
import React from "react";

export default function WorkerComp() {
  const { setSelectedWindowComponent, selectedWindowComponent } =
    useSelectedWindowContext();
  const { inViewLand } = useUserDataContext();
  const { finishNow } = useBlockchainUtilsContext();
  const deployment = useDeployment();

  const plural = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? "" : "s"}`;

  /**
   * Every unit carried its own trailing "and", so anything that ended on the
   * largest unit read "2 days and" or "1 hours and" with nothing after it. The
   * joining word belongs between the parts, not inside them.
   */
  const formatRemainedTime = (remainedTime: number): string => {
    const days = Math.floor(remainedTime / (24 * 60));
    const hours = Math.floor((remainedTime % (24 * 60)) / 60);
    const minutes = remainedTime % 60;

    const parts = [];
    if (days > 0) parts.push(plural(days, "day"));
    if (hours > 0) parts.push(plural(hours, "hour"));
    // Minutes are noise next to a multi-day wait, but they are the whole
    // message when they are all that is left.
    if (minutes > 0 && days === 0) parts.push(plural(minutes, "minute"));

    if (parts.length === 0) return "0 minutes remained";
    if (parts.length === 1) return parts[0];
    return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  };

  /** Gold to skip the remaining wait. See the note beside where it is shown. */
  const finishCost = (): number =>
    inViewLand ? Number(inViewLand.remainedBuildTime) : 0;

  /** A land's stored balance is in wei; the cost above is in whole gold. */
  const balance = (index: 0 | 1): number =>
    inViewLand ? Number(formatEther(inViewLand.goodsBalance[index])) : 0;

  /**
   * Why the player cannot finish early, or null if they can.
   *
   * The gold check is the real one. The food check exists because the Town
   * deployed on the v3 addresses gates finishNow on the food balance while
   * deducting the cost from gold — so on v3 a player needs both, and sending
   * the transaction without enough food only buys them a revert. v4's
   * finishNow spends gold through _spendGoods and has no such requirement.
   */
  const blockedReason = (): string | null => {
    if (!inViewLand) return "Loading…";
    if (finishCost() === 0) return null;
    if (balance(1) < finishCost()) return "Not enough gold";
    if (!isRewrite(deployment) && balance(0) < finishCost()) return "Not enough food";
    return null;
  };

  const isDisable = () => {
    if (inViewLand && Number(inViewLand.remainedBuildTime) == 0) {
      return true;
    }
    return blockedReason() !== null;
  };

  const workerStatus = (): string => {
    if (inViewLand && Number(inViewLand.remainedBuildTime) == 0) {
      return "Worker is ready";
    }
    if (inViewLand && Number(inViewLand.remainedBuildTime) > 0) {
      const remainedTime = Number(inViewLand.remainedBuildTime);
      return formatRemainedTime(remainedTime);
    } else {
      return "...";
    }
    // {inViewLand && Number(inViewLand.remainedBuildTime) > 0 && Number(inViewLand.remainedBuildTime)} {inViewLand && Number(inViewLand.remainedBuildTime) == 0 && "Ready"}
  };

  return (
    <>
      {selectedWindowComponent == "workerComp" && (
        <div className=" flex flex-col absolute z-100 h-[10rem] w-[20rem] tokenActionBg left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ">
          <div className="h-[2rem] rounded-[4px] px-3 py-1 blueText bg-[#0D0F12]/85 flex flex-row items-center justify-between">
            <h3>Worker</h3>
            <button
              onClick={() => setSelectedWindowComponent(null)}
              className=" hover:bg-white/10 rounded-[4px] p-1 transition-all cursor-pointer"
            >
              {" "}
              <CloseIcon />
            </button>
          </div>
          <div className=" flex flex-col p-2 h-full gap-3">
            <h3 className=" text-center">{workerStatus()}</h3>
          </div>
          <div className="p-2 flex flex-col justify-center w-full  bottom-0 absolute gap-1">
            {" "}
            {/*
              The 0 here was literal text, not a figure — nothing in this
              component ever asked what finishing costs.

              Town.getFinishCost is (remaining seconds / 1 minute) x
              WorkerGoldPerMinute, and WorkerGoldPerMinute is 1 gold, so the
              cost in gold is exactly the number of whole minutes left — which
              getRemainedBuildTimestamp already gives us, floored the same way.
              Reading it off that avoids a second call, and works on the v3
              deployment too, whose Town has no getFinishCost to ask.
            */}
            <p className="text-[10px] text-white/70 font-light text-center">
              {blockedReason() && finishCost() > 0
                ? `${blockedReason()} — ${finishCost()} gold needed to finish instantly`
                : `Pay ${finishCost()} gold to finish building instantly`}
            </p>
            <button
              onClick={() => finishNow()}
              disabled={isDisable()}
              className="!w-full greenButton !py-2"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
}
