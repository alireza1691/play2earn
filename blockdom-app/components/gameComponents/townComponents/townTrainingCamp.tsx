import { landItems } from '@/lib/data';
import React from 'react'
import Image from 'next/image';
import { useSelectedBuildingContext } from '@/context/selected-building-context';
import { useUserDataContext } from '@/context/user-data-context';
import { townHallImage, trainingCampImage } from '@/lib/utils';
import { Tooltip } from '@nextui-org/react';

export default function TownTrainingCamp() {

    const {setSelectedItem} = useSelectedBuildingContext()
    const {inViewLand} = useUserDataContext()

    const trainingCamp = landItems[5]
  return (
    <>
    {/* {Number(inViewLand?.trainingCampLvl) > 0 ?  */}
        <Image
    className="z-20 cursor-pointer absolute top-[47rem] left-[51%]  w-[10rem] h-auto translate-x-1/2"
    src={trainingCampImage(Number(inViewLand?.trainingCampLvl) || 0) }
    width={580}
    height={480}
    alt="trainingCamp"
    onClick={() => {
      setSelectedItem(trainingCamp);
    }}
  /> 
     <Image
    className="z-10 cursor-pointer absolute top-[50.5rem] -translate-x-1/2 left-[57.5%]  w-[10rem] h-auto"
    src={"/buildings/shadow.png"}
    width={580}
    height={480}
    alt="shadow"
  />
  </>
  )
}

// : (
//   <Tooltip
//     closeDelay={0}
//     content={
//       <div>
//         {" "}
//         <Image
//           className="w-[6rem] h-auto"
//           src={trainingCampImage(1)}
//           width={100}
//           height={100}
//           alt="townHall"

//         />
//         <h3 className=" py-3 text-center ">Training camp</h3>
//       </div>
//     }
//   >
//     <div
//       onClick={() => {
//         setSelectedItem(trainingCamp);
//       }}
//       className="z-10 absolute buildPlace top-[35rem] left-[58%] -translate-x-1/2  h-[7rem] w-[7rem] cursor-pointer"
//     ></div>
//   </Tooltip>
// )}
