import { useActiveSectionContext } from '@/context/active-section-context';
import { links } from '@/lib/data'
import Link from 'next/link';
import {motion} from "framer-motion"
import React from 'react'
import clsx from "clsx"

export default function TopBar
() {


  const {activeSection, setActiveSection, setTimeOfLastClick} = useActiveSectionContext()

  return (
    <>
    <motion.div className=' hidden z-30 w-[30rem] top-[4.75rem] -translate-x-1/2 left-1/2 px-5 min-h-20 opacity-60 bg-white fixed dark:bg-[#365045] backdrop-blur-2xl  py-5 gap-3 md:flex md:flex-row text-center rounded-3xl blur-[0.03rem] '>
          </motion.div>
          <nav className='z-40 hidden md:flex fixed top-[4.5rem] left-1/2 -translate-x-1/2  '>
          <ul className=' flex w-[22rem] items-center justify-center gap-y-1 text-[0.9rem] font-medium text-gray-500 flex-nowrap gap-5'>
            {links.map((link, index) => (
              <motion.li
                key={index}
                initial={{ y: -100, opacity: 0}}
                animate={{ y: 0, opacity: 1}}
               className='h-3/4 text-white flex   justify-center relative' >
                <Link
                 className={clsx("flex  w-max items-center justify-center px-3 py-3 hover:text-gray-900 transition dark:text-gray-500 dark:hover:text-gray-300",{"text-gray-800 dark:text-gray-200":activeSection === link.name})}
                  href={link.hash}
                  >{link.name}
                  {link.name === activeSection && (
                  <motion.span
                  layoutId='activeSection'
                  transition={{
                    type: "spring",
                    stifness: 180,
                    damping: 20,
                  }}
                   className='-z-10 bg-gray-100 rounded-full absolute inset-0  dark:bg-gray-400/10'
                   ></motion.span>

                  )}
                  </Link>
              </motion.li>
            ))}
          </ul>
          </nav>
      {/* <nav className='z-50 fixed top-[4.75rem] flex flex-row gap-5 left-1/2 -translate-x-1/2 transition-all'>
      {links.map((link, index) => (
            <Link  onClick={() => {
              setActiveSection(link.name)
              setTimeOfLastClick(Date.now)
            }} className='py-2 px-4 opacity-90 rounded-full hover:bg-black/30 cursor-pointer hover:text-white relative' href={link.hash}>{link.name}
            {link.name === activeSection && (
              <span className=' bg-gray-100 rounded-full absolute inset-0 -z-10 dark:bg-gray-400/20 blur-[0.03rem]'></span>
            )}</Link>
        ))}
      </nav> */}

</>
  )
}
