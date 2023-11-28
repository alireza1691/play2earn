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
      <Image className="xl:left-[10rem] lg:left-[6rem] 2xl:left-[15%] md:left-[3.75rem]  -z-10 absolute" src={ theme == "dark" ? "/svg/unions/questionsLeftUnion.svg" : "/svg/unions/lightQuestionsLeftUnion.svg"} width={240} height={240} alt={"leftUnion"}></Image>
      <Image className=" right-0 xl:right-[10rem] lg:right-[6rem] 2xl:right-[15%] lg:-bottom-[5rem] -z-10 md:-bottom-[10rem]  md:right-[3.75rem] -bottom-[5rem] absolute " src={ theme == "dark" ?"/svg/unions/questionsRightUnion.svg": "/svg/unions/lightQuestionsRightUnion.svg"} width={240} height={240} alt={"leftUnion"}></Image>

      <h2
        className={` text-[36px]  text-center font-bold ${
          theme === "dark" ? "text-white" : "gradientTitle"
        }`}
      >
        Frequently Asked Questions
      </h2>

      <div className="min-h-20 mt-20 flex flex-col gap-4 relative overflow-hidden">
        {questions.map((question, index) => (
          <React.Fragment key={index}>
            <div
              onClick={() => setOpenedQ(openedQ == index ? null : index)}
              className={`${
                openedQ === index
                  ? "max-h-[20rem] transition-all duration-1000 ease-out"
                  : " ease-in max-h-[3.5rem] overflow-hidden"
              }  !cursor-pointer  overflow-hidden bg-gray-white dark:bg-gray-50/10 py-3 px-4 rounded-[0.5rem] relative `}
            >
              <div className="dark:w-[20rem] dark:h-[20rem] h-[35rem] w-[35rem] top-[-5rem] dark:left-[-15rem] -right-[5rem] bg-gray-600/30 dark:bg-green-800 absolute rounded-full blur-[8rem] -z-10"></div>
              <div className="transition-all ease-out flex justify-between">
                <h2 className="text-[15px] font-semibold flex items-center ">
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
                <p
                  className={` transition-all duration-1000 ease-out text-[12px] px-3 mt-3 font-medium ${
                    theme === "dark"
                      ? "text-gray-200"
                      : "gradientParagraph opacity-80"
                  } `}
                >
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
