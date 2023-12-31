"use client"
import { useUserDataContext } from '@/context/user-data-context'
import BMTIcon from '@/svg/bmtIcon'
import CoinIcon from '@/svg/coinIcon'
import FoodIcon from '@/svg/foodIcon'
import HammerIcon from '@/svg/hammerIcon'
import { formatEther, parseEther } from 'ethers/lib/utils'
import React from 'react'

export default function BalanceContainer() {
  const { inViewLand} = useUserDataContext()

  const formatRemainedTime = (remainedTime: number): string => {
    const days = Math.floor(remainedTime / (24 * 60));
    const hours = Math.floor((remainedTime % (24 * 60)) / 60);
    const minutes = remainedTime % 60;
  
    const parts = [];
  
    if (days > 0) {
      parts.push(`${days} d`);
    }
  
    if (hours > 0) {
      parts.push(`${hours} h`);
    }
  
    if (minutes > 0) {
      parts.push(`${minutes} min`);
    }
  
    return parts.length > 0 ? parts.join(' ') : '0 minutes';
  };
  
  const workerStatus = ():string  => {
    if (inViewLand && Number(inViewLand.remainedBuildTime) == 0 ) {
      "Ready"
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
    <div className='z-30 flex flex-col p-1 absolute top-16 left-5 gap-4'>
      <div className=' greenBg'>
      <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><BMTIcon/>{inViewLand && formatEther(inViewLand.goodsBalance[1]) }</h3>

      </div>
      <div className=' greenBg'>
      <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 w-[12rem] '><FoodIcon/>{inViewLand && formatEther(inViewLand.goodsBalance[0])}</h3>
        <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><CoinIcon/>{inViewLand && formatEther(inViewLand.goodsBalance[1])}</h3>
        <h3 className='text-[#87F0E5] font-bold text-[14px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><HammerIcon/>{workerStatus()}</h3>
        
      </div>
    
    </div>
  )
}
