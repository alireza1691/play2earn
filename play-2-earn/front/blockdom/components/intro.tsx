import Image from 'next/image'
import React from 'react'

export default function Intro() {
  return (
    <section>
      <div className='w-[50%] bg-white h-[10rem] '>
        <div className=' w-[60%] right-0 flex justify-end ml-auto '>
        <Image src={"/test.jpeg"} width={200} height={200} alt="sample" ></Image>
        </div>

      </div>
      <div className='w-[50%] bg-slate-500'>

      </div>
    </section>
  )
}
