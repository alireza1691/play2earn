"use client"
import { ConnectWallet, WalletConnect } from "@thirdweb-dev/react";
import React, { Fragment, useState } from "react";
import { callsToAction, links, navDropdownItems } from '@/lib/data';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon, } from '@heroicons/react/20/solid'
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image';
import { useTheme } from '@/context/theme-context';
import { useRouter } from 'next/navigation'
import { IoMdDownload } from "react-icons/io";



function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()

  return (
    <>
    <header className=" z-50 relative">
      <div className='fixed  w-full  h-[4rem] bg-[#46b989] dark:bg-[#365045] top-0 z-30' ></div>
      <nav className="fixed mx-auto top-0 flex  items-center justify-between  lg:px-8 h-[4rem] w-full z-30  " aria-label="Global">
        
        <div className=" ml-3 md:ml-5 flex md:hidden ">
          <button
            type="button"
            className=" -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-50 right-0 w-fit mr-2"
            onClick={() =>{ mobileMenuOpen === true ? setMobileMenuOpen(false) : setMobileMenuOpen(true)}}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className=" h-6 w-6" aria-hidden="true" />
          </button>
          
        </div>
        <Popover.Group className="hidden ml-3  md:flex md:gap-x-10 ">
          {/* <Popover className="relative ">
            <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-50">
              About
              <ChevronDownIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute -left-8 top-full  mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {navDropdownItems.map((item) => (
                    <div
                      key={item.name}
                      className="group relative flex  items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                        <item.icon className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" aria-hidden="true" />
                      </div>
                      <div className="flex-auto">
                        <a href={item.href} className="block font-semibold text-gray-900">
                          {item.name}
                          <span className="absolute inset-0" />
                        </a>
                        <p className="mt-1 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                  {callsToAction.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100"
                    >
                      <item.icon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
                      {item.name}
                    </a>
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          </Popover> */}

          <a onClick={() => { router.push('/explore')}}  className="cursor-pointer text-sm font-semibold leading-6 text-gray-50">
            Explore
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-50">
            Dashboard
          </a>
          <a onClick={() => {} }  className=" cursor-pointer text-sm font-semibold leading-6 text-gray-50">
            Whitepaper
          </a>
        </Popover.Group>
        <div className="flex lg:flex-1 absolute left-1/2 -translate-x-1/2">
          <a onClick={() => { router.push('/')}} className="m-2.5">
            <span className="sr-only ">Your Company</span>
            <Image className=" cursor-pointer h-14 w-auto rounded-full shadow-xl bg-white/60 dark:bg-transparent dark:shadow-none" src="/BlockdomLogo.png" width={120} height={120} alt="" />
          </a>
        </div>
        <div className='lg:hidden mr-2'>
          <ConnectWallet 
          modalSize='wide'
          theme={theme === "dark" ? "dark" : "light"}
          welcomeScreen={{
            title: "Blockdom",
            subtitle: "Decentralized P2E game",
            img: {
              src: "/BlockdomLogo.png",
              width: 80,
              height: 80,
            }
          }}
           />
          </div>
    
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <ConnectWallet
                  modalSize='wide'
                  theme={theme === "dark" ? "dark" : "light"}
                  welcomeScreen={{
                    title: "Blockdom",
                    subtitle: "Decentralized P2E game",
                    img: {
                      src: "/BlockdomLogo.png",
                      width: 120,
                      height: 120,
                    }
                  }}/>
        </div>
      </nav>
      <Dialog as="div" className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-30" />
        <Dialog.Panel className=" border-2 border-gray-800/10 fixed inset-y-0 left-0 z-10 w-full  sm:py-10 sm:top-4 rounded-xl h-fit overflow-y-auto bg-gradient-to-r from-[#34594B] to-[#213830] bg-transparent px-6 py-16 sm:max-w-sm ring-1 ring-gray-900/10">
          {/* <div className=" sm:hidden flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              />
            </a>
           
          </div> */}
          <button
              type="button"
              className=" bg-white/10  absolute -m-2.5 active:bg-white/20 rounded-md p-1 text-gray-700 right-5 bottom-5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6 text-white " aria-hidden="true" />
            </button>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {/* <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7  text-gray-100/90 hover:bg-white/10">
                        Product
                        <ChevronDownIcon
                          className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {[...navDropdownItems, ...callsToAction].map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-white/10"
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure> */}
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7  text-gray-100/90 hover:bg-white/10"
                >
                  Explore
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7  text-gray-100/90 hover:bg-white/10"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="-mx-3  flex flex-row items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold leading-7  text-gray-100/90 hover:bg-white/10"
                >
                  Whitepaper
                  <IoMdDownload className=" text-xl group-hover:translate-y-1 transition-all" />

                </a>
              </div>
              {/* <div className="py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7  text-gray-100/90 hover:bg-white/10"
                >
                  Log in
                </a>
              </div> */}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
    </>
  );
}
