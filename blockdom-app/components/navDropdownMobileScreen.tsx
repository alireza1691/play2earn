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
    <div className=" fixed inset-y-0 left-0 z-10 w-full  py-14 rounded-xl h-fit overflow-y-auto bg-gradient-to-r from-[#A9FFDE] to-[#7ECFB3] dark:from-[#34594B] dark:to-[#213830] bg-transparent px-6 shadow-lg ">
      <button
        type="button"
        className=" bg-black/10 dark:bg-white/10  absolute -m-2.5 active:bg-white/20 dark:active:bg-black/10 rounded-md p-1 text-gray-700 right-5 bottom-5"
        onClick={() => setMobileMenuOpen(false)}
      >
        <span className="sr-only">Close menu</span>
        <IoClose
          className="h-6 w-6 text-gray-800 dark:text-gray-300  "
          aria-hidden="true"
        />
      </button>
      <div className="mt-10 flow-root">
        <div className="-my-6 divide-y divide-gray-500/10">
          <div className="space-y-2 py-6">
            <div className=" flex flex-row items-center justify-between w-full mb-4">
              <ConnectWallet
                className=" !bg-[#06291D] !bg-opacity-50  !p-3  md:!hidden !w-[80%] "
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
              <button
                onClick={toggleTheme}
                className="   bg-[#06291D] text-white bg-opacity-50  !w-[2.6rem] !h-[2.6rem]  backdrop-blur-[0.5rem]  rounded-xl flex items-center justify-center hover:scale-115 active:scale-105 transition-all hover:bg-opacity-70  "
              >
                {theme === "light" ? <BsSun /> : <BsMoon />}
              </button>
            </div>
            {currentRoute == "/" && (
              <>
                <a
                  href="/explore"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-700/10  dark:text-gray-100/90 dark:hover:bg-white/10"
                >
                  Explore
                </a>
                <a
                  href=""
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7  hover:bg-gray-700/10 dark:text-gray-100/90 dark:hover:bg-white/10"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="-mx-3  flex flex-row items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold leading-7  hover:bg-gray-700/10  dark:text-gray-100/90 dark:hover:bg-white/10"
                >
                  Whitepaper
                  <IoMdDownload className=" text-xl group-hover:translate-y-1 transition-all" />
                </a>
              </>
           
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
