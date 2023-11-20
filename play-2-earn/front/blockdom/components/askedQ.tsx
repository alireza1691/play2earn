"use client"
import React, { useState } from 'react'
import { questions } from "@/lib/data"

export default function Questions() {
    const [openedQ, setOpenedQ] = useState<number | null>(null)
  return (
    <section className='w-full px-10 sm:px-[20%] xl:px-[25%] flex flex-col'>
      <h2 className=' text-[36px] text-white text-center font-bold'>Frequently Asked Questions</h2>
      
      <div className='min-h-20  mt-20 flex flex-col gap-4 relative overflow-hidden'>
      {/* <div className=' W-[10rem] h-[10rem] absolute'> */}
        {/* <div className='w-[20rem] h-[20rem] left-[-10rem] bg-light-green-800 absolute rounded-full blur-[5rem] -z-10'></div> */}
        {/* </div> */}
      {questions.map((question, index) => (
        <React.Fragment key={index}>
        {/* <div className='w-[20rem] h-[20rem] left-[-10rem] bg-light-green-800 absolute rounded-full blur-[5rem] -z-10'></div> */}
        <div  className={" flex flex-col overflow-hidden bg-gray-50/10 py-3 px-4 rounded-[0.5rem] relative "}>
           
            <div className='w-[20rem] h-[20rem] top-[-5rem] left-[-10rem] bg-green-800 absolute rounded-full blur-[8rem] -z-10'></div>
            <div className=' flex justify-between'>
            <h2 className=' text-[14px] flex items-center'>{question.title}</h2>
            {openedQ == index ? <a className=' cursor-pointer p-1' onClick={() => setOpenedQ(null)}>&#8963;</a> : <a className=' cursor-pointer p-1' onClick={() => setOpenedQ(index)}>&gt;</a> }
            </div>
            {openedQ == index &&        <p className=' text-[12px] px-3 mt-3 font-light text-white opacity-80'>{question.answer}</p>}
     
           
        </div>
        </React.Fragment>
      ))}
      </div>
    
    </section>
  )
}
