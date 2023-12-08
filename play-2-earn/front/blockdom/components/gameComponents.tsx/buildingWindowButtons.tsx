import React from "react";

export default function BuildingWindowButtons() {
  const earnedAmount = 12340;
  return (
    <div className="w-full mt-auto flex flex-col">
      <div className="w-full px-3">
        {" "}
        <button className="greenButton !w-full">Claim {earnedAmount}</button>
      </div>

      <div className=" flex flex-row p-3 gap-2">
        <button className="redButton !w-[50%]">Cancel</button>
        <button className="greenButton !w-[50%]">Upgrade</button>
      </div>
    </div>
  );
}
