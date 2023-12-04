"use client";

import Slidebar from "@/components/exploreComponents/slidebar";
import Attack from "@/components/gameComponents.tsx/attack";
import SelectedParcel from "@/components/gameComponents.tsx/selectedParcel";
import CloudTL from "@/svg/cloudTL";
import Image from "next/image";
import React, { useState } from "react";

type Item = {
  x: number;
  y: number;
};

export default function Explore() {
  const [slideBar, setSlideBar] = useState(false);
  const [attackBox, setAttackBox] = useState(false);



  return (
    <>
      <div className="z-10 relative w-screen h-[60rem] overflow-hidden ">
      <SelectedParcel/>
        <Image
          className=" backdrop-brightness-0 brightness-75 absolute top-[3rem] h-[60rem]  w-[100%] -z-10 blur-sm object-cover"
          src={"/svg/gameItems/bg.svg"}
          width={1008}
          height={629}
          alt="deactivedParcel"
        />
        <Image
          className=" absolute -left-20 top-[0rem] h-[15rem]  w-auto z-10  object-cover"
          src={"/svg/gameItems/cloudTL.svg"}
          width={698}
          height={467}
          alt="tlcloud"
        />
        <Image
          className=" absolute right-0 translate-x-1/2 top-0 h-[15rem]  w-auto z-10  overflow-hidden"
          src={"/svg/gameItems/cloudTR.svg"}
          width={698}
          height={467}
          alt="trcloud"
        />
        <Image
          className=" absolute left-20 bottom-0 h-[15rem]  w-auto z-10  object-cover"
          src={"/svg/gameItems/cloudBL.svg"}
          width={698}
          height={467}
          alt="deactivedParcel"
        />
        {/* <Image
          className=" absolute top-[3rem] h-[60rem]  w-full  z-10 shadow-xl object-cover"
          src={"/svg/gameItems/clouds.svg"}
          width={1008}
          height={629}
          alt="deactivedParcel"
        /> */}
      </div>

      <main>
        {slideBar && <Slidebar slideBar={slideBar} setSlideBar={setSlideBar} />}
        {attackBox && <Attack />}
     
        {/* <div className=" p-4">
          <ul className="flow-root space-y-4 relative top-[10rem]">
            <li className="bg-white p-2 overflow-hidden relative">
              Item 1
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 top-10 z-50"></div>
            </li>
            <li className="bg-white p-2 relative overflow-hidden">
              Item 2
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 -top-8 z-50"></div>
            </li>
            <li className="bg-white p-2   overflow-hidden relative">
              Item 3
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 -top-28 z-50"></div>
            </li>
            <li className="bg-white  p-2 overflow-hidden relative">
              Item 4{" "}
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 -top-40 z-50"></div>
            </li>
            <li className="bg-white p-2 overflow-hidden relative">
              Item 5{" "}
              <div className=" absolute bg-green-700  blur-[5rem] w-[15rem] h-[15rem] rounded-full left-0 -top-56 z-50"></div>
            </li>
          </ul>
        </div> */}
      </main>
    </>
  );
}
