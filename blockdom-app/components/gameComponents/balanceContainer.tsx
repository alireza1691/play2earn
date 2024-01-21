"use client"
import { useUserDataContext } from '@/context/user-data-context'
import { formattedNumber } from '@/lib/utils'
import BMTIcon from '@/svg/bmtIcon'
import CoinIcon from '@/svg/coinIcon'
import FoodIcon from '@/svg/foodIcon'
import HammerIcon from '@/svg/hammerIcon'
import SmBMTIcon from '@/svg/smBMTIcon'
import SmCoinIcon from '@/svg/smCoinIcon'
import SmFoodIcon from '@/svg/smFoodIcon'
import SmHammerIcon from '@/svg/smHammerIcon'
import { BigNumber, BigNumberish } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function BalanceContainer() {
  const { inViewLand, BMTBalance} = useUserDataContext()

  const pathname = usePathname()

  const formatRemainedTime = (remainedTime: number): string => {
    const days = Math.floor(remainedTime / (24 * 60));
    const hours = Math.floor((remainedTime % (24 * 60)) / 60);
    const minutes = remainedTime % 60;
  
    const parts = [];
  
    if (days > 0) {
      parts.push(`${days} d`);
    }
  
    if (hours > 0 ) {
      parts.push(`${hours} h`);
    }
  
    if (minutes > 0 && days == 0) {
      parts.push(`${minutes} min`);
    }
  
    return parts.length > 0 ? parts.join(' ') : '0 min';
  };
  
  const workerStatus = ():string  => {
    if (inViewLand && Number(inViewLand.remainedBuildTime) == 0 ) {
      return "Ready"
    } 
    if (inViewLand && Number(inViewLand.remainedBuildTime) > 0 ) {
      const remainedTime = Number(inViewLand.remainedBuildTime)
      return formatRemainedTime(remainedTime)
 
    } else {
      return "..."
    }
    // {inViewLand && Number(inViewLand.remainedBuildTime) > 0 && Number(inViewLand.remainedBuildTime)} {inViewLand && Number(inViewLand.remainedBuildTime) == 0 && "Ready"}

  }


  return (
    <>
    {pathname != "/" && 
    <>
    <div className={`${pathname.includes("myLand") ? " " : "ml-4 "} z-30 flex flex-row absolute top-[80px] justify-around gap-4 w-full px-4 lg:w-auto`}>
    <h3 className={`${pathname.includes("myLand") ? "flex-1" : "w-[10rem] absolute left-0 "} text-[#87F0E5] font-semibold text-[15px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1`}><BMTIcon/>{BMTBalance && formattedNumber(BMTBalance)}1</h3>
    {pathname.includes("myLand") && 
    <>
      <h3 className='flex-1 text-[#87F0E5] font-semibold text-[15px] lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-center px-2 py-1  '><FoodIcon/>{inViewLand && formattedNumber(inViewLand.goodsBalance[0])}</h3>
       <h3 className='flex-1 text-[#87F0E5] font-semibold text-[15px]  lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-center px-2 py-1 '><CoinIcon/>{inViewLand && formattedNumber(inViewLand.goodsBalance[1])}</h3>
       <h3 className='flex-1 text-[#87F0E5] font-semibold text-[15px]  lg:w-[10rem]  balBg flex flex-row gap-2 items-center justify-center px-2 py-1 '><HammerIcon/>{workerStatus()}</h3>
       
    </>
    }
  
    </div>
     {/* <div className=' z-30 flex flex-col p-1 absolute top-16 left-5 gap-4'>
     <div className=' greenBg'>
     <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><BMTIcon/>{BMTBalance && formattedNumber(BMTBalance)}</h3>

     </div>
     <div className=' hidden sm:flex greenBg'>
     <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 w-[12rem] '><FoodIcon/>{inViewLand && formattedNumber(inViewLand.goodsBalance[0])}</h3>
       <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><CoinIcon/>{inViewLand && formattedNumber(inViewLand.goodsBalance[1])}</h3>
       <h3 className='text-[#87F0E5] font-bold text-[14px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><HammerIcon/>{workerStatus()}</h3>
       
     </div>
   
   </div>
   <div className='flex sm:hidden z999 gap-1 left-1/2 top-1 fixed flex-row -translate-x-1/2'>
     <div className=' flex flex-col'>
     <h3 className='text-[#87F0E5] font-semibold text-[11px] navBalBg '><SmCoinIcon/>{inViewLand && formattedNumber(inViewLand.goodsBalance[0])}</h3>
       <h3 className='text-[#87F0E5] font-bold text-[11px] navBalBg  '><SmFoodIcon/>{inViewLand && formattedNumber(inViewLand.goodsBalance[1])}</h3>
  
     </div>
     <div className=' flex flex-col'>
     <h3 className='text-[#87F0E5] font-bold text-[11px] navBalBg  '><SmBMTIcon/>{BMTBalance && formattedNumber(BMTBalance)}</h3>
       <h3 className='text-[#87F0E5] font-bold text-[8px] navBalBg h-full'><SmHammerIcon/>{workerStatus()}</h3>
  
     </div>
  </div> */}
  </>
    }
    </>
  )
}
