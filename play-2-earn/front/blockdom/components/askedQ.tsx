"use client";
import React, { useState } from "react";
import { questions } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

export default function Questions() {
  const [openedQ, setOpenedQ] = useState<number | null>(null);
  const {ref} = useSectionInView("F Questions")
  return (
    <section ref={ref} id="questions" className=" transition-all duration-1000 ease-out w-full px-10 sm:px-[20%] xl:px-[25%] flex flex-col">
      <h2 className=" text-[36px] text-white text-center font-bold">
        Frequently Asked Questions
      </h2>

      <div className="min-h-20  mt-20 flex flex-col gap-4 relative overflow-hidden">
        {questions.map((question, index) => (
          <React.Fragment key={index}>
            <div
              onClick={() => setOpenedQ(openedQ == index ? null : index)}
                className={
                `${openedQ === index ? 'max-h-[20rem] transition-all duration-1000 ease-out' : 'transition-all duration-1000 ease-in max-h-[3.5rem] overflow-hidden'}  !cursor-pointer  overflow-hidden bg-gray-50/10 py-3 px-4 rounded-[0.5rem] relative `
              }
            //   className={
            //     `${openedQ === index ? 'max-h-[20rem] transition-max-h duration-1000 ease-out' : 'transition-min-h duration-1000 ease-in max-h-[3.5rem] overflow-hidden'}  !cursor-pointer flex flex-col overflow-hidden bg-gray-50/10 py-3 px-4 rounded-[0.5rem] relative `
            //   }
            // className={`!cursor-pointer relative bg-green-800 rounded-[0.5rem] py-3 px-4 transition-max-h duration-1000 ease-out ${
            //     openedQ === index ? 'max-h-[20rem]' : 'max-h-[3.5rem] overflow-hidden'
            //   }`}
            // className={
            //     `${openedQ === index ? 'max-h-[20rem] transition-max-h duration-1000 ease-out' : 'transition-max-h duration-1000 ease-out max-h-[3.5rem] overflow-hidden'}  !cursor-pointer flex flex-col overflow-hidden bg-gray-50/10 py-3 px-4 rounded-[0.5rem] relative `
            //   }
            >
              <div className="w-[20rem] h-[20rem] top-[-5rem] left-[-10rem] bg-green-800 absolute rounded-full blur-[8rem] -z-10"></div>
              <div className="transition-all duration-1000 ease-out flex justify-between">
                <h2 className="text-[14px] flex items-center ">
                  {question.title}
                </h2>
                {openedQ == index ? (
                  <a
                    className=" cursor-pointer p-1"
                    onClick={() => setOpenedQ(null)}
                  >
                    &#8963;
                  </a>
                ) : (
                  <a
                    className=" cursor-pointer p-1"
                    onClick={() => setOpenedQ(index)}
                  >
                    &gt;
                  </a>
                )}
              </div>
              {openedQ == index && (
                <p className="transition-all duration-1000 ease-out text-[12px] px-3 mt-3 font-light text-white opacity-80">
                  {question.answer}
                </p>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
