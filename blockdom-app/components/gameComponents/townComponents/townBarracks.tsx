import { landItems } from '@/lib/data';
import React from 'react'
import Image from 'next/image';
import { useSelectedBuildingContext } from '@/context/selected-building-context';
import { barracksImage } from '@/lib/utils';
import { useUserDataContext } from '@/context/user-data-context';

export default function TownBarracks() {
    const {setSelectedItem} = useSelectedBuildingContext()
    const {inViewLand} = useUserDataContext()
    const barracks = landItems[1]
  return (
    <Image
    className="z-10 cursor-pointer absolute top-[32rem] -translate-x-72 left-1/2  w-[10rem] h-auto"
    src={barracksImage(Number(inViewLand?.barracksLvl )|| 0)}
    width={580}
    height={480}
    alt="Barracks"
    onClick={() => {
      setSelectedItem(barracks);
    }}
  />
  )
}
