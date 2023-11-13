"use client"
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
// import { ConnectWallet } from "@thirdweb-dev/react";
import React from "react";
import { links } from '@/lib/data';
import Link from 'next/link';

// const ConnectWallet = dynamic(() => import('@thirdweb-dev/react').then(module => module.ConnectWallet), { ssr: false });



export default function Navbar() {
  return (
    <header className="z-[999] relative">
      <motion.div className="fixed top-0 left-1/2 -translate-x-1/2 h-[4.5rem] w-full rounded-none border bg-[#365045] border-emerald-950 border-opacity-40 bg-opacity-75 shadow-lg shadow-white/[0.03] backdrop-blur-[0.5rem] sm:top-6 sm:h-[3.25rem] sm:w-[36rem] sm:rounded-full "
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}>
        {/* <ConnectWallet/> */}
      </motion.div>
      <nav className='flex fixed top-[0.15rem] left-1/2 h-12 -translate-x-1/2 py-2 sm:top-[1.7rem] sm:h-[initial] sm:py-0'>
        <ul className='flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium text-white-500 sm:w-[initial] sm:flex-nowrap sm:gap-5'>
          {links.map(link => (
            <motion.li key={link.hash}
            className="h-3/4 flex items-center justify-center"
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
             ><Link className='flex w-full items-center justify-center px-3 py-3 hover:text-gray-500 transition' href={link.hash}>{link.name}</Link></motion.li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
