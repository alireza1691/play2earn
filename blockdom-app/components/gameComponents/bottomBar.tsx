"use client";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import BackIcon from "@/svg/backIcon";
import BattleLogActiveIcon from "@/svg/battleLogActiveIcon";
import BattleLogIcon from "@/svg/battleLogIcon";
import ClansIcon from "@/svg/clansIcon";
import ExploreActiveIcon from "@/svg/exploreActiveIcon";
import ExploreIcon from "@/svg/exploreIcon";
import MyLandActiveIcon from "@/svg/myLandActiveIcon";
import MyLandIcon from "@/svg/myLandIcon";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { routeFor, useDeployment } from "@/lib/deployments";
import { useOpenMyLand } from "./landPicker";

export default function BottomBar() {
  const router = useRouter();
  const currentRoute = usePathname();
  const deployment = useDeployment();
  const { ownedLands } = useUserDataContext();
  // Same rule as the desktop navbar: more than one land asks which.
  const openMyLand = useOpenMyLand();
  const {setSelectedParcel,setSelectedLand,selectedParcel} = useMapContext()
  return (
    <>
    {currentRoute != "/" && 
      <div className=" lg:hidden w-[94dvw] rounded-[4px] left-1/2 -translate-x-1/2 z-50 h-[4rem] fixed bottom-2  bottomBar flex flex-row  justify-around backdrop-blur-sm ">  <a
      onClick={() => {setSelectedParcel(null) , setSelectedLand(null)}}
      data-disabled={selectedParcel == null}
      className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all p-2 cursor-pointer"
    >
      <BackIcon />
      Back
    </a>
    <span className="mt-auto mb-auto h-4 w-px bg-[#F4F4F1]/20"></span>
        <a
          onClick={() => {
            router.push(routeFor(deployment, "explore"));
          }}
          data-active={currentRoute.endsWith("/explore")}
          className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all max-h-[3.75rem] mt-auto p-2 cursor-pointer"
        >
          {currentRoute == "/explore" ? <ExploreActiveIcon /> : <ExploreIcon />}
          Explore
        </a>
        {ownedLands && ownedLands.length > 0 ? (
          <a
            onClick={openMyLand}
            data-active={currentRoute.endsWith("/myLand")}
            className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all max-h-[3.75rem] mt-auto p-2 cursor-pointer"
          >
            {currentRoute == "/myLand" ? <MyLandActiveIcon /> : <MyLandIcon />}
            My land
          </a>
        ) : (
          <a
            data-disabled="true"
            className="pwNavLink flex flex-col justify-center items-center gap-1 max-h-[3.75rem] mt-auto p-2"
          >
            {currentRoute == "/myLand" ? <MyLandActiveIcon /> : <MyLandIcon />}
            My land
          </a>
        )}

        <a
          onClick={() => {
            router.push(routeFor(deployment, "battleLog"));
          }}
          data-active={currentRoute.endsWith("/battleLog")}
          className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all max-h-[3.75rem] mt-auto p-2 cursor-pointer"
        >
          {currentRoute == "/battleLog" ? (
            <BattleLogActiveIcon />
          ) : (
            <BattleLogIcon />
          )}
          Battle log
        </a>

        <a
          onClick={() => {
            router.push(routeFor(deployment, "clans"));
          }}
          data-active={currentRoute.endsWith("/clans")}
          className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all max-h-[3.75rem] mt-auto p-2 cursor-pointer"
        >
          <ClansIcon active={currentRoute.endsWith("/clans")} />
          Clans
        </a>
      </div>
      }
    </>
  );
}
