import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import ExploreBox from "./exploreBox";

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);

  return (
    <section ref={ref} className="flex flex-wrap sm:p-0 h-auto" id="home">
      <div className="w-full lg:w-[50%]  flex flex-col items-center  ">
        <div
          // className=' md:right-0 flex md:justify-end md:ml-auto  md:w-[60%] sm:w-full sm:justify-center sm:items-center'
          className="w-full md:w-[500px] px-5 justify-center items-center md:object-center sm:px-[3rem]   mt-[3rem] 2xl:ml-auto 2xl:mr-[5rem] z-10"
        >
          <motion.div
            className="flex flex-col items-center md:items-left  "
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            {" "}
            <Image
              className=" right-0 object-center  rounded-[1rem] "
              src={"/warriors/archerWoman.png"}
              width={477}
              height={416}
              alt="sample"
              quality={70}
            ></Image>
          </motion.div>
          <motion.div
            className=" p-[4rem] md:p-0"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 125,
              delay: 0.1,
              duration: 0.5,
            }}
          >
            <h1 className="mt-10 text:[72px] text-gray-800 dark:text-gray-200 sm:text-[48px] text-center sm:text-left font-bold">
              Blockdom
            </h1>
            <p className=" text-center text-[16px] text-gray-600 dark:text-gray-400  font-medium sm:text-left pt-4">
              Get started earning by enjoyable P2E game based on digital assets.
              <br></br>
              Lets start by choosing your land and build your kingdom on the
              Blockchain.
            </p>
          </motion.div>
          <div className="t-4 md:mt-8 flex flex-wrap px-[4rem] md:px-0 gap-2">
            <motion.button
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="greenButton "
            >
              Get start
            </motion.button>
            {/* <motion.a
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className=" dark:bg-transparent bg-gray-300 py-[14px] px-7 tex  border-gray-300 dark:border-neutral-50 border-[1px] text-[0.8rem] rounded-[0.8rem] font-semibold "
              href="https://blockdom.app"
              target={"_blank"}
            >
              Documentation
            </motion.a> */}
          </div>
        </div>
      </div>
      <div className="w-full mt-[10rem] lg:mt-10 sm:pr-[7%] lg:w-[50%] pt-[4rem] sm:pt-0 flex flex-col items-center gap-5 z-10   ">
        <div className=" px-4 lg:px-0 flex h-[30rem] w-full flex-nowrap  gap-3 mr-auto  justify-center lg:justify-start">
          <div className=" lg:w-1/2  h-full flex flex-col gap-3 justify-around ">
            <div className="  w-full h-1/2 items-center text-center border-r-2 border-b-2 border-gray-600/40 justify-around flex flex-col overflow-hidden relative">
              {/* <ExploreBox/> */}
              <h3 className=" text-[26px] font-bold italic">
                Pre-sale is <span className=" text-[#9FFFCF]">Live</span>!
              </h3>
              <h2 className=" text-[16px] opacity-80">
                {" "}
                Select your land through the map
              </h2>
              <motion.button
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                className="greenButton "
              >
                Explore
              </motion.button>
            </div>
            <div className="w-full lg:h-1/2 flex flex-col  border-t-2 border-r-2 border-gray-600/40 justify-around items-center text-center">
              <h3 className=" opacity-80">
                Play on{" "}
                <span className=" uppercase underline">Testnet</span> before
                entering the{" "}
                <span className=" uppercase underline">Mainnet</span>
              </h3>
              <motion.button
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 py-3 border-[0.13rem] border-gray-500/30 w-fit rounded-xl bg-black/50 hover:bg-gray-800/30 "
              >
                Enter TESTNET
              </motion.button>
            </div>
          </div>
          <div className=" h-full w-1/2 overflow-hidden border-l-2 border-gray-600/30 flex flex-col relative justify-center">
            <Image
              className=" hover:scale-150 hover:translate-y-12 hover:translate-x-12 transition ease-out duration-300 right-[6rem] w-fit h-fit absolute"
              src={"/icons/kingdom18.png"}
              width={720}
              height={1024}
              alt={"test"}
              quality={30}
            ></Image>
          </div>
        </div>
        <div className="  rounded-2xl overflow-hidden mr-auto justify-center  lg:justify-start">
          <Image
            src={"/parcels/land1.png"}
            width={637}
            height={374}
            alt={"test"}
          ></Image>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        className=" flex flex-col items-center invisible lg:visible w-full h-[30rem]  absolute mt-[10rem]"
      >
        <Image
          className=" opacity-20 blur-sm dark:blur-none object-fill rounded-full dark:opacity-70 dark:brightness-140 w-[574px] h-[660px]"
          src={"/grid.svg"}
          width={300}
          height={300}
          objectFit="cover"
          alt="Grid"
        />
      </motion.div>
    </section>
  );
}
