import Image from 'next/image'
import React from 'react'

export default function Carousel() {
  return (
    <section className=' px-6 md:px-20 my-[5rem]'>
        <div className='relative w-full rounded-xl overflow-hidden'>
        <Image className='brightness-50 object-cover blur-[0.1rem] w-full h-[30rem]' src={"/icons/map.jpeg"} width={500} height={500} alt='carouselBackground'/>
        <div className=' absolute left-4 top-6 max-w-[50%]'>
            <h3 className=' font-bold text-[32px] text-white mb-6'>Something</h3>
            <p className=' text-white/90 mb-6' >Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem soluta, ea mollitia amet odit consequatur commodi? Quo doloremque placeat voluptates sint ipsa eos repudiandae? Quidem, quia nobis. Hic, numquam magni.</p>
            <button className=' transition-all text-[12px] text-white py-2 px-8 border-white/50 border rounded-lg hover:bg-gray-100/20'>Open</button>
        </div>
        </div>
    </section>
  )
}
