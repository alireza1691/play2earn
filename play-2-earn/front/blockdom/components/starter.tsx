import Image from 'next/image'
import React from 'react'

export default function Starter() {
  return (
    <section className='mt-[10rem] relative min-h-[50rem] flex justify-center'>
      <div className='flex flex-row absolute  bg-blue-gray-50/5 h-15rem justify-center w-full'>
        <Image className=' absolute md:left-[8rem] md:top-[0rem]' src={"/leftSideUnion.svg"} width={317} height={292} alt={"union1"} ></Image>
        <Image src={"/circles.svg"} width={744} height={744} alt={"circles"} className=' absolute left-1/2 -translate-x-1/2 brightness-200  shadow-2xl ' ></Image>
        <Image className='absolute right-[5rem] top-[30rem] justify-end ' src={"/rightSideUnion.svg"} width={451} height={266} alt={"union2"}></Image>
        <div className=' top-[12rem] absolute left-1/2 -translate-x-1/2 w-[17.5rem] h-[17.5rem] bg-green-500 rounded-full blur-[12rem]'></div>
        </div>
    </section>
  )
}
