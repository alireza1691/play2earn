import { useTheme } from "@/context/theme-context";
import BattleLogIcon from "@/svg/battleLogIcon";
import ExploreIcon from "@/svg/exploreIcon";
import MyLandIcon from "@/svg/myLandIcon";
import { ConnectWallet } from "@thirdweb-dev/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { BsMoon, BsSun } from "react-icons/bs";
import { IoMdDownload } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import ChainIdButton from "./chainIdButton";

type navDropdownProps = {
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NavDropdownMobileScreen({
  setMobileMenuOpen,
}: navDropdownProps) {
  const router = useRouter();
  const currentRoute = usePathname();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="pwNavPanel z-10 fixed  left-0 pb-11 pt-9 w-full  mt-[4rem] h-fit overflow-y-auto px-6 shadow-lg ">
      <button
        type="button"
        className=" bg-white/10  absolute -m-2.5 active:bg-black/10 rounded-md p-1 right-5 bottom-5"
        onClick={() => setMobileMenuOpen(false)}
      >
        <span className="sr-only">Close menu</span>
        <IoClose
          className="h-6 w-6 text-[#F4F4F1]  "
          aria-hidden="true"
        />
      </button>
      <div className="mt-10 flow-root">
        <div className="-my-6 divide-y divide-gray-500/10">
          <div className="space-y-2 py-6 flex flex-col">
          <ChainIdButton/>
            <div className=" flex flex-row items-center justify-between w-full mb-4">
           
          
              <ConnectWallet
                className={` !bg-[#0D0F12]/60 mb-3 !rounded-r-none !p-3 !w-[100%] `}
                modalSize="wide"
                theme="dark"
                welcomeScreen={{
                  title: "Plotwar",
                  subtitle: "Decentralized P2E game",
                  img: {
                    src: "/plotwarMark.svg",
                    width: 120,
                    height: 120,
                  },
                }}
              />
             
              {/* {currentRoute == "/" &&       <button
                onClick={toggleTheme}
                className="   bg-[#06291D] text-white bg-opacity-50  !w-[2.6rem] !h-[2.6rem]  backdrop-blur-[0.5rem]  rounded-xl flex items-center justify-center hover:scale-115 active:scale-105 transition-all hover:bg-opacity-70  "
              >
                {theme === "light" ? <BsSun /> : <BsMoon />}
              </button>} */}
            
            </div>
            {/*
              The landing's links used to live here too, behind a
              `currentRoute == "/"` check. The landing renders its own header
              and its own mobile sheet now, so this one is game routes only.
            */}
          </div>
        </div>
      </div>
    </div>
  );
}
