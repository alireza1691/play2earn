"use client";
import { useActiveSectionContext } from "@/context/active-section-context";
import { links } from "@/lib/data";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/context/theme-context";

export default function SideBar() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();

    const { theme } = useTheme()

  return (
    <div className="fixed -left-6 z-30 top-[17.5rem] invisible md:visible">
      <ul className=" flex flex-col gap-1 items-center ">
        {links.map((link, index) => (
          <motion.a
            href={link.hash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={index}
            className={` group px-3 py-3 rounded-full transition-all ease-linear text-center cursor-pointer ${
              activeSection === link.name
                ? "w-36 my-[3rem]  bg-gradient-to-r  -rotate-90 from-[#63AE94]/50 to-[#8EE5C4]/50 hover:from-gray-500/50 hover:to-[#8EE5C4]  dark:from-gray-900/80 dark:to-[#5ECFA4]/40  dark:hover:from-gray-800/80 dark:hover:to-[#5ECFA4]/50 "
                : " bg-gray-400/70 dark:bg-gray-800/70 hover:bg-gray-700/70 dark:hover:bg-gray-600/70"
            }`}
            onClick={() => {
              setActiveSection(link.name);
              setTimeOfLastClick(Date.now);
            }}
          >
            {activeSection === link.name ? (
              <div className="flex flex-row justify-around">
              <h3 className=" text-[16px] font-medium">
              {link.name}
              </h3>
              <Image className="  rotate-90" src={theme === "dark" ? link.icon : link.darkIcon} width={20} height={20} alt="icon" />
              </div>
              
            ) : (
              <Image src={theme === "dark" ? link.icon : link.darkIcon} width={20} height={20} alt="icon" />
            )}
          </motion.a>
        ))}
      </ul>
    </div>
  );
}
