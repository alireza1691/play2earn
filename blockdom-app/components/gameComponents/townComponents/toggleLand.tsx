"use client"
import { useUserDataContext } from '@/context/user-data-context';
import React, { useState } from 'react'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

export default function ToggleLand() {
  const [isNotifActive,setIsNotifActive] = useState(false)
    const { ownedLands, inViewLand, setChosenLand,setIsUserDataLoading } = useUserDataContext();
  return (
 <> <div
 className={`max-w-[15rem]  overflow-hidden transition-max-height duration-300 mt-1 absolute bottom-[110px] z-30 w-[50%] left-1/2 -translate-x-1/2 ${
     isNotifActive ? 'max-h-40' : 'max-h-0'
 }`}
>
     {/* <div className='z-10 absolute bottom-10 p-2 darkGreenBg w-[12rem] left-1/2 -translate-x-1/2'>{ownedLands && ownedLands[0].tokenId}</div> */}

 <div className={`max-w-[15rem] py-2 px-1 greenBg overflow-y-scroll notification-scrollbar max-h-40 gap-1 flex flex-col-reverse`}>
  {ownedLands?.map((land, key) => (
     <a className=' cursor-pointer hover:bg-white/10 rounded-md px-2' key={key} onClick={() => {setChosenLand(land),setIsNotifActive(false),setIsUserDataLoading(true);
     }}>{land.tokenId}</a>
  ))}
     {/* <Notif from="101101" notifMsg='Land minted' />
     <Notif from="101101" notifMsg='Town created' />
     <Notif from="101101" notifMsg='Worker is ready' /> */}
 </div>
</div>
    <button
        onClick={() => {setIsNotifActive(!isNotifActive)}}
        className={`max-w-[15rem] z-10 absolute bottom-[70px] flex flex-row items-center left-1/2 -translate-x-1/2  justify-between w-[50%] px-4 py-2 greenBg blueText !font-normal !text-[16px] focus:outline-none transition-colors duration-300 hover:brightness-105`}
      >
       Land {inViewLand?.tokenId} {!isNotifActive ? <IoIosArrowUp/> : <IoIosArrowDown/>}
      </button>
     
    </>
  )
}
