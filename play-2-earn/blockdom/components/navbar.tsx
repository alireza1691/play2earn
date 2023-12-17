"use client";
import { ConnectWallet, WalletConnect } from "@thirdweb-dev/react";
import React, { Fragment, useState } from "react";
import { FaBars } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

// import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTheme } from "@/context/theme-context";
import { useRouter , usePathname } from "next/navigation";
import { IoMdDownload } from "react-icons/io";
import { BsMoon, BsSun } from "react-icons/bs";
import DarkLogo from "@/svg/darkLogo";
import LightLogo from "@/svg/lightLogo";
import BattleLogIcon from "@/svg/battleLogIcon";
import MyLandIcon from "@/svg/myLandIcon";
import ExploreIcon from "@/svg/exploreIcon";
import { useSelectedWindowContext } from "@/context/selected-window-context";



export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {selectedWindowComponent, setSelectedWindowComponent} = useSelectedWindowContext()
  const router = useRouter();

  const { theme, toggleTheme } = useTheme();
 

  const currentRoute = usePathname();

  return (
    <>
      <header className=" z-50 relative">
        <div
          className="fixed  w-full  h-[4rem] from-[#A9FFDE] to-[#7ECFB3] bg-gradient-to-r dark:from-[#34594B] dark:to-[#213830]  top-0 z-30  shadow-md md:shadow-none"
        ></div>
        <nav
          className="fixed mx-auto top-0 flex  items-center justify-between px-4  lg:px-8 h-[4rem] w-screen z-30 "
          aria-label="Global"
        >
              <div className="flex   ">
            <a
              onClick={() => {
                router.push("/");
              }}
              className="md:m-2.5 cursor-pointer "
            >
          
              {theme === "light" ? <DarkLogo/> : <LightLogo/>}
            </a>
          </div>
              {currentRoute === "/" ? (
                <>
                      <div className=" ml-3 md:ml-5 flex md:hidden  ">
            <button
             
              className=" -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-800 dark:text-gray-50 right-0 w-fit mr-2"
              onClick={() => {
                mobileMenuOpen === false
                  ? setMobileMenuOpen(true)
                  : setMobileMenuOpen(false);
              }}
            >
              
              <FaBars className=" h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden  md:flex md:gap-x-10  ">
          
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
                </>
              ):(
                <div className="hidden  md:flex md:gap-x-10 ">
          
                <a
                  onClick={() => {
                    router.push("/explore");
                  }}
                  className=" flex flex-col justify-center items-center transition-all hover:bg-black/10 p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 text-gray-800 dark:text-gray-50"
                >
                  <ExploreIcon/>
                  Explore
                </a>
                <a
                  href="#"
                  className=" flex flex-col justify-center items-center text-sm transition-all hover:bg-black/10 p-2 rounded-lg  font-semibold leading-6 text-gray-800 dark:text-gray-50"
                >
                  <MyLandIcon/>
                  My land
                </a>
                <a
                  onClick={() => { setSelectedWindowComponent("battleLog")}}
                  className=" flex flex-col justify-center items-center cursor-pointer transition-all p-2  text-sm  rounded-lg font-semibold leading-6 text-gray-800 dark:text-gray-50"
                >
                         <BattleLogIcon/>
                  Battle log
           
                </a>
              </div>
              )}
    
      
          <div className=" flex  justify-center items-center gap-3">
          <button
      onClick={toggleTheme}
      className="  bg-[#06291D] text-white bg-opacity-50  w-[2.5rem] h-[2.5rem]  backdrop-blur-[0.5rem]  rounded-xl flex items-center justify-center hover:scale-115 active:scale-105 transition-all hover:bg-opacity-70  "
    >
      {theme === "light" ? <BsSun /> : <BsMoon />}
    </button>
            <ConnectWallet
            className=" !bg-[#06291D] !bg-opacity-50  !p-3"
              modalSize="wide"
              theme={theme === "dark" ? "dark" : "light"}
              welcomeScreen={{
                title: "Blockdom",
                subtitle: "Decentralized P2E game",
                img: {
                  src: "/BlockdomLogo.png",
                  width: 120,
                  height: 120,
                },
              }}
            />
          </div>
        </nav>
        <div

          className="md:hidden"
        >
     
          {/* <div className="fixed inset-0 z-30" /> */}
          {mobileMenuOpen && (
                <div className=" fixed inset-y-0 left-0 z-10 w-full  py-14 rounded-xl h-fit overflow-y-auto bg-gradient-to-r from-[#A9FFDE] to-[#7ECFB3] dark:from-[#34594B] dark:to-[#213830] bg-transparent px-6 shadow-lg ">

                <button
                  type="button"
                  className=" bg-black/10 dark:bg-white/10  absolute -m-2.5 active:bg-white/20 dark:active:bg-black/10 rounded-md p-1 text-gray-700 right-5 bottom-5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <IoClose className="h-6 w-6 text-gray-800 dark:text-gray-300  " aria-hidden="true" />
                </button>
                <div className="mt-10 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                    
                      <a
                        href="#"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-700/10  dark:text-gray-100/90 dark:hover:bg-white/10"
                      >
                        Explore
                      </a>
                      <a
                        href="#"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7  hover:bg-gray-700/10 dark:text-gray-100/90 dark:hover:bg-white/10"
                      >
                        Dashboard
                      </a>
                      <a
                        href="#"
                        className="-mx-3  flex flex-row items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold leading-7  hover:bg-gray-700/10  dark:text-gray-100/90 dark:hover:bg-white/10"
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
              </div>
            )}
      
        </div>
      </header>
    </>
  );
}
