import { useSelectedBuildingContext } from '@/context/selected-building-context'
import { useUserDataContext } from '@/context/user-data-context'
import DoubleArrow from '@/svg/doubleArrow'
import React from 'react'

export default function UpgradeContainer() {

    const {selectedItem} = useSelectedBuildingContext()
    const {inViewLand} = useUserDataContext()
  return (
    <div className="z-10 flex flex-row mt-3 gap-8">
    <h3 className=" font-semibold">Level {Number(inViewLand?.townhallLvl)}</h3>
    <DoubleArrow />
    <h3 className=" font-semibold">Level {Number(inViewLand?.townhallLvl) + 1}</h3>
  </div>
  
  )
}
