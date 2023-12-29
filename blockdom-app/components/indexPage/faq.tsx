"use client"
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { questions } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";
import Image from "next/image";

export default function FAQ() {
  const { ref } = useSectionInView("F Questions");
  const { theme } = useTheme();

  return (
    <section
      className="px-8 flex flex-col items-center justify-center  md:px-24 relative "
      ref={ref}
      id="questions"
    >
      <Image
        className=" left-[2rem] -top-[6rem] md:-top-[4rem] xl:left-[10rem] lg:left-[6rem] 2xl:left-[15%] md:left-[3.75rem]  absolute"
        src={
          theme == "dark"
            ? "/svgs/bgArts/questionsLeftUnion.svg"
            : "/svgs/bgArts/lightQuestionsLeftUnion.svg"
        }
        width={240}
        height={240}
        alt={"leftUnion"}
      ></Image>
      <Image
        className=" right-0 xl:right-[10rem] lg:right-[6rem] 2xl:right-[15%] top-[27.5rem] md:top-[25rem] lg:top-[22.5rem]  md:bottom-[10rem]  md:right-[3.75rem] -bottom-[5rem] absolute "
        src={
          theme == "dark"
            ? "/svgs/bgArts/questionsRightUnion.svg"
            : "/svgs/bgArts/lightQuestionsRightUnion.svg"
        }
        width={240}
        height={240}
        alt={"leftUnion"}
      ></Image>
        <div className="z-10 mb-[3rem]">
        <h2
        className={` text-[36px]   text-center font-bold ${
          theme === "dark" ? "text-white" : "gradientTitle"
        }`}
      >
        Frequently Asked Questions
      </h2>
        </div>

      <div className="w-full lg:w-[40rem] flex flex-row justify-center items-center z-10 ">
        <Accordion variant="splitted" >
          {/* <div className="dark:w-[20rem]  dark:h-[20rem] h-[35rem] w-[35rem] top-[-5rem] dark:left-[-15rem] -right-[5rem] bg-gray-600/30 dark:bg-green-800 absolute rounded-full blur-[8rem] -z-10"></div> */}

          {questions.map((item, key) => (

          
            <AccordionItem
              className={`relative !bg-transparent !shadow-none bg-gradient-to-l from-gray-300/70 via-gray-300/70 to-white/80 dark:from-gray-800/40 dark:via-gray-800/40 dark:to-green-700/90 `}
              // className={` !bg-transparent !shadow-none bg-gradient-to-l from-gray-300/70 via-gray-300/70 to-white/80 `}

              key={key}
              aria-label="Accordion 1"
              title={item.title}
            >
       
              <p
                className={`${
                  theme === "dark"
                    ? "text-gray-200"
                    : "gradientParagraph opacity-80"
                }}`}
              >
                {" "}
                {item.answer}
              </p>
            </AccordionItem>

          ))}
        </Accordion>
      </div>
      
    </section>
  );
}
