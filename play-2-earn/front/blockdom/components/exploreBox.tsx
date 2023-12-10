import React from 'react'
import {motion} from "framer-motion"
import Image from 'next/image'

export default function ExploreBox() {
  return (
    <motion.div
    // style={{ scale: scaleProgress, opacity: opacityProgress }}
    className=" group"
  >
    <section className=" bg-gray-100 max-w-[318px]  overflow-hidden sm:pr-8 relative sm:h-[15rem] hover:bg-gray-200 transition sm:group-even:pl-8 dark:text-white dark:bg-transparent border-r-2 border-b-2  border-gray-500 border-opacity-25">
      <div className=" pt-4 pb-7 px-5 sm:pl-10 sm:pr-2 sm:pt-10 sm:max-w-[50%] flex flex-col h-full sm:group-even:ml-[18rem]">
        <h3 className=" text-2xl font-semibold">Explore</h3>
        <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
          something
        </p>
        {/* <ul className="flex flex-wrap mt-4 gap-2 sm:mt-auto ">
          {tags.map((tag, index) => (
            <li
              key={index}
              className=" bg-black/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white rounded-full dark:text-white/70"
            >
              {tag}
            </li>
          ))}
        </ul> */}
      </div>
      <Image
      width={300}
      height={200}
        src={"/icons/kingdom18.png"}
        alt="world"
        quality={50}
        className="absolute hidden sm:block top-10 -right-40 w-[28.25rem] rounded-t-lg 
      transition 
      group-hover:scale-[1.04]
      group-hover:-translate-x-3
      group-hover:translate-y-3
      group-hover:-rotate-2

      group-even:group-hover:translate-x-3
      group-even:group-hover:translate-y-3
      group-even:group-hover:rotate-2

      group-even:right-[initial] group-even:-left-40"
      />
    </section>
  </motion.div>
  )
}
