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
import React, { useEffect } from "react";
import { HiChevronDown } from "react-icons/hi";
import { routeFor, useDeployment } from "@/lib/deployments";
import { useOpenMyLand } from "./gameComponents/landPicker";


export default function NavbarGameItems() {
  const { selectedParcel, setSelectedParcel, setSelectedLand } = useMapContext();
  const { ownedLands } = useUserDataContext();
  // Several lands means asking which one first, rather than dropping the
  // player on whichever the event log happened to return first.
  const openMyLand = useOpenMyLand();

  const router = useRouter();
  const currentRoute = usePathname();
  const isTestnet = currentRoute.includes("/testnet/");
  const deployment = useDeployment();
  useEffect(() => {
    
  },[ownedLands])

  return (
    <div className="hidden  lg:flex md:gap-x-4 lg:gap-x-10  absolute left-1/2  md:-translate-x-2/3 lg:-translate-x-1/2">
      {/* {currentRoute == "/explore" &&  */}
      <>
        <a
          onClick={() => {setSelectedParcel(null) , setSelectedLand(null)}}
          data-disabled={selectedParcel == null}
          className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all p-2 cursor-pointer"
        >
          <BackIcon />
          Back
        </a>
        <span className="mt-auto mb-auto h-4 w-px bg-[#F4F4F1]/20"></span>
      </>

      {/* } */}

      <a
        onClick={() => {
          router.push(routeFor(deployment, "explore"));
        }}
        data-active={currentRoute.endsWith("/explore")}
        className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all p-2 cursor-pointer"
      >
        {currentRoute.endsWith("/explore") ? <ExploreActiveIcon /> : <ExploreIcon />}
        Explore
      </a>
      {ownedLands && ownedLands.length > 0 ? (  <a
        onClick={openMyLand}
        data-active={currentRoute.endsWith("/myLand")}
        className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all p-2 cursor-pointer"
      >
        {currentRoute.endsWith("/myLand") ? <MyLandActiveIcon /> : <MyLandIcon />}
        My land

      </a>) :(
        <a
          data-disabled="true"
          className="pwNavLink flex flex-col justify-center items-center gap-1 p-2"
        >
          {currentRoute.endsWith("/myLand") ? <MyLandActiveIcon /> : <MyLandIcon />}
          My land
        </a>
      )}
    
    {ownedLands && ownedLands.length > 0 ? ( 
      <a
        onClick={() => {
          router.push(routeFor(deployment, "battleLog"));
        }}
        data-active={currentRoute.endsWith("/battleLog")}
        className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all p-2 cursor-pointer"
      >
        {currentRoute.endsWith("/battleLog") ? (
          <BattleLogActiveIcon />
        ) : (
          <BattleLogIcon />
        )}
        Battle log
      </a>
    ) : (
      <a
 
        data-disabled="true"
        className="pwNavLink flex flex-col justify-center items-center gap-1 p-2"
      >
        {currentRoute.endsWith("/battleLog") ? (
          <BattleLogActiveIcon />
        ) : (
          <BattleLogIcon />
        )}
        Battle log
      </a>
    )}

    {/* Not gated on owning a land: this is where a new player goes to apply to
        a clan, and where anyone founds one. Gating it would hide the entry
        point from exactly the people looking for it. */}
    <a
      onClick={() => {
        router.push(routeFor(deployment, "clans"));
      }}
      data-active={currentRoute.endsWith("/clans")}
      className="pwNavLink flex flex-col justify-center items-center gap-1 transition-all p-2 cursor-pointer"
    >
      <ClansIcon
        active={currentRoute.endsWith("/clans")}
      />
      Clans
    </a>
    </div>
  );
}
