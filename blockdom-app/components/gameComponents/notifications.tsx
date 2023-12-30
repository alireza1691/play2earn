"use client"
import React, { useState } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";


export default function Notifications() {
    const [isNotifActive,setIsNotifActive] = useState(false)
  return (
    <div className={`z-30 absolute flex flex-col top-20 right-10 w-52 `}>
        {/* <div className= {`px-3 py-2 greenBg blueText transition-all cursor-pointer duration-500 dropdown ${isNotifActive ? "open:max-h-full":""} `}>
                <a onClick={() => setIsNotifActive(!isNotifActive)}>Notifications</a>
                <p className=' transition-all'>{isNotifActive && "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iure voluptas eligendi optio expedita mollitia cupiditate, totam ex. Vitae sequi mollitia corrupti, id nisi atque ipsa libero temporibus magnam in! Sint!"}</p>
        </div> */}
  <div>
      <button
        onClick={() => setIsNotifActive(!isNotifActive)}
        className={` flex flex-row items-center  justify-between w-full px-4 py-2 greenBg blueText !font-normal !text-[16px] focus:outline-none transition-colors duration-300 hover:brightness-105`}
      >
        Notifications {isNotifActive ? <IoIosArrowUp/> : <IoIosArrowDown/>}
      </button>
      <div
        className={`overflow-hidden transition-max-height duration-300 mt-1 ${
            isNotifActive ? 'max-h-40' : 'max-h-0'
        }`}
      >
        <div className={` py-2 px-1 greenBg overflow-y-scroll notification-scrollbar max-h-40 gap-1 flex flex-col-reverse`}>
            <Notif from="101101" notifMsg='Land minted' />
            <Notif from="101101" notifMsg='Town created' />
            <Notif from="101101" notifMsg='Worker is ready' />
        </div>
      </div>
    </div>
    </div>
  )
}

type NotifProps = {
    from: string,
    notifMsg: string
}
const Notif = ({from, notifMsg}:NotifProps) => {
     
    return(
        <div className='notifBg py-2 px-2 darkShadow'><h3 className='blueText !text-[14px] !font-medium'>{from}</h3><p className='text-[12px]'>{notifMsg}</p></div>

    )
}
