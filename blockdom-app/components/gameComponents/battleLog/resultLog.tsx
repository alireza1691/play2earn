import { warriorsInfo } from '@/lib/data'
import CoinIcon from '@/svg/coinIcon'
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
    isAttack:boolean
}
export default function ResultLog({from, to,success, lootedAmounts,isAttack}: ResultLogProps) {
  return (
   
<div className="logBg flex flex-col"
>
<div className="  flex flex-col md:flex-row ">
  <div className=" flex flex-col md:max-w-[60%] ">
    <div className="flex flex-col md:flex-row px-3  items-center gap-2 ">
      <h3 className="mt-3 md:mt-0 md:items-center gap-2 text-[#98FBD7] flex flex-row text-[16px] font-light">
        <span className=" font-bold">Defender: </span>{" "}
        {to}
        <OpenIcon />{" "}
      </h3>
      <h3 className=" md:items-center gap-2 text-[#98FBD7] flex flex-row text-[16px] font-light">
        <span className="ml-3 font-semibold">Land:</span>
        {from}
      </h3>
      {/* <h3 className=" text-[12px] font-light ml-4 mb-3 md:mb-0">
        Time: 11/10/2023 22:30
      </h3> */}
    </div>
    <div className="px-3 md:px-0 flex md:flex-row flex-col  h-full justify-around items-center gap-6 w-full">
      <div className=" flex w-full  md:w-[42.5%]  bg-white/10 p-1 rounded-md overflow-x-scroll custom-scrollbar">
        <div className="flex flex-row  h-full w-auto gap-2">
          {warriorsInfo.map((warrior, key) => (
            <div key={key} className="h-full w-max relative">
          
              <Image
                src={warrior.image}
                className=" glassBg p-[2px] h-full w-auto"
                width={40}
                height={60}
                alt="warrior"
              />
            </div>
          ))}
        </div>
      </div>
      <WinIcon />
      <div className=" flex  w-full  md:w-[42.5%] overflow-x-scroll bg-white/10 p-1 rounded-md custom-scrollbar">
        <div className="flex flex-row  h-full w-auto gap-2">
          {warriorsInfo.map((warrior, key) => (
            <React.Fragment key={key}>
              <Image
                src={warrior.image}
                className="glassBg p-[2px] h-full w-auto"
                width={40}
                height={20}
                alt="warrior"
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  </div>
  <AttackLogAction isAttack={isAttack} lootedFood={lootedAmounts[0]} lootedGold={lootedAmounts[1]}/>

</div>
<div className="hidden md:flex lg:hidden flex-row py-3 px-3 gap-3 rounded-b-lg items-center">
  <h3 className="blueText mr-10">Looted resources:</h3>
  <h3 className="balBg flex flex-row items-center px-3 gap-3"><CoinIcon/>1000</h3>
  <h3 className="balBg flex flex-row items-center px-3 gap-3"><FoodIcon/>1000</h3>
</div>
</div>
  )
}


type LogActionProps = {
    isAttack: boolean,
    lootedGold: number,
    lootedFood:number
}
export const AttackLogAction = ({isAttack,lootedFood,lootedGold}:LogActionProps) => {
    return (
      <div className=" ml-auto  h-full flex flex-col md:flex-row gap-2 py-2 px-2">
        <div className=" flex flex-col gap-2 w-[182px]">
          <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
            {" "}
            <CoinIcon /> <p>{lootedGold}</p>
          </div>
          <div className="balBg  px-4 py-2 flex flex-row justify-start gap-4 items-center">
            <FoodIcon />
            <p>{lootedFood}</p>{" "}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-[182px]">
          <a className="logResultBg px-3 text-center py-3">Attack again</a>
          <a className="logResultBg px-3 text-center  py-3">You won</a>
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
            <CoinIcon /> <p>12312</p>
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