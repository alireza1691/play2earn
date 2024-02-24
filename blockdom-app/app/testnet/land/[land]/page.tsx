import BalanceContainer from "@/components/gameComponents/balanceContainer";
import Notifications from "@/components/gameComponents/notifications";
import SelectedBuilding from "@/components/gameComponents/buildingPopUpWindow/selectedBuilding";
import Town from "@/components/gameComponents/townComponents/town";
import Image from "next/image";
import React from "react";
import ToggleLand from "@/components/gameComponents/townComponents/toggleLand";
import BottomBar from "@/components/gameComponents/bottomBar";
import WorkerComp from "@/components/gameComponents/townComponents/workerComp";

export default function MyLand() {
  return (
    <>
      <ToggleLand />
      <Notifications />
      <WorkerComp/>
      <div className=" w-screen h-screen overflow-hidden relative">
        <div className=" w-[100dvw] h-[100dvh]   overflow-scroll custom-scrollbar  items-center justify-center  relative ">
          <div className=" 2xl:h-[138rem] absolute w-[1920px]    h-[138rem] xl:w-[2560px]  ">
            {/* <Image
              className=" absolute h-full w-full object-fill blur-[0.15rem] "
              src={"/bg.png"}
              width={1024}
              height={720}
              alt="bg"
              quality={30}
            /> */}
            <Image
              className="  opacity-80 absolute left-1/2 -translate-x-1/2  w-[1920px] h-[138rem]   xl:h-[138rem] xl:w-[2560px]  object-fit "
              src={"/townItems/Land.png"}
              width={2237}
              height={1640}
              alt="bg"
              quality={30}
            />

            <Town />
          </div>
        </div>
      </div>

      <SelectedBuilding />

      {/* <BottomBar/> */}
      <div className="z-30 hidden sm:flex w-full h-[3rem] fixed bottom-0 bg-gradient-to-t from-black via-black/60"></div>
    </>
  );
}