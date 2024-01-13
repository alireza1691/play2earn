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
{Number(inViewLand?.barracksLvl) > 0 ?   <Image
    className="z-10 cursor-pointer absolute top-[32rem] -translate-x-72 left-[48.5%]  w-[10rem] h-auto"
    src={barracksImage(Number(inViewLand?.barracksLvl )|| 0)}
    width={580}
    height={480}
    alt="Barracks"
    onClick={() => {
      setSelectedItem(barracks);
    }}
  />: (
        <Tooltip
          closeDelay={0}
          content={
            <div>
              {" "}
              <Image
                className="w-[6rem] h-auto"
                src={barracksImage(1)}
                width={100}
                height={100}
                alt="townHall"
      
              />
              <h3 className=" py-3 text-center ">Barracks</h3>
            </div>
          }
        >
          <div
            onClick={() => {
              setSelectedItem(barracks);
            }}
            className="z-10 absolute buildPlace top-[35rem] left-[38%] -translate-x-1/2  h-[7rem] w-[7rem] cursor-pointer"
          ></div>
        </Tooltip>
      )}
  
  </>
  )
}
