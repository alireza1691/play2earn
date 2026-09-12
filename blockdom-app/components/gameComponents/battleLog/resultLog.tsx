import { warriorsInfo } from '@/lib/data'
import GoldIcon from "@/svg/goldIcon";
import FoodIcon from '@/svg/foodIcon'
import OpenIcon from '@/svg/openIcon'
import WinIcon from '@/svg/winIcon'
import Image from 'next/image'
import React from 'react'

type ResultLogProps = {
    from:number,
    to: number,
    success: boolean,
    lootedAmounts: number[],
    isAttack:boolean,
    /** Per warrior type; absent when the companion events were not in range. */
    attackerArmy?: number[],
    attackerLosses?: number[],
    defenderLosses?: number[],
    attackerSurvivingPercent?: number,
}

/**
 * One side's warriors, with what it brought and what it lost.
 *
 * The row used to draw all six types at a flat size whatever the battle was, so
 * it said nothing about who actually fought. Types nobody sent are dropped, and
 * the losses sit on the portrait rather than in a separate legend.
 */
const ArmyRow = ({
  counts,
  losses,
  label,
}: {
  counts?: number[];
  losses?: number[];
  label: string;
}) => {
  const present = warriorsInfo
    .map((warrior, i) => ({ warrior, i, sent: counts?.[i] ?? 0 }))
    .filter((entry) => entry.sent > 0);

  if (!counts || present.length === 0) {
    return (
      <div className="flex w-full md:w-[42.5%] bg-white/10 p-2 rounded-[4px]">
        <p className="text-[11px] text-white/40">{label}: not recorded</p>
      </div>
    );
  }

  const totalSent = present.reduce((sum, e) => sum + e.sent, 0);
  const totalLost = present.reduce((sum, e) => sum + (losses?.[e.i] ?? 0), 0);

  return (
    <div className="flex flex-col w-full md:w-[42.5%] bg-white/10 p-1 rounded-[4px] gap-1">
      <div className="flex flex-row justify-between px-1">
        <span className="text-[10px] text-white/50">{label}</span>
        <span className="text-[10px] text-white/70">
          {totalSent}
          {losses && (
            <span className="text-[color:var(--pw-loss,#E8767C)]">
              {" "}
              −{totalLost}
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-row h-full w-auto gap-2 overflow-x-scroll custom-scrollbar">
        {present.map(({ warrior, i, sent }) => {
          const lost = losses?.[i] ?? 0;
          return (
            <div key={i} className="h-full w-max relative shrink-0" title={warrior.name}>
              <Image
                src={warrior.image}
                className="glassBg p-[2px] h-full w-auto"
                width={40}
                height={60}
                alt={warrior.name}
              />
              <h3 className="text-[12px] text-black absolute w-full text-center bottom-0 balHighlight">
                {sent}
              </h3>
              {lost > 0 && (
                <h3 className="text-[10px] absolute top-0 right-0 px-1 rounded-bl bg-black/70 text-[#E8767C]">
                  −{lost}
                </h3>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ResultLog({from, to,success, lootedAmounts,isAttack, attackerArmy, attackerLosses, defenderLosses, attackerSurvivingPercent}: ResultLogProps) {
  return (
   
<div className="logBg flex flex-col"
>
<div className="  flex flex-col md:flex-row ">
  <div className=" flex flex-col md:max-w-[60%] ">
    <div className="flex flex-col md:flex-row px-3  items-center gap-2 ">
      <h3 className="mt-3 md:mt-0 md:items-center gap-2 text-[color:var(--pw-accent)] flex flex-row text-[16px] font-light">
        <span className=" font-bold">Defender: </span>{" "}
        {to}
        <OpenIcon />{" "}
      </h3>
      <h3 className=" md:items-center gap-2 text-[color:var(--pw-accent)] flex flex-row text-[16px] font-light">
        <span className="ml-3 font-semibold">Land:</span>
        {from}
      </h3>
      {/* <h3 className=" text-[12px] font-light ml-4 mb-3 md:mb-0">
        Time: 11/10/2023 22:30
      </h3> */}
    </div>
    <div className="px-3 md:px-0 flex md:flex-row flex-col  h-full justify-around items-center gap-6 w-full">
      <ArmyRow counts={attackerArmy} losses={attackerLosses} label="Attacker" />
      <WinIcon />
      {/* The defender's roster is not in the logs — only what it lost — so the
          casualties are shown on their own rather than implied by a full row. */}
      <ArmyRow counts={defenderLosses} losses={defenderLosses} label="Defender losses" />
    </div>
  </div>
  <AttackLogAction isAttack={isAttack} success={success} lootedFood={lootedAmounts[0]} lootedGold={lootedAmounts[1]}/>

</div>
<div className="flex flex-row py-3 px-3 gap-3 rounded-b-lg items-center flex-wrap">
  <h3 className="blueText mr-4">
    {success ? "Looted:" : "Nothing looted — the attack failed"}
  </h3>
  {success && (
    <>
      <h3 className="balBg flex flex-row items-center px-3 gap-3"><GoldIcon />{lootedAmounts[1]}</h3>
      <h3 className="balBg flex flex-row items-center px-3 gap-3"><FoodIcon/>{lootedAmounts[0]}</h3>
    </>
  )}
  {attackerSurvivingPercent !== undefined && (
    <h3 className="text-[11px] text-white/60 ml-auto">
      {attackerSurvivingPercent}% of the attacking army walked away
    </h3>
  )}
</div>
</div>
  )
}


type LogActionProps = {
    isAttack: boolean,
    lootedGold: number,
    lootedFood:number,
    success: boolean
}
export const AttackLogAction = ({isAttack,lootedFood,lootedGold,success}:LogActionProps) => {
    return (
      <div className=" ml-auto  h-full flex flex-col md:flex-row gap-2 py-2 px-2">
        <div className=" flex flex-col gap-2 w-[182px]">
          <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
            {" "}
            <GoldIcon /> <p>{lootedGold}</p>
          </div>
          <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
            <FoodIcon />
            <p>{lootedFood}</p>{" "}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-[182px]">
          <a className="logResultBg px-3 text-center py-3">Attack again</a>
          {/* Read the outcome off the event rather than always claiming a win. */}
          <a className="logResultBg px-3 text-center  py-3">
            {isAttack
              ? success ? "You won" : "You lost"
              : success ? "You lost" : "You held"}
          </a>
        </div>
      </div>
    );
  };
  export const DefenseLogAction = () => {
    return (
      <div className=" ml-auto  h-full flex flex-col md:flex-row gap-2 py-2 px-2">
        <div className=" flex flex-col gap-2 w-[182px]">
          <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
            {" "}
            <GoldIcon /> <p>12312</p>
          </div>
          <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
            <FoodIcon />
            <p>12312234</p>{" "}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-[182px]">
          <a className="logResultBg px-3 text-center py-3">You won</a>
          <a className="logResultBg px-3 text-center  py-3">You won</a>
        </div>
      </div>
    );
  };