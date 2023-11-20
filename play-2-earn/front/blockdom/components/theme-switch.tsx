"use client"
import { useTheme } from "@/context/theme-context";
import React from "react";
import { BsMoon, BsSun } from "react-icons/bs";


export default function ThemeSwitch() {

    const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className=" z-50 fixed bottom-5 right-5 bg-white w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-gray-300 border-opacity-40 shadow-xl rounded-full flex items-center justify-center hover:scale-115 active:scale-105 transition-all dark:bg-gray-900 dark:border-gray-800 dark:border-opacity-70"
    >
      {theme === "light" ? <BsSun /> : <BsMoon />}
    </button>
  );
}
