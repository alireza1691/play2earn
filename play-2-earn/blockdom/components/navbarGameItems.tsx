import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import BackIcon from "@/svg/backIcon";
import BattleLogActiveIcon from "@/svg/battleLogActiveIcon";
import BattleLogIcon from "@/svg/battleLogIcon";
import ExploreActiveIcon from "@/svg/exploreActiveIcon";
import ExploreIcon from "@/svg/exploreIcon";
import MyLandActiveIcon from "@/svg/myLandActiveIcon";
import MyLandIcon from "@/svg/myLandIcon";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function NavbarGameItems() {
  const { selectedParcel, setSelectedParcel, setSelectedLand } = useMapContext();
  const { ownedLands } = useUserDataContext();

  const router = useRouter();
  const currentRoute = usePathname();

  useEffect(() => {
    
  },[ownedLands])

  return (
    <div className="hidden  md:flex md:gap-x-10 translate-x-[30%] ">
      {/* {currentRoute == "/explore" &&  */}
      <>
        <a
          onClick={() => {setSelectedParcel(null) , setSelectedLand(null)}}
          className={`${
            selectedParcel == null
              ? " brightness-50"
              : " text-gray-800 dark:text-gray-50 hover:bg-black/10 cursor-pointer "
          } flex flex-col justify-center items-center transition-all  p-2 rounded-lg text-sm font-semibold leading-6`}
        >
          <BackIcon />
          Back
        </a>
        <h3 className=" mt-auto mb-auto">|</h3>
      </>

      {/* } */}

      <a
        onClick={() => {
          router.push("/explore");
        }}
        className={`${
          currentRoute == "/explore"
            ? " brightness-100  bg-black/20 text-[#B9F8EE] "
            : "text-gray-800 dark:text-gray-50 hover:bg-black/10"
        } flex flex-col justify-center items-center transition-all  p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 `}
      >
        {currentRoute == "/explore" ? <ExploreActiveIcon /> : <ExploreIcon />}
        Explore
      </a>
      {ownedLands && ownedLands.length > 0 ? (  <a
        onClick={() => {
          router.push("/myLand");
        }}
        className={`${
          currentRoute == "/myLand"
            ? " brightness-100  bg-black/20 text-[#B9F8EE] "
            : "text-gray-800 dark:text-gray-50 hover:bg-black/10"
        } flex flex-col justify-center items-center transition-all  p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 `}
      >
        {currentRoute == "/myLand" ? <MyLandActiveIcon /> : <MyLandIcon />}
        My land
      </a>) :(
        <a
          className={` brightness-50 flex flex-col justify-center items-center   p-2 rounded-lg  text-sm font-semibold leading-6 `}
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
        } flex flex-col justify-center items-center transition-all  p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 `}
      >
        {currentRoute == "/battleLog" ? (
          <BattleLogActiveIcon />
        ) : (
          <BattleLogIcon />
        )}
        Battle log
      </a>
    </div>
  );
}
