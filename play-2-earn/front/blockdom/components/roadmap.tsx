import { roadmapSteps } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import React from "react";

export default function Roadmap() {

  const {ref} = useSectionInView("Roadmap")

  return (
    <section ref={ref} id="roadmap" className="relative mb-[22.5rem]">
      <div className="mb-10 px-8 text-center lg:text-left lg:px-[10rem]">
        <h3 className="mb-4 font-bold text-2xl text-[#A5F4B6]">Roadmap</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat, accusantium laudantium aspernatur, quis provident adipisci dolor odit amet voluptas ratione non alias libero cum architecto odio iure, blanditiis perferendis molestias.</p>
      </div>
      <div className="h-[50rem] w-1 md:h-1 left-[50%] md:left-0 md:w-full  absolute mt-[10rem] md:mt-[20rem] bg-gradient-to-t md:bg-gradient-to-r from-black via-gray-200 "></div>
      <div className=" w-[30rem] h-[20rem] bg-[#1a3a27] absolute left-1/2 -translate-x-1/2 mt-[25rem] md:mt-[10rem] rounded-full blur-[10rem]"></div>
      <div className=" relative flex flex-col md:flex-row items-center justify-around px-[10rem] h-[55rem] pt-[18rem] md:pt-0 mt-[10rem] md:h-[initial] md:mt-0 ">
        {roadmapSteps.map((step, index) => (
          <div key={index} className={"group relative "}>
            <div className=" md:group-odd:mt-[11rem] group-even:hidden absolute  w-[8rem] -mt-[2rem] -translate-x-[10rem] md:-translate-x-[40%]">
            
              <h3 className=" text-[16px] text-[#A5F4B6] text-center font-[700]">{step.title}</h3>
              <p className="text-[12px] mt-2  text-[#BFBFBF] text-center" >{step.description} Lorem ipsum dolor sit, amet consectetur</p>
              <p className=" text-center text-[12px] text-gray-100 mt-2 font-[700]">{step.releaseTime}</p>
            </div>
            <div
              className={` md:mt-[20rem] md:-translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[#1a2920] to-[#1c3827]  rounded-xl`}
            >
                <h3 className="w-full h-full flex flex-col items-center justify-center text-md">{step.stepNum}</h3> 
            </div>
            <div className=" -mt-[3rem] ml-[4rem] md:ml-0 md:group-even:mt-0 group-odd:hidden absolute w-[8rem] md:-translate-x-[40%]">
                
              <h3 className=" text-[16px] text-[#A5F4B6] text-center font-[700]">{step.title}</h3>
              <p className="text-[12px] mt-2  text-[#BFBFBF] text-center">{step.description}</p>
              <p className=" text-center text-[12px] text-gray-100 mt-2  font-[700]">{step.releaseTime}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
