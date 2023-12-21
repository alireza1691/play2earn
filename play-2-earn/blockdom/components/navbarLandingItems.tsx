import { useRouter } from 'next/navigation';
import React from 'react'
import { IoMdDownload } from 'react-icons/io';

export default function NavbarLandingItems() {

    const router = useRouter()
  return (
    <div className="hidden  md:flex md:gap-x-10  translate-x-[30%] ">
          
    <a
      onClick={() => {
        router.push("/explore");
      }}
      className=" transition-all hover:bg-black/10 p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 text-gray-800 dark:text-gray-50"
    >
      Explore
    </a>
    <a
      href="#"
      className="text-sm transition-all hover:bg-black/10 p-2 rounded-lg  font-semibold leading-6 text-gray-800 dark:text-gray-50"
    >
      Dashboard
    </a>
    <a
      onClick={() => {}}
      className="group flex flex-row gap-2 cursor-pointer transition-all p-2  text-sm font-semibold leading-6 text-gray-800 dark:text-gray-50"
    >
      Whitepaper
      <IoMdDownload className=" text-xl transition-all  group-hover:translate-y-1" />

    </a>
  </div>
  )
}
