import BalanceContainer from "@/components/gameComponents/townComponents/balanceContainer";
import Notifications from "@/components/gameComponents/notifications";
import SelectedBuilding from "@/components/gameComponents/buildingPopUpWindow/selectedBuilding";
import Town from "@/components/gameComponents/townComponents/town";
import Image from "next/image";
import React from "react";
import ToggleLand from "@/components/gameComponents/townComponents/toggleLand";
import BottomBar from "@/components/gameComponents/townComponents/bottomBar";

export default function MyLand() {
  return (
    <>
    <BalanceContainer/>
    <ToggleLand/>
    <Notifications/>
      <div className=" w-screen h-screen overflow-hidden relative">
        <div className=" w-[100vw] h-[100vh]   overflow-scroll custom-scrollbar  items-center justify-center  relative ">
          <div className=" bg-green-200/40  2xl:h-[80rem] absolute w-[1920px] h-[110rem]   xl:h-[130rem] xl:w-[2560px]  ">
            {/* <Image
              className=" absolute h-full w-full  object-cover "
              src={"/testBg.png"}
              width={1024}
              height={720}
              alt="bg"
              quality={30}
            /> */}

            <Town />
          </div>
        </div>
      </div>

      <SelectedBuilding />

     {/* <BottomBar/> */}
      <div className=" hidden sm:flex w-full h-[3rem] fixed bottom-0 bg-gradient-to-t from-black via-black"></div>
    </>
  );
}
