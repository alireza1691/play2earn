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
import { HiChevronDown } from "react-icons/hi";


export default function NavbarGameItems() {
  const { selectedParcel, setSelectedParcel, setSelectedLand } = useMapContext();
  const { ownedLands } = useUserDataContext();

  const router = useRouter();
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");
  useEffect(() => {
    
  },[ownedLands])

  return (
    <div className="hidden  lg:flex md:gap-x-4 lg:gap-x-10  absolute left-1/2  md:-translate-x-2/3 lg:-translate-x-1/2">
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
          router.push(isTestnet ? "/testnet/explore" : "/explore");
        }}
        className={`${
          currentRoute == "/explore" || currentRoute == "/testnet/explore"
            ? " brightness-100  bg-black/20 text-[#B9F8EE] "
            : "text-gray-800 dark:text-gray-50 hover:bg-black/10"
        } flex flex-col justify-center items-center transition-all  p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 `}
      >
        {currentRoute == "/explore" ? <ExploreActiveIcon /> : <ExploreIcon />}
        Explore
      </a>
      {ownedLands && ownedLands.length > 0 ? (  <a 
        onClick={() => {
          router.push(isTestnet ? "/testnet/myLand" : "/myLand");
        }}
        className={`${
          currentRoute == "/myLand" || currentRoute == "/testnet/myLand"
            ? " brightness-100  bg-black/20 text-[#B9F8EE] "
            : "text-gray-800 dark:text-gray-50 hover:bg-black/10"
        } flex flex-col justify-center items-center transition-all  p-2 rounded-lg cursor-pointer text-sm font-semibold leading-6 `}
      >
        {currentRoute == "/myLand" || currentRoute == "/testnet/myLand" ? <MyLandActiveIcon /> : <MyLandIcon />}
        My land

      </a>) :(
        <a
          className={` brightness-50 flex flex-col justify-center items-center   p-2 rounded-lg  text-sm font-semibold leading-6 `}
        >
          {currentRoute == "/myLand"|| currentRoute == "/testnet/myLand"  ? <MyLandActiveIcon /> : <MyLandIcon />}
          My land
        </a>
      )}
    
    {ownedLands && ownedLands.length > 0 ? ( 
      <a
        onClick={() => {
          router.push(isTestnet ? "/testnet/battleLog": "/battleLog");
        }}
        className={`${
          currentRoute == "/battleLog"|| currentRoute == "/testnet/battleLog"
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
    ) : (
      <a
 
        className={` brightness-50 flex flex-col justify-center items-center transition-all  p-2 rounded-lg  text-sm font-semibold leading-6 `}
      >
        {currentRoute == "/battleLog" ? (
          <BattleLogActiveIcon />
        ) : (
          <BattleLogIcon />
        )}
        Battle log
      </a>
    )}
    </div>
  );
}
