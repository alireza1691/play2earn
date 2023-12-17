
// import SelectedBuilding from "@/components/gameComponents.tsx/selectedBuilding";
// import Town from "@/components/gameComponents.tsx/town";
import SelectedBuilding from "@/components/gameComponents/selectedBuilding";
import Town from "@/components/gameComponents/town";
import Image from "next/image";
import React from "react";

export default function MyLand() {

  return (
    <>
    <div className=" w-screen h-screen overflow-hidden relative">
      <div
className=" w-[100vw] h-[100vh]   overflow-scroll custom-scrollbar  items-center justify-center  relative "
       >
        <div className="w-[80rem] h-[60rem]  2xl:h-[80rem] absolute xl:w-[95rem] 2xl:w-[120rem] " >
        <Image
        className=" absolute h-full w-full  object-cover "
        src={"/testBg.png"}
        width={1024}
        height={720}
        alt="bg"
        quality={30}
      />

<Town />
        </div>
 
      </div>

    </div>

      
      <SelectedBuilding />
      <div className=" w-full z-30 h-[4rem] fixed bottom-0 bg-gradient-to-r from-[#A9FFDE] to-[#7ECFB3] dark:from-[#34594B]/60 dark:to-[#213830]/60 sm:hidden dark:bg-[#000000] ">

      </div>
      <div className=" hidden sm:flex w-full h-[3rem] fixed bottom-0 bg-gradient-to-t from-black via-black"></div>
    </>
  );
}
