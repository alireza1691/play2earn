import React from 'react'
import { AiFillTwitterCircle } from "react-icons/ai";
import { RiTelegramFill } from "react-icons/ri";
import { FaDiscord } from "react-icons/fa6";

export default function Footer() {
  return (
    <section className=' flex flex-col bg-[#213830] bottom-0 mt-[15rem]'>
        <div className='flex  justify-center gap-5 text-[26px] py-5'>
            <AiFillTwitterCircle/>
            <FaDiscord/>
            <RiTelegramFill/>
        </div>
        <div className='flex flex-wrap'>
        <div className='w-full sm:w-1/2 sm:px-[12.5rem] py-[4rem]'>
        <h2 className='text-[28px] mb-5 text-[#A5F4B6] font-semibold' >Join our community</h2>
        <p className='text-[14px] opacity-60 text-white'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero neque quod est architecto reprehenderit unde iusto laborum exercitationem ipsum. Tenetur qui laudantium esse ratione. Accusantium, nulla. Esse facere distinctio cum.</p>
        <input placeholder='Email' className=' text-white bg-white/20 mt-8 py-3 px-4 rounded-2xl border-[0.2rem] border-white/10   '></input>
        </div>
        <div className='w-full sm:w-1/2'>
        
        </div>
        </div>
    </section>
  )
}
