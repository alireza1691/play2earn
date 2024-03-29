"use client"
import { useTheme } from "@/context/theme-context";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { IoMdDownload } from "react-icons/io";
import { useRouter } from "next/navigation"



export default function Intro() {
  const { ref } = useSectionInView("Home", 0.3);
  const { theme } = useTheme()
  const router = useRouter()



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
              src={"/images/archerWoman.png"}
              width={477}
              height={416}
              alt="introImage"
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
            <h1 className="mt-10 text-3xl text-gray-200 sm:text-[48px] text-center sm:text-left font-bold">
              Blockdom
            </h1>
            <p className=" text-center text-[16px] text-gray-400  font-medium sm:text-left pt-4">
              Blockdom is a P2E game based on digital assets.
              <br></br>
              Let&apos;s start your journey by minting an NFT land and establishing your kingdom on the blockchain.
              <br></br>
              <br></br>
              Enjoy free gameplay on the TESTNET and earn rewards on the MAINNET.
            </p>
          </motion.div>
          <div className="t-4 md:mt-8 flex flex-wrap px-[4rem] md:px-0 gap-2 justify-center md:justify-start">
            <motion.button
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="greenButton shadow-lg"
             
              onClick={() => {router.push("/testnet/explore")}}
            >
              Enter Testnet
            </motion.button>
            {/* <motion.button
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex flex-row items-center gap-3 outlineGreenButton"
            >
              Whitepaper <IoMdDownload className=" text-xl group-hover:translate-y-1 transition-all" />
            </motion.button> */}

          </div>
        </div>
      </div>
      <div className="w-full mt-20 md:mt-[10rem] sm:pr-[7%] lg:w-[50%] pt-[4rem] sm:pt-0 flex flex-col items-center gap-5 z-10   ">
        <div className=" px-4 lg:px-0 flex h-[30rem] w-full flex-nowrap  gap-3 mr-auto  justify-center lg:justify-start">
          <div className=" lg:w-1/2  h-full flex flex-row md:flex-col gap-3 justify-around ">
            <div className="  w-full h-1/2 items-center text-center border-r-2 border-b-2 border-gray-600/40 justify-around flex flex-col overflow-hidden relative">
              {/* <ExploreBox/> */}
              <h3 className=" text-[26px] font-bold italic">
                Pre-sale is <span className=" text-[#9FFFCF]">Live</span>!
              </h3>
              {/* <h2 className=" text-[16px] opacity-80">
                {" "}
                Select your land through the map
              </h2> */}
              <motion.button
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                className="greenButton shadow-lg "
                onClick={() => {router.push("/explore")}}
          
              >
                Explore
              </motion.button>
            </div>
            <div className="w-full h-1/2 lg:h-1/2 flex flex-col  border-t-2 border-r-2 border-gray-600/40 justify-around items-center text-center">
              <h3 className="px-3 opacity-80">
              Innovator in play-to-earn gaming through deflationary tokenomics.
              </h3>
              <motion.a
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                className="outlineGreenButton "
                href="#carousel"
              >
                Read more
              </motion.a>
            </div>
          </div>
          <div className="hidden h-full w-1/2 overflow-hidden border-l-2 border-gray-600/30 md:flex flex-col relative justify-center">
            <Image
              className=" hover:scale-125 hover:translate-y-12 hover:translate-x-8 transition ease-out duration-500 right-[6rem] sm:w-fit sm:h-fit absolute"
              src={"/images/world.png"}
              width={720}
              height={1024}
              alt={"test"}
              quality={30}
            ></Image>
          </div>
        </div>
        <div className="flex items-center md:w-full rounded-2xl overflow-hidden mr-auto justify-center  lg:justify-start">
          <Image
            src={"/images/parcelArt.png"}
            width={637}
            height={374}
            alt={"test2"}
          ></Image>
        </div>
      </div>

    </section>
  );
}
