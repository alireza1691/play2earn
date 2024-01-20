import { landItems } from '@/lib/data';
import React from 'react'
import Image from 'next/image';
import { useSelectedBuildingContext } from '@/context/selected-building-context';
import { barracksImage } from '@/lib/utils';
import { useUserDataContext } from '@/context/user-data-context';
import { Tooltip } from '@nextui-org/react';

export default function TownBarracks() {
    const {setSelectedItem} = useSelectedBuildingContext()
    const {inViewLand} = useUserDataContext()
    const barracks = landItems[1]
  return (
<>
 <Image
    className="z-20 cursor-pointer absolute top-[54.5rem] -translate-x-1/2 left-[41%] xl:left-[42.5%]  w-[10rem] h-auto"
    src={barracksImage(Number(inViewLand?.barracksLvl )|| 0)}
    width={580}
    height={480}
    alt="Barracks"
    onClick={() => {
      setSelectedItem(barracks);
    }}
  />
  
 
      <Image
    className="z-10 cursor-pointer absolute top-[58rem] -translate-x-1/2 left-[39.5%] xl:left-[41%]  w-[10rem] h-auto"
    src={"/buildings/shadow.png"}
    width={580}
    height={480}
    alt="shadow"
  />

  </>
  )
}
