import { landItems } from '@/lib/data';
import React from 'react'
import Image from 'next/image';
import { useSelectedBuildingContext } from '@/context/selected-building-context';
import { useUserDataContext } from '@/context/user-data-context';
import { townHallImage, trainingCampImage } from '@/lib/utils';

export default function TownTrainingCamp() {

    const {setSelectedItem} = useSelectedBuildingContext()
    const {inViewLand} = useUserDataContext()

    const trainingCamp = landItems[5]
  return (
    <Image
    className=" cursor-pointer absolute top-[32rem] left-1/2  w-[10rem] h-auto translate-x-40"
    src={trainingCampImage(Number(inViewLand?.trainingCampLvl) || 0) }
    width={580}
    height={480}
    alt="trainingCamp"
    onClick={() => {
      setSelectedItem(trainingCamp);
    }}
  />
  )
}

