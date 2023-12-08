import { useSelectedBuildingContext } from '@/context/selected-building-context'
import DoubleArrow from '@/svg/doubleArrow'
import React from 'react'

export default function UpgradeContainer() {

    const {selectedItem} = useSelectedBuildingContext()
  return (
    <div className="z-10 flex flex-row mt-3 gap-8">
    <h3 className=" font-semibold">Level {selectedItem?.level}</h3>
    <DoubleArrow />
    <h3 className=" font-semibold">Level {Number(selectedItem?.level) + 1}</h3>
  </div>
  )
}
