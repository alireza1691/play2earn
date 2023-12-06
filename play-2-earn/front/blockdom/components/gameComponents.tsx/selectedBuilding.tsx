import { useStatesContext } from '@/context/states-context'
import CloseIcon from '@/svg/closeIcon'
import DoubleArrow from '@/svg/doubleArrow'
import Image from 'next/image'
import React from 'react'



export default function SelectedBuilding() {

const {selectedItem, setSelectedItem} = useStatesContext()
const currentLvl = 2
  return (
    <section className=' absolute left-10 top-24 rounded-xl w-[25rem] h-[50rem] bg-[#21302A]/60 backdrop-blur-sm'>
      <div className=' flex flex-col h-full justify-center items-center'>
        <div className=' w-full p-3 flex flex-row justify-between'>      <h3 className='font-semibold'>{selectedItem}</h3> <a className='closeIcon' onClick={() => setSelectedItem(null)}><CloseIcon/></a> </div>

      <div className=' relative px-8 shadow-large rounded-lg w-[20rem] h-[15rem] bg-gradient-to-tr from-[#FFFFFF]/10 via-[#FFFFFF]/40 to-[#FFFFFF]/20'>
        <Image className='p-4' src={"/testTownHall.png"} fill alt='selectedItemImage' />
      </div>
      <div className='z-10 flex flex-row mt-3 gap-8'>
      <h3 className=' font-semibold'>Level {currentLvl}</h3>
      <DoubleArrow/>
      <h3 className=' font-semibold'>Level {currentLvl+1}</h3>
      </div>
      <div className='w-full mt-auto flex flex-row p-3 gap-2'>
        <button className='redButton !w-[50%]'>Cancel</button>
        <button className='greenButton !w-[50%]'>Upgrade</button>
      </div>
      </div>
   
      </section>
  )
}
