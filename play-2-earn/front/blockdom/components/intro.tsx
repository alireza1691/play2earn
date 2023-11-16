import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import grid from "../public/grid.svg"

export default function Intro() {
  return (
    <section className="flex flex-wrap sm:p-0 h-auto">
      <div className="w-full md:w-[45%]  flex flex-col items-center  ">
        <div
          // className=' md:right-0 flex md:justify-end md:ml-auto  md:w-[60%] sm:w-full sm:justify-center sm:items-center'
          className="w-full px-5 sm:px-0 justify-center items-center 2xl:w-[60%] md:object-right  md:ml-auto mt-[3rem] md:pl-[6rem]  md:pr-[1rem] z-10"
        >
          <motion.div className="flex flex-col items-center md:items-left "
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "tween", duration: 0.2}}
          >
        
            {" "}
            <Image
              className=" right-0 object-center  rounded-[1rem] w-  "
              src={"/test.jpeg"}
              width={477}
              height={416}
                // fill
              alt="sample"
            ></Image>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 125,
            delay: 0.1,
            duration: 0.5,
          }}>
            <h1 className=" text-[64px]">Lorem ipsum dolor sit amet</h1>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Pariatur hic saepe eaque asperiores, maxime quaerat ad harum eveniet? Praesentium dolores autem soluta illum, iure assumenda saepe consectetur. Eveniet, repellendus ut.</p>
          </motion.div>
          <div className="mt-8">
            <button className="py-3 px-7 mr-4 tex bg-gradient-to-l  to-[#75E5F4] from-[#9FFFCF]  text-black rounded-[0.8rem] text-[0.8rem] font-semibold   hover:from-[#9168FB] hover:to-[#9168FB] hover:border-[#9168FB] ">Get start</button>
            <a className="py-[14px] px-7 mr-4 tex border-neutral-50 border-[1px] text-[0.8rem] rounded-[0.8rem] font-semibold " href="https://blockdom.app" target={"_blank"} >Check the Documentation</a>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[50rem] md:w-[55%] pt-[4rem] sm:pt-0 md:pt-0 lg:pt-0 xl:pt-0 2xl:pt-0 flex flex-col items-center gap-5 z-10 pl-[3rem] pr-[6rem] min-h-[40rem]">
          <div className="flex h-[50%] w-full bg-white/20 gap-5">
            <div className=" w-[50%] h-full flex flex-col gap-5 ">
                <div className=" bg-white/50 h-[50%] w-full"></div>
                <div className=" bg-white/30 h-[50%] w-full"></div>
            </div>
            <div className="w-[50%] bg-white/40">
                
            </div>
          </div>
          <div className="h-[50%] w-full bg-white/10">

          </div>
      </div>
      <div className=" flex flex-col items-center invisible sm:visible w-full h-[30rem]  absolute mt-[10rem]">        <Image className=" rounded-full opacity-70 brightness-140 w-[574px] h-[660px]" src={grid} width={300} height={300} objectFit="cover" alt="Grid" />
</div>
    </section>

  );    
}
