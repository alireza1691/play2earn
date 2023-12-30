"use client"
import { useUserDataContext } from '@/context/user-data-context';
import React from 'react'

export default function ToggleLand() {

    const { setOwnedLands, ownedLands, setInViewLand, inViewLand } = useUserDataContext();
  return (
    <div className='z-10 absolute bottom-10 p-2 darkGreenBg w-[12rem] left-1/2 -translate-x-1/2'>{ownedLands && ownedLands[0].tokenId}</div>
  )
}
