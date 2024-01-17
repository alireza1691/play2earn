"use client"
import { roadmapSteps } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import Image from "next/image";
import React from "react";

export default function Roadmap() {
  const { ref } = useSectionInView("Roadmap");

  return (
    <section ref={ref} id="roadmap" className="relative mb-[22.5rem]">
      <Image className=" -z-10  absolute right-0 lg:right-auto -bottom-[15rem] md:-bottom-[12.5rem] md:left-[3.5rem] lg:left-[7.5rem]" src={"/svgs/bgArts/roadmapUnion.svg"} width={240} height={240} alt="union" />

      <div className="z-10 h-[66rem] w-1 lg:h-1 left-[50%] lg:left-0  lg:w-full  absolute mt-[25rem] lg:mt-[25rem] bg-gradient-to-t lg:bg-gradient-to-r from-white dark:from-black via-blue-gray-400/60 dark:via-gray-200 "></div>
      <div className=" w-[30rem] h-[20rem] dark:bg-[#1a3a27] absolute left-1/2 -translate-x-1/2 mt-[25rem] md:mt-[10rem] rounded-full blur-[10rem]"></div>
      <div className=" absolute mb-10 px-8  lg:px-[10rem]">
        <h3 className="mb-4 font-bold text-[28px] text-[#2E4F3B] dark:text-[#A5F4B6]">Roadmap</h3>
        <p>
        To expand the platform and enhance the gaming experience, we have devised a roadmap outlining our strategic plans until the fourth quarter of 2024. Here are the key milestones on our roadmap.
        </p>
      </div>

      <div className="  relative flex flex-col lg:flex-row items-center lg:items-start justify-around  px-[10rem]  pt-[8rem] lg:pt-0 mt-[18.5rem] lg:h-[initial] lg:mt-[15rem] ">
        {roadmapSteps.map((step, key) => (
          <React.Fragment key={key}>
            <div className=" group relative w-fit md:w-full text-center">
              <h3 className="z-20 text-gray-400 px-3 py-2 -translate-x-1/2 -translate-y-1/4  absolute mt-[9.5rem] left-1/2 bg-gradient-to-br  from-[#1a2920] to-[#1c3827]  rounded-xl">
                {step.stepNum}
              </h3>
              <div className=" translate-y-[90%] lg:translate-y-0 group-odd:-left-[5.5rem] max-w-[120px]  md:max-w-[22.5rem] md: ml-auto md:mr-auto group-even:-right-[5.5rem] lg:group-odd:-left-0 lg:group-even:-right-0 lg:group-even:mt-[12.5rem] h-40 w-40 lg:w-[16rem] relative">
                <h3 className=" text-[16px] text-[#2E4F3B] dark:text-[#A5F4B6] text-center font-[700]">
                  {step.title}
                </h3>
                <p className="text-[12px] mt-2 text-gray-800  dark:text-[#BFBFBF] text-center font-[500] ">
                  {step.description} 
                </p>
                <p className="  text-center text-[12px] text-gray-900 dark:text-gray-100 mt-2 font-[700]">
                  {step.releaseTime}
                </p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
