import { roadmapSteps } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import React from "react";

export default function Roadmap() {
  const { ref } = useSectionInView("Roadmap");

  return (
    <section ref={ref} id="roadmap" className="relative mb-[22.5rem]">
      <div className="h-[66rem] w-1 md:h-1 left-[50%] md:left-0 md:w-full  absolute mt-[25rem] md:mt-[25rem] bg-gradient-to-t md:bg-gradient-to-r from-white dark:from-black via-blue-gray-400/60 dark:via-gray-200 "></div>
      <div className=" w-[30rem] h-[20rem] dark:bg-[#1a3a27] absolute left-1/2 -translate-x-1/2 mt-[25rem] md:mt-[10rem] rounded-full blur-[10rem]"></div>
      <div className=" absolute mb-10 px-8 text-center lg:text-left lg:px-[10rem]">
        <h3 className="mb-4 font-bold text-[28px] text-[#2E4F3B] dark:text-[#A5F4B6]">Roadmap</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat,
          accusantium laudantium aspernatur, quis provident adipisci dolor odit
          amet voluptas ratione non alias libero cum architecto odio iure,
          blanditiis perferendis molestias.
        </p>
      </div>

      <div className="  relative flex flex-col md:flex-row items-center md:items-start  justify-around px-[10rem]  pt-[8rem] md:pt-0 mt-[18.5rem] md:h-[initial] md:mt-[15rem] ">
        {roadmapSteps.map((step, index) => (
          <React.Fragment>
            <div className=" group relative w-fit ">
              <h3 className=" text-gray-400 px-3 py-2 -translate-x-1/2 -translate-y-1/4  absolute mt-[9.5rem] left-1/2 bg-gradient-to-br  from-[#1a2920] to-[#1c3827]  rounded-xl">
                {step.stepNum}
              </h3>
              <div className=" translate-y-3/4 md:translate-y-0 group-odd:-left-[6.5rem] group-even:-right-[6.5rem] md:group-odd:-left-0 md:group-even:-right-0 md:group-even:mt-[12.5rem] h-40 w-40  relative">
                <h3 className=" text-[16px] text-[#2E4F3B] dark:text-[#A5F4B6] text-center font-[700]">
                  {step.title}
                </h3>
                <p className="text-[12px] mt-2 text-gray-800  dark:text-[#BFBFBF] text-center font-[500]">
                  {step.description} Lorem ipsum dolor sit, amet consectetur
                </p>
                <p className=" text-center text-[12px] text-gray-900 dark:text-gray-100 mt-2 font-[700]">
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
