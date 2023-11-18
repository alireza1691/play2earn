import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";


export default function Intro() {
  return (
    <section className="flex flex-wrap sm:p-0 h-auto">
      <div className="w-full lg:w-[50%]  flex flex-col items-center  ">
        <div
          // className=' md:right-0 flex md:justify-end md:ml-auto  md:w-[60%] sm:w-full sm:justify-center sm:items-center'
          className="w-full md:w-[500px] px-5 justify-center items-center md:object-center sm:px-[3rem]   mt-[3rem] 2xl:ml-auto 2xl:mr-[5rem] z-10"
        >
          <motion.div className="flex flex-col items-center md:items-left  "
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "tween", duration: 0.2}}
          >
        
            {" "}
            <Image
              className=" right-0 object-center  rounded-[1rem] "
              src={"/test.jpeg"}
              width={477}
              height={416}
              
              alt="sample"
            ></Image>
          </motion.div>
          <motion.div className=" p-[4rem] md:p-0"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 125,
            delay: 0.1,
            duration: 0.5,
          }}>
            <h1 className=" text:[72px]  sm:text-[48px] text-center sm:text-left font-bold">Lorem ipsum dolor sit amet</h1>
            <p className=" text-center text-[16px] text-gray-400  font-medium sm:text-left pt-4" >Lorem ipsum dolor, sit amet consectetur adipisicing elit. Pariatur hic saepe eaque asperiores, maxime quaerat ad harum eveniet? Praesentium dolores autem soluta illum, iure assumenda saepe consectetur. Eveniet, repellendus ut.</p>
          </motion.div>
          <div className="t-4 md:mt-8 flex flex-wrap px-[4rem] md:px-0">
            <motion.button initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }} className="py-3 px-7 mr-4 tex bg-gradient-to-l  to-[#75E5F4] from-[#9FFFCF]  text-black rounded-[0.8rem] text-[0.8rem] font-semibold   hover:from-[#9168FB] hover:to-[#9168FB] hover:border-[#9168FB] ">Get start</motion.button>
            <motion.a initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }} className="py-[14px] px-7 mr-4 tex border-neutral-50 border-[1px] text-[0.8rem] rounded-[0.8rem] font-semibold " href="https://blockdom.app" target={"_blank"} >Documentation</motion.a>
          </div>
        </div>
      </div>
      <div className="w-full mt-[10rem] lg:mt-0  lg:w-[50%] pt-[4rem] sm:pt-0 flex flex-col items-center gap-5 z-10  opacity-50 ">
          <div className="flex  w-full  gap-5 mr-auto  justify-center lg:justify-start">
            <div className="  h-full flex flex-col gap-5 justify-around ">
                <div className=" bg-white/50  rounded-2xl overflow-hidden">
                  <Image src={"/"} width={318} height={242} alt={"test"}></Image>
                </div>
                <div className=" bg-white/30 rounded-2xl overflow-hidden">
                <Image src={"/"} width={318} height={204} alt={"test"}></Image>
                </div>
            </div>
            <div className=" bg-white/40 rounded-2xl overflow-hidden">
            <Image src={"/"} width={299} height={466} alt={"test"}></Image>
            </div>
          </div>
          <div className=" bg-white/10 rounded-2xl overflow-hidden mr-auto justify-center lg:justify-start">
          <Image src={"/"} width={637} height={374} alt={"test"}></Image>
          </div>
      </div>
      <motion.div initial={{ opacity: 0, scale: 1}}
      animate={{ opacity:1, scale: 1 }} transition={{ duration : 1.2}} className=" flex flex-col items-center invisible md:visible w-full h-[30rem]  absolute mt-[10rem]">        <Image className=" rounded-full opacity-70 brightness-140 w-[574px] h-[660px]" src={"/grid.svg"} width={300} height={300} objectFit="cover" alt="Grid" />
</motion.div>
    </section>

  );    
}
