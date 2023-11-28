import Image from 'next/image'
import React from 'react'

export default function Explore() {
  return (
    <>
    <div className='top-0 absolute w-[100%] h-[60rem] -z-10'>
      <Image className='mt-[4rem] object-contain' src={"/parcels/land1.png"} fill alt='background'/>
    </div>
    <main className=' p-5 px-[10rem]  w-[100%] h-[70rem] bg-gray-500/40 '>
    <div className='flex outline-white justify-center relative overflow-hidden items-center h-full  backdrop-opacity-90'>
        </div>
    </main>

    </>
  )
}
