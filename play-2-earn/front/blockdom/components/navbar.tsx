"use client"
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ConnectWallet } from "@thirdweb-dev/react";
import React from "react";
import { links } from '@/lib/data';
import Link from 'next/link';

// const ConnectWallet = dynamic(() => import('@thirdweb-dev/react').then(module => module.ConnectWallet), { ssr: false });



export default function Navbar() {
  return (
    <>
    <header className="z-[999] relative">
      <motion.div className="fixed top-0 left-1/2 -translate-x-1/2 h-[4.5rem] w-full rounded-none border bg-[#365045] border-emerald-950 border-opacity-40 bg-opacity-75 shadow-lg shadow-white/[0.03] backdrop-blur-[0.5rem] sm:top-[1.5rem] sm:h-[3.5rem] sm:w-[36rem] sm:rounded-full "
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}>
        {/* <ConnectWallet/> */}
      </motion.div>
      <nav className='flex fixed top-[0.15rem] left-1/2 h-12 -translate-x-1/2 py-2 sm:top-[1.75rem] sm:h-[initial] sm:py-0'>
        <ul className='flex w-[22rem] flex-wrap items-center justify-center gap-y-1 text-[0.9rem] font-medium text-gray-300 sm:w-[initial] sm:flex-nowrap sm:gap-5'>
          {links.map(link => (
            <motion.li key={link.hash}
            className="h-3/4 flex items-center justify-center"
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
             ><Link className='flex w-full items-center justify-center px-3 py-3 hover:text-gray-100 transition' href={link.hash}>{link.name}</Link></motion.li>
          ))}
        </ul>
      </nav>
      <nav className='flex fixed right-[1.5rem] top-[1.5rem]' >
        <ConnectWallet      auth={{ loginOptional: false }}
            theme="dark"
            dropdownPosition={{
              side: "bottom",
              align: "center",
            }}
            btnTitle="Connect wallet"
            modalSize="wide"
            welcomeScreen={{
              title:"Blockdom",
              subtitle:"Welcome to Blockdom. Plase select & connect your wallet.",
              img: {
                src: "/blockdomLogo.png",
                width: 100,
                height: 100               
              }
            }}
            switchToActiveChain={true}
            modalTitle="Login"
            // style={{
            //   backgroundColor: "#365045",
            //   border: "none",
            //   color: "white",
            // }}
            // detailsBtn={() => {
            //   return <button className=" px-2 py-2 bg-[#365045]" >Connect</button>
            // }}
            ></ConnectWallet></nav>

    </header>
    {/* <div className='w-full justify-end flex fixed'>  
        <ConnectWallet      auth={{ loginOptional: false }}
            theme="dark"
            dropdownPosition={{
              side: "bottom",
              align: "center",
            }}
            btnTitle="Connect wallet"
            modalSize="wide"
            welcomeScreen={{
              title:"Blockdom",
              subtitle:"Welcome to Blockdom. Plase select & connect your wallet.",
              img: {
                src: "/blockdomLogo.png",
                width: 100,
                height: 100               
              }
            }}
            switchToActiveChain={true}
            modalTitle="Login"
            // style={{
            //   backgroundColor: "#365045",
            //   border: "none",
            //   color: "white",
            // }}
            // detailsBtn={() => {
            //   return <button className=" px-2 py-2 bg-[#365045]" >Connect</button>
            // }}
            ></ConnectWallet>
</div> */}
    {/* <motion.div className='left-[6rem] top-[15rem] relative w-max  bg-[#365045] sm:rounded-full'>

    <ul className=' items-center justify-center gap-y-1 text-[0.9rem] font-medium text-gray-300 sm:w-[initial] sm:flex-nowrap sm:gap-5'>
          {links.map(link => (
            <motion.li key={link.hash}
            className="h-3/4 items-center justify-center mt-5 right-0"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
             ><Link 
             className='items-center justify-center px-3 py-3 hover:text-gray-500 transition'
              href={link.hash}>{link.name}</Link></motion.li>
          ))}
        </ul>
    </motion.div> */}
    </>
  );
}
