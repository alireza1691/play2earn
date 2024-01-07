import { landItems } from '@/lib/data';
import React from 'react'
import Image from 'next/image';
import { useSelectedBuildingContext } from '@/context/selected-building-context';
import { useUserDataContext } from '@/context/user-data-context';
import { townHallImage } from '@/lib/utils';

export default function TownHall() {
  
    const {setSelectedItem} = useSelectedBuildingContext()
    const {inViewLand} = useUserDataContext()
    const townHall = landItems[0]
  return (
    <Image
    className="z-10 cursor-pointer absolute top-[22.5rem] left-1/2 -translate-x-1/2 w-[12rem] h-auto"
    src={townHallImage(Number(inViewLand?.townhallLvl) || 0) }
    width={580}
    height={480}
    alt="townHall"
    onClick={() => {
      setSelectedItem(townHall);
    }}
  />
  )
}

