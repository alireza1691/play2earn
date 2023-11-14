import Image from 'next/image'
import React from 'react'

export default function Intro() {
  return (
    <section>
      <div className='h-[10rem] md:w-[50%] sm:w-full '>
        <div 
        // className=' md:right-0 flex md:justify-end md:ml-auto  md:w-[60%] sm:w-full sm:justify-center sm:items-center'
        className='block justify-center md:right-0 md:ml-auto md:w-[60%] md:justify-end'
        >
        <Image className=' justify-end flex right-0 ml-auto' src={"/test.jpeg"} width={200} height={200} alt="sample" ></Image>
        </div>
      </div>
      <div className='w-[50%] bg-slate-500'>

      </div>
    </section>
  )
}
