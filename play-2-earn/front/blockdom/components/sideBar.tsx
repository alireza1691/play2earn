"use client"
import { useActiveSectionContext } from '@/context/active-section-context'
import { links } from '@/lib/data'
import React from 'react'

import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Image from 'next/image';

export default function SideBar() {
    const {activeSection, setActiveSection, setTimeOfLastClick} = useActiveSectionContext()
 

  return (
     <div className="fixed -left-6 z-30 top-[17.5rem] invisible md:visible">
<ul className=" flex flex-col gap-1 items-center ">
  {links.map((link, index) => (
    <motion.a
    href={link.hash}
    initial={{  opacity: 0}}
    animate={{ opacity: 1}}
      key={index}
      className={` group px-3 py-3 rounded-full transition-all ease-linear text-center cursor-pointer ${
        activeSection === link.name
          ? "w-36 my-[3rem]  bg-gradient-to-r  -rotate-90  from-gray-900/80 to-[#5ECFA4]/40  hover:from-gray-800/80 hover:to-[#5ECFA4]/50 "
          : "bg-gray-800/70 hover:bg-gray-700/70"
      }`}
      onClick={() => {setActiveSection(link.name)
        setTimeOfLastClick(Date.now)}}

    >
      {/* <Link
      
        href={link.hash}
        className={` text-center rounded-full -rotate-90 
`}
      > */}
        {activeSection === link.name ? link.name : <Image src={link.icon} width={20} height={20} alt="icon" />}

      {/* </Link> */}
    </motion.a>
  ))}
</ul>
</div> 



  )
}

// <div className="fixed left-0 z-30 top-[17.5rem] ">
// <ul className=" flex flex-col gap-1 items-center ">
//   {links.map((link, index) => (
//     <motion.li
//       key={index}
//       className={`  px-3 py-3 rounded-full transition-all text-center  ${
//         activeSection === link.name
//           ? "w-36 my-[3rem]  bg-gradient-to-r  -rotate-90  from-[#213830]/40 to-[#5ECFA4]/30 "
//           : "bg-gray-600/30"
//       }`}
//     >
//       <Link
      
//         href={link.hash}
//         className={` cursor-pointer  text-center rounded-full -rotate-90 
// `}
//       >
//         {activeSection === link.name ? link.name : <Image src={link.icon} width={20} height={20} alt="icon" />}

//       </Link>
//     </motion.li>
//   ))}
// </ul>
// </div> 