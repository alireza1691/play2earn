"use client";
import { useUserDataContext } from "@/context/user-data-context";
import BattleLogActiveIcon from "@/svg/battleLogActiveIcon";
import BattleLogIcon from "@/svg/battleLogIcon";
import ExploreActiveIcon from "@/svg/exploreActiveIcon";
import ExploreIcon from "@/svg/exploreIcon";
import MyLandActiveIcon from "@/svg/myLandActiveIcon";
import MyLandIcon from "@/svg/myLandIcon";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function BottomBar() {
  const router = useRouter();
  const currentRoute = usePathname();
  const { ownedLands } = useUserDataContext();
  return (
    <>
    {currentRoute != "/" && 
      <div className=" w-full z-30 h-[4rem] fixed bottom-0 bg-gradient-to-r from-[#A9FFDE] to-[#7ECFB3] dark:from-[#34594B]/60 dark:to-[#213830]/60 sm:hidden dark:bg-[#000000] flex flex-row  justify-around ">
        <a
          onClick={() => {
            router.push("/explore");
          }}
          className={`${
            currentRoute == "/explore"
              ? " brightness-100  bg-black/20 text-[#B9F8EE] "
              : "text-gray-800 dark:text-gray-50 hover:bg-black/10"
          } flex flex-col justify-center items-center transition-all max-h-[3.75rem] mt-auto p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 `}
        >
          {currentRoute == "/explore" ? <ExploreActiveIcon /> : <ExploreIcon />}
          Explore
        </a>
        {ownedLands && ownedLands.length > 0 ? (
          <a
            onClick={() => {
              router.push("/myLand");
            }}
            className={`${
              currentRoute == "/myLand"
                ? " brightness-100  bg-black/20 text-[#B9F8EE] "
                : "text-gray-800 dark:text-gray-50 hover:bg-black/10"
            } flex flex-col justify-center items-center transition-all max-h-[3.75rem] mt-auto p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6`}
          >
            {currentRoute == "/myLand" ? <MyLandActiveIcon /> : <MyLandIcon />}
            My land
          </a>
        ) : (
          <a
            className={` brightness-50 flex flex-col justify-center items-center  max-h-[3.75rem] mt-auto p-2 rounded-lg  text-sm font-semibold leading-6 `}
          >
            {currentRoute == "/myLand" ? <MyLandActiveIcon /> : <MyLandIcon />}
            My land
          </a>
        )}

        <a
          onClick={() => {
            router.push("/battleLog");
          }}
          className={`${
            currentRoute == "/battleLog"
              ? " brightness-100  bg-black/20 text-[#B9F8EE] "
              : "text-gray-800 dark:text-gray-50 hover:bg-black/10"
          } flex flex-col justify-center items-center transition-all max-h-[3.75rem] mt-auto p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 `}
        >
          {currentRoute == "/battleLog" ? (
            <BattleLogActiveIcon />
          ) : (
            <BattleLogIcon />
          )}
          Battle log
        </a>
      </div>
      }
    </>
  );
}
