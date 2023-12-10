"use client"
import { useSelectedBuildingContext } from '@/context/selected-building-context'
import Image from 'next/image'
import React from 'react'

export default function BuildingWindowDetails() {

    const {selectedItem, setSelectedItem} = useSelectedBuildingContext()
  return (
    <div className='h-full flex flex-col w-full'>
        <div className=' text-center'>something </div>
        <div className=' mt-auto flex flex-row justify-evenly p-2 '>
            <div className=' flex flex-row items-center '>
            <Image src={"/svg/gameItems/goldIcon.svg"} width={30} height={30} alt="goldIcon"/><h4>1000</h4>
            </div>
            <div className=' flex flex-row items-center'>
            <Image src={"/svg/gameItems/foodIcon.svg"} width={30} height={30} alt="foodIcon"/><h4>1200</h4>
            </div>
        </div>
        </div>
  )
}
