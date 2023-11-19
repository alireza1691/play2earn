import Image from 'next/image'
import React from 'react'

import { motion } from 'framer-motion'

export default function Starter() {
  return (
    <section className='mt-[10rem] relative min-h-[50rem] flex justify-center mb-[10rem] '>
      <div className='flex flex-row absolute  bg-blue-gray-50/5 h-15rem justify-center w-full '>
        <Image className=' absolute left-[-10rem]  lg:left-[8rem] xl:left-[7.5rem] 2xl:left-[20%] top-[5rem] lg:top-[0rem]' src={"/leftSideUnion.svg"} width={317} height={292} alt={"union1"} ></Image>
        <Image src={"/circles.svg"} width={744} height={744} alt={"circles"} className=' absolute left-1/2 -translate-x-1/2 brightness-200  shadow-2xl ' ></Image>
        <Image className='absolute right-[-15rem] lg:right-[5rem] xl:right-[5rem] 2xl:right-[17.5%]  top-[35rem]  justify-end ' src={"/rightSideUnion.svg"} width={451} height={266} alt={"union2"}></Image>
        <div className=' top-[12rem] absolute left-1/2 -translate-x-1/2 w-[17.5rem] h-[17.5rem] bg-green-800 rounded-full blur-[10rem]'></div>
        </div>
        <div className='flex flex-col z-20 px-[25%] mt-[8rem] md:mt-[13rem] items-center xl:px-[35%]'>
            <h2 className=' font-bold text-[48px] text-center text-white'>Lorem ipsum dolor sit amet.</h2>
            <p className=' font-light text-[#718574] mt-6'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ullam, amet! Fugit obcaecati ipsam doloribus itaque? Enim vel a, unde eos possimus, cumque consequatur pariatur nihil magni maiores quasi? Quae, totam?</p>
            <button className='greenButton mt-6 !px-12' >Get started</button>
        </div>
    </section>
  )
}
