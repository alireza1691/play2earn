import BMTIcon from '@/svg/bmtIcon'
import CoinIcon from '@/svg/coinIcon'
import FoodIcon from '@/svg/foodIcon'
import HammerIcon from '@/svg/hammerIcon'
import React from 'react'

export default function BalanceContainer() {
  return (
    <div className='z-10 flex flex-col p-1 absolute top-20 left-5 greenBg '>
        <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 w-[12rem] '><FoodIcon/>10000</h3>
        <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><CoinIcon/>10000</h3>
        <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><BMTIcon/>10000</h3>
        <h3 className='text-[#87F0E5] font-bold text-[18px]  balBg flex flex-row gap-4 items-center justify-center px-4 py-1 '><HammerIcon/>Ready</h3>

        
    </div>
  )
}
