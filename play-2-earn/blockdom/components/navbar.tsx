"use client";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useTheme } from "@/context/theme-context";
import { usePathname } from "next/navigation";
import { BsMoon, BsSun } from "react-icons/bs";
import DarkLogo from "@/svg/darkLogo";
import LightLogo from "@/svg/lightLogo";
import NavDropdownMobileScreen from "./navDropdownMobileScreen";
import NavbarLandingItems from "./navbarLandingItems";
import NavbarGameItems from "./navbarGameItems";
import { getMintedLandsFromEvents, getOwnedLands } from "@/lib/utils";
import { useApiData } from "@/context/api-data-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townPInst } from "@/lib/instances";
import { InViewLandType, landDataResType } from "@/lib/types";
import { formatEther, parseEther } from "ethers/lib/utils";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { apiData } = useApiData();
  const { setOwnedLands, ownedLands, setInViewLand } = useUserDataContext();
  const address = useAddress();

  const { theme, toggleTheme } = useTheme();

  const currentRoute = usePathname();

  useEffect(() => {
    const data = async () => {
      if (address && apiData) {
        const ownedl = getOwnedLands(
          getMintedLandsFromEvents(apiData?.result),
          address
        );
        setOwnedLands(ownedl);
        if (ownedl.length>0) {
          const defaultLandData: landDataResType = await townPInst.getLandIdData(
            Number(ownedl[0].tokenId)
          );
    
          const defaultLand: InViewLandType = {
            tokenId: Number(ownedl[0].tokenId),
            townhallLvl: defaultLandData.townhallLevel,
            wallLvl: defaultLandData.wallLevel,
            barracksLvl: defaultLandData.barracksLevel,
            trainingCampLvl: defaultLandData.trainingCampLevel,
            goodsBalance: [ defaultLandData.goodsBalance[0],  defaultLandData.goodsBalance[1]],
            buildedResourceBuildings: defaultLandData.buildedResourceBuildings,
          };
          setInViewLand(defaultLand)
          console.log("default land:", defaultLand);
     
        }
      

      }
      if (!address) {
        setOwnedLands(null);
      }
    };
    data();
  }, [address, apiData]);

  return (
    <>
      <header className=" z-50 relative">
        <div className="fixed  w-full  h-[4rem] from-[#A9FFDE] to-[#7ECFB3] bg-gradient-to-r dark:from-[#34594B] dark:to-[#213830]  top-0 z-30  shadow-md md:shadow-none"></div>
        <nav
          className="fixed mx-auto top-0 flex  items-center justify-between px-4  lg:px-8 h-[4rem] w-screen z-30 "
          aria-label="Global"
        >
          <div className="flex   ">
            <a
              href="/"
              // onClick={() => {
              //   router.push("/");
              // }}
              className="md:m-2.5 cursor-pointer "
            >
              {theme === "light" ? <DarkLogo /> : <LightLogo />}
            </a>
          </div>

          <div className=" ml-3 md:ml-5 flex md:hidden   ">
            <button
              className=" -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-800 dark:text-gray-50 right-0 w-fit mr-2"
              onClick={() => {
                mobileMenuOpen === false
                  ? setMobileMenuOpen(true)
                  : setMobileMenuOpen(false);
              }}
            >
              <FaBars className=" h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          {currentRoute === "/" ? <NavbarLandingItems /> : <NavbarGameItems />}

          <div className=" !hidden md:!flex   justify-center items-center gap-3">
            <button
              onClick={toggleTheme}
              className="  bg-[#06291D] text-white bg-opacity-50  w-[2.5rem] h-[2.5rem]  backdrop-blur-[0.5rem]  rounded-xl flex items-center justify-center hover:scale-115 active:scale-105 transition-all hover:bg-opacity-70  "
            >
              {theme === "light" ? <BsSun /> : <BsMoon />}
            </button>
            <ConnectWallet
              className=" !bg-[#06291D] !bg-opacity-50  !p-3 "
              modalSize="wide"
              theme={theme === "dark" ? "dark" : "light"}
              welcomeScreen={{
                title: "Blockdom",
                subtitle: "Decentralized P2E game",
                img: {
                  src: "/BlockdomLogo.png",
                  width: 120,
                  height: 120,
                },
              }}
            />
          </div>
        </nav>
        <div className="md:hidden">
          {/* <div className="fixed inset-0 z-30" /> */}
          {mobileMenuOpen && (
            <NavDropdownMobileScreen setMobileMenuOpen={setMobileMenuOpen} />
          )}
        </div>
      </header>
    </>
  );
}
