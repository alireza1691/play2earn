"use client";

import Slidebar from "@/components/exploreComponents/slidebar";
import Attack from "@/components/gameComponents.tsx/attack";
import Image from "next/image";
import React, { useState } from "react";

type Item = {
  x: number;
  y: number;
};

export default function Explore() {
  const [slideBar, setSlideBar] = useState(false);
  const [attackBox, setAttackBox] = useState(true)

  const lands = (xFrom: number, yFrom: number) => {
    let items = [];
    for (let x = xFrom; x < xFrom + 10; x++) {
      for (let y = yFrom; y < yFrom + 10; y++) {
        items.push(x, y);
      }
    }
  };

  return (
    <>
      <div className="-z-10 relative left-0 top-0">
        <Image
          className="absolute top-[3rem] h-[60rem]  w-full -z-10 blur-sm object-cover"
          src={"/svg/gameItems/bg.svg"}
          width={1008}
          height={629}
          alt="deactivedParcel"
        />
        <Image
          className=" absolute top-[3rem] h-[60rem]  w-full  z-10 shadow-xl object-cover"
          src={"/svg/gameItems/clouds.svg"}
          width={1008}
          height={629}
          alt="deactivedParcel"
        />
      </div>

      <main>
        {slideBar && (<Slidebar slideBar={slideBar} setSlideBar={setSlideBar} />)}
        {attackBox && <Attack/>}
        
      </main>
    </>
  );
}
