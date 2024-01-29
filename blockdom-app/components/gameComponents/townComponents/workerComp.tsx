"use client";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import CloseIcon from "@/svg/closeIcon";
import React from "react";

export default function WorkerComp() {
  const { setSelectedWindowComponent, selectedWindowComponent } =
    useSelectedWindowContext();
  const { inViewLand } = useUserDataContext();

  const formatRemainedTime = (remainedTime: number): string => {
    const days = Math.floor(remainedTime / (24 * 60));
    const hours = Math.floor((remainedTime % (24 * 60)) / 60);
    const minutes = remainedTime % 60;

    const parts = [];

    if (days > 0) {
      parts.push(`${days} days and`);
    }

    if (hours > 0) {
      parts.push(`${hours} hours and`);
    }

    if (minutes > 0 && days == 0) {
      parts.push(`${minutes} minutes`);
    }

    return parts.length > 0 ? parts.join(" ") : "0 minutes remained";
  };

  const isDisable = () => {
    if (inViewLand && Number(inViewLand.remainedBuildTime) == 0) {
      return true;
    } else {
      return false;
    }
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
          <div className="h-[2rem] rounded-t-xl px-3 py-1 blueText bg-[#06291D80]/50 flex flex-row items-center justify-between">
            <h3>Worker</h3>
            <button
              onClick={() => setSelectedWindowComponent(null)}
              className=" hover:bg-white/10 rounded-lg p-1 transition-all cursor-pointer"
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
            <p className="text-[10px] text-white/70 font-light text-center">
              Pay 0 gold to finish building instantly
            </p>
            <button
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
