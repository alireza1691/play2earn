"use client"
import { useBlockchainUtilsContext } from '@/context/blockchain-utils-context';
import { useMapContext } from '@/context/map-context';
import { useSelectedWindowContext } from '@/context/selected-window-context';
import { useUserDataContext } from '@/context/user-data-context';
import CloseIcon from '@/svg/closeIcon'
import WalletIcon from '@/svg/walletIcon';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import React from 'react'

export default function AttackSmScreen() {

    const { selectedLand } = useMapContext();
    const { chosenLand, inViewLand, isUserDataLoading } = useUserDataContext();
    const { dispatchArmy } = useBlockchainUtilsContext();
    const currentRoute = usePathname();
    const router = useRouter();
    const isTestnet = currentRoute.includes("/testnet/");
  
    const { selectedWindowComponent, setSelectedWindowComponent, selectedArmy } =
      useSelectedWindowContext();
  
  return (
    <div className="flex sm:hidden flex-col  w-full h-full border-[#D4D4D4]/30 bg-[#21302A]/60  backdrop-blur-md  rounded-xl border">

    <div className=' justify-between bg-[#06291D80]/50 flex flex-row p-1 rounded-t-lg items-center'> <h2 className='p-1 blueText !font-normal !text-[16px]'>Attack</h2> <button className='p-1 rounded-lg hover:bg-white/10 active:bg-[#98FBD7]/30'><CloseIcon/></button></div>
    <div className=' flex flex-row'>
        <div className='balBg flex flex-row'><WalletIcon/></div>
    </div>
    <div></div>
    <div className=' absolute bottom-0 p-2 gap-2 flex flex-row  object-bottom w-full'><button className=' greenButton !w-1/2'>Submit</button><button className='!w-1/2 greenButton'>Submit</button></div>
    </div>

  )
}
