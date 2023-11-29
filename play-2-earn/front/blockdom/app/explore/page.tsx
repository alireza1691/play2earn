import Image from "next/image";
import React from "react";

export default function Explore() {
  return (
    <>
      <div className="top-0 absolute  w-[100%] h-[55rem] z-0 ">
        <Image
          className=" object-fill opacity-40 "
          src={"/parcels/map.jpeg"}
          fill
          alt="background"
        />
      </div>
      <main className="h-[55rem] ">
        <div className="mt-[4rem] p-[3rem]  flex flex-col lg:flex-row justify-evenly">
          <div className="  border-2 border-[#D4D4D4]/30  z-10 shadow-xl backdrop-blur-[0.1rem]  rounded-lg bg-[#93F8DA]/20  lg:w-[15rem] xl:w-[17.5rem] 2xl:w-[20rem] h-[37.5rem] xl:h-[42.5rem] 2xl:h-[45rem]"></div>
          <div className="  border-2 border-[#D4D4D4]/30  z-10  shadow-xl rounded-lg overflow-hidden bg-gray-600  lg:w-[37.5rem] xl:w-[45rem] 2xl:w-[50rem] h-[37.5rem] xl:h-[42.5rem] 2xl:h-[45rem] relative"> <Image src={"/parcels/map.jpeg"} fill alt="map" /></div>
        </div>
       
      </main>
      <div className=" border-2 border-[#D4D4D4]/30 shadow-lg backdrop-blur-[0.1rem] rounded-3xl left-1/2 -translate-x-1/2 w-[50rem]  absolute bottom-10  h-20 bg-[#93F8DA]/30 "></div>
    
    </>
  );
}
