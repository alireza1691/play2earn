"use client";
import { ConnectWallet, useAddress, useChainId } from "@thirdweb-dev/react";
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
import { getOwnedBuildings, getOwnedLands } from "@/lib/utils";
import { useApiData } from "@/context/api-data-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townPInst } from "@/lib/instances";
import { InViewLandType, landDataResType, MintedLand } from "@/lib/types";
import BackIcon from "@/svg/backIcon";
import { useMapContext } from "@/context/map-context";
import BalanceContainer from "./gameComponents/townComponents/balanceContainer";

import ChainIdButton from "./chainIdButton";
import { useBlockchainStateContext } from "@/context/blockchain-state-context";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [isTestnet,setIsTestnet] = useState()
  const {

    mintedLands,
    buildedResourceBuildings,

    loading
  } = useApiData();
  const {
    setOwnedLands,
    setInViewLand,
    setBuildedResBuildings,
    inViewLand,
    chosenLand,
    setChosenLand,
 setIsUserDataLoading,setBMTBalance,
 landUpdateTrigger,setLandUpdateTrigger
  } = useUserDataContext();
  const { setSelectedParcel, setSelectedLand, selectedParcel } =
    useMapContext();
  const address = useAddress();
  const chainId = useChainId()

  const { theme, toggleTheme } = useTheme();

  const currentRoute = usePathname();
 
    const isTestnet = currentRoute.includes("/testnet/");

 
  const handleInViewLand = async (land: MintedLand) => {
  
    try {
      
      const defaultLandData: landDataResType = await townPInst.getLandIdData(
        Number(land.tokenId)
      );
      console.log("instances fetched");
      const remainedWorkerBusyTime = await townPInst.getRemainedBuildTimestamp(
        Number(land.tokenId)
      );
      
      
      const warriors = await townPInst.getArmy(Number(land.tokenId));
      const defaultLand: InViewLandType = {
        tokenId: Number(land.tokenId),
        townhallLvl: defaultLandData.townhallLevel,
        wallLvl: defaultLandData.wallLevel,
        barracksLvl: defaultLandData.barracksLevel,
        trainingCampLvl: defaultLandData.trainingCampLevel,
        goodsBalance: [
          defaultLandData.goodsBalance[0],
          defaultLandData.goodsBalance[1],
        ],
        buildedResourceBuildings: defaultLandData.buildedResourceBuildings,
        remainedBuildTime: remainedWorkerBusyTime,
        army: warriors
      };
      setInViewLand(defaultLand);
      console.log("default land:", defaultLand);
      if (buildedResourceBuildings) {
        const resBildingsOfDefaultLand = getOwnedBuildings(
          buildedResourceBuildings,
          Number(land.tokenId)
        );
        setBuildedResBuildings(resBildingsOfDefaultLand);

      }
      setIsUserDataLoading(false)
    } catch (error) {
      console.log("We have a trouble with getting inViewLand");
      
    }
  
  };

  useEffect(() => {
    const data = async () => {
      if (address  && mintedLands) {
      
       
        const ownedl = getOwnedLands(mintedLands, address);
        setOwnedLands(ownedl);
        if (!chosenLand && ownedl.length > 0) {
      
          
          setChosenLand(ownedl[0]);
        }
        if (isTestnet) { 
          if (!inViewLand && !chosenLand) {
            console.log("1");
            await handleInViewLand(ownedl[0])
          
          }
          if (landUpdateTrigger && chosenLand) {
            console.log("land data triggered");
            await handleInViewLand(ownedl[0])
            console.log("land data updated by trigger");
            setLandUpdateTrigger(false)
          }
          if (chosenLand && inViewLand && Number(chosenLand.tokenId) != inViewLand.tokenId) {  
            setIsUserDataLoading(true)
            await handleInViewLand(chosenLand)
           
          }
        }  else {
          setInViewLand(null)
          setIsUserDataLoading(false)
        }
    
      }
      if (!address) {
        setOwnedLands(null);
      }
      if(address){
        const connectedWalletBal = await townPInst.getBMTbalance(address)
        setBMTBalance(connectedWalletBal)
      }
    };
    data();
  }, [
    address,
    chosenLand,
    inViewLand,
    chainId,
    landUpdateTrigger
  ]);

  return (
    <>
      <header className=" z-50 relative">
        <div className="fixed  w-full  h-[4rem] from-[#A9FFDE] to-[#7ECFB3] bg-gradient-to-r dark:from-[#34594B] dark:to-[#213830]  top-0 z-30  shadow-md md:shadow-none"></div>
        <nav
          className="fixed mx-auto top-0 flex   items-center justify-between px-4  lg:px-8 h-[4rem] w-screen z-30 "
          aria-label="Global"
        >
          <div className="flex  flex-row items-center gap-4  ">
            <a
              href="/"
              // onClick={() => {
              //   router.push("/");
              // }}
              className="md:m-2.5 cursor-pointer "
            >
              {theme === "light" ? <DarkLogo /> : <LightLogo />}
            </a>
            
            <div className="hidden md:flex"> <ChainIdButton/></div>
           
          </div>
          {currentRoute == "/explore" && (
            <a
              onClick={() => {
                setSelectedParcel(null), setSelectedLand(null);
              }}
              className={`${
                selectedParcel == null
                  ? " brightness-50"
                  : " text-gray-800 dark:text-gray-50 hover:bg-black/10 cursor-pointer "
              } md:hidden flex flex-col justify-center items-center transition-all  p-2 rounded-lg text-sm font-semibold leading-6`}
            >
              <BackIcon />
              Back
            </a>
          )}
          {currentRoute == "myLand" && <BalanceContainer />}

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
            {currentRoute == "/" &&   <button
              onClick={toggleTheme}
              className="  bg-[#06291D] text-white bg-opacity-50  w-[2.5rem] h-[2.5rem]  backdrop-blur-[0.5rem]  rounded-xl flex items-center justify-center hover:scale-115 active:scale-105 transition-all hover:bg-opacity-70  "
            >
              {theme === "light" ? <BsSun /> : <BsMoon />}
            </button> }
          
            <ConnectWallet
              className=" !bg-[#06291D]  !bg-opacity-50 !p-3 "
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
