import BattleLogIcon from '@/svg/battleLogIcon';
import ExploreIcon from '@/svg/exploreIcon';
import MyLandIcon from '@/svg/myLandIcon';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function NavbarGameItems() {

    const router = useRouter()
  return (
    <div className="hidden  md:flex md:gap-x-10 translate-x-[30%] ">
          
    <a
      onClick={() => {
        router.push("/explore");
      }}
      className=" flex flex-col justify-center items-center transition-all hover:bg-black/10 p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 text-gray-800 dark:text-gray-50"
    >
      <ExploreIcon/>
      Explore
    </a>
    <a
      href="#"
      className=" flex flex-col justify-center items-center text-sm transition-all hover:bg-black/10 p-2 rounded-lg  font-semibold leading-6 text-gray-800 dark:text-gray-50"
    >
      <MyLandIcon/>
      My land
    </a>
    <a
      onClick={() => {router.push("/battleLog");}}
      className=" flex flex-col justify-center items-center cursor-pointer transition-all p-2  text-sm  rounded-lg font-semibold leading-6 text-gray-800 dark:text-gray-50"
    >
             <BattleLogIcon/>
      Battle log

    </a>
  </div>
  )
}
