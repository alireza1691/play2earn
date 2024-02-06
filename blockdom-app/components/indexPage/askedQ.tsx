"use client";
import React, { useState } from "react";
import { questions } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";

export default function Questions() {
  const [openedQ, setOpenedQ] = useState<number | null>(null);
  const { ref } = useSectionInView("F Questions");
  const { theme } = useTheme();
  return (
    <section
      ref={ref}
      id="questions"
      className=" relative lg:h-[35rem] transition-all duration-1000 ease-out w-full px-4 md:px-[20%] xl:px-[25%] flex flex-col"
    >
      {/* <Image className="xl:left-[10rem] lg:left-[6rem] 2xl:left-[15%] md:left-[3.75rem]  -z-10 absolute" src={ theme == "dark" ? "/svg/unions/questionsLeftUnion.svg" : "/svg/unions/lightQuestionsLeftUnion.svg"} width={240} height={240} alt={"leftUnion"}></Image>
      <Image className=" right-0 xl:right-[10rem] lg:right-[6rem] 2xl:right-[15%] lg:-bottom-[5rem] -z-10 md:-bottom-[10rem]  md:right-[3.75rem] -bottom-[5rem] absolute " src={ theme == "dark" ?"/svg/unions/questionsRightUnion.svg": "/svg/unions/lightQuestionsRightUnion.svg"} width={240} height={240} alt={"leftUnion"}></Image> */}

      <h2
        className={` text-[36px]  text-center font-bold gradientTitle ${""
          // theme === "dark" ? "text-white" : "gradientTitle"
        }`}
      >
        Frequently Asked Questions
      </h2>

      <div className="flex flex-col gap-2 relative">
        {questions.map((question, key) => (
    
            <div key={key} className="z-10 bg-gray-500/10 py-1 px-1 rounded-xl relative overflow-hidden">
              <div className={`-z-10 w-[30rem] h-[30rem]  ${question.position} left-[-10rem] bg-green-800 absolute rounded-full blur-[5rem]`}></div>

              <a
                onClick={() => {
                  openedQ == key ? setOpenedQ(null) : setOpenedQ(key);
                }}
                className={` cursor-pointer flex flex-row items-center  justify-between w-full px-4 py-2  !font-normal !text-[16px] focus:outline-none transition-colors duration-300 hover:brightness-105`}
              >
                {question.title}
              </a>
              <div
                className={`overflow-hidden transition-max-height  duration-500 mt-1 ${
                  openedQ == key ? "max-h-40" : "max-h-0"
                }`}
              >
                {openedQ == key && (
                  <div
                    className={` py-2 px-1  max-h-40 gap-1 flex flex-col`}
                  >
                    {question.answer}
                  </div>
                )}
              </div>
            </div>
        ))}
      </div>
    </section>
  );
}
