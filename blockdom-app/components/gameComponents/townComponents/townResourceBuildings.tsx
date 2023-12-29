"use client"
import { landItems } from '@/lib/data';
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { useSelectedBuildingContext } from '@/context/selected-building-context';
import { useUserDataContext } from '@/context/user-data-context';
import { townPInst } from '@/lib/instances';
import { BigNumberish } from 'ethers';

type ResourceBuildingObj = {
  level: BigNumberish,
  name: string
}

export default function TownResourceBuildings() {
        const {setSelectedItem} = useSelectedBuildingContext()
        const {inViewLand} = useUserDataContext()
        const farm = landItems[3]
        const goldMine = landItems[2]
        const [farms, setFarms] = useState()

        useEffect(() => {
          const getFarmsData =async () => {
            if (inViewLand != null) {
              let resBuildings = inViewLand.buildedResourceBuildings
              if (resBuildings.length >0) {
                let resBuildingsObj: ResourceBuildingObj[] = []
                for (let index = 0; index < resBuildings.length; index++) {
                  const buildingStatus = await townPInst.getStatus(resBuildings[index])
                  const obj = {level: buildingStatus.level, name: buildingStatus.buildingTypeIndex == 0 ? "Farm" : "GoldMine" }
                  resBuildingsObj.push(obj)
                } 
              }
  
            }
          }
          getFarmsData()
        },[inViewLand])
      return (
        <>
        <Image
        className="z-10 cursor-pointer absolute top-[30rem] right-[10%]  w-[10%] h-auto"
        src={farm.imageUrl}
        width={580}
        height={480}
        alt="walls"
        onClick={() => {
          setSelectedItem(farm);
        }} 
      />
              <Image
        className=" cursor-pointer absolute top-[5rem] left-[20%]  w-[10%] h-auto"
        src={goldMine.imageUrl}
        width={580}
        height={480}
        alt="walls"
        onClick={() => {
          setSelectedItem(goldMine);
        }}
        />
      </>
      )
    }
    
    