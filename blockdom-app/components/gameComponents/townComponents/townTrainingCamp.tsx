import { landItems } from '@/lib/data';
import React from 'react'
import Image from 'next/image';
import { useSelectedBuildingContext } from '@/context/selected-building-context';

export default function TownTrainingCamp() {

    const {setSelectedItem} = useSelectedBuildingContext()
    const trainingCamp = landItems[5]
  return (
    <Image
    className=" cursor-pointer absolute top-[30rem] right-[50%]  w-[10%] h-auto"
    src={trainingCamp.imageUrl}
    width={580}
    height={480}
    alt="walls"
    onClick={() => {
      setSelectedItem(trainingCamp);
    }}
  />
  )
}

