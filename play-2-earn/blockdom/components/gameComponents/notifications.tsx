"use client"
import React, { useState } from 'react'

export default function Notifications() {
    const [isNotifActive,setIsNotifActive] = useState(false)
  return (
    <div className='z-10 absolute flex flex-col top-20 right-10 w-40 bg-gray-500/10'>
        <div className=' px-3 py-2 greenBg blueText transition-all cursor-pointer'>
                <a onClick={() => setIsNotifActive(!isNotifActive)}>Notifications</a>
                {isNotifActive && <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iure voluptas eligendi optio expedita mollitia cupiditate, totam ex. Vitae sequi mollitia corrupti, id nisi atque ipsa libero temporibus magnam in! Sint!</p>}
        </div>
    </div>
  )
}
