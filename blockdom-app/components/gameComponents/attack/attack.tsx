"use client";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import CloseIcon from "@/svg/closeIcon";
import DoubleSword from "@/svg/doubleSword";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosArrowBack } from "react-icons/io";
import AttackTargetInfo from "./attackTargetInfo";
import WarriorsSliders from "./warriorsSliders";
import AttackerComp from "./attackerComp";
import LandCard from "../landCard";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { usePathname, useRouter } from "next/navigation";
import { townMainnetPInst, townPInst } from "@/lib/instances";
import { landDataResType } from "@/lib/types";
import { formattedNumber } from "@/lib/utils";
import { formatEther, parseEther } from "ethers/lib/utils";
import AttackSmScreen from "./attackSmScreen";

export default function Attack() {
  const { selectedLand } = useMapContext();
  const { chosenLand, inViewLand, isUserDataLoading } = useUserDataContext();
  const { dispatchArmy } = useBlockchainUtilsContext();
  const currentRoute = usePathname();
  const router = useRouter();
  const isTestnet = currentRoute.includes("/testnet/");

  const { selectedWindowComponent, setSelectedWindowComponent, selectedArmy } =
    useSelectedWindowContext();

  const [foodBal, setFoodBal] = useState<number | null>(null);
  const [estimatedTime,setEstimatedTime] = useState(0)

  const totalSelectedArmy = () => {
    let total = 0;
    for (let index = 0; index < selectedArmy.length; index++) {
      total += selectedArmy[index];
    }
    return total;
  };

  useEffect(() => {
    const getBal = async () => {
      setFoodBal(null);
     
      if (isTestnet && chosenLand && selectedLand) {
        const inst = isTestnet ? townPInst : townMainnetPInst;
        const res: landDataResType = await inst.getLandIdData(
          chosenLand.tokenId
        );
          console.log(Number(chosenLand.tokenId), selectedLand.coordinate);
          
        const estimatedTime = await inst.getDispatchTime(Number(chosenLand.tokenId),selectedLand.coordinate)
        console.log("estimated time:",Number(estimatedTime));
        
        console.log("food:", Number(formatEther(res.goodsBalance[0])));
        setEstimatedTime(Number(estimatedTime))
        setFoodBal(Number(formatEther(res.goodsBalance[0])));
      }
    };
    getBal();
  }, [isTestnet, chosenLand,selectedLand]);

  return (
    <>
      {/* {selectedWindowComponent == "attack" && ( */}
      <section
        className={` ${
          selectedWindowComponent == "attack" ? "top-[4.5rem] md:top-[8rem]" : " hidden"
        } w-[90%] h-[78dvh] absolute left-1/2 -translate-x-1/2 z-500 transition-all `}
      >
               {/* <AttackSmScreen/> */}
        <div className="flex flex-col  w-full h-full border-[#87F0E5]/30 bg-[#21302A]/60  backdrop-blur-md  rounded-xl border">

          <div className="w-full flex p-1 items-center flex-row bg-[#06291D80]/50 rounded-t-lg mb-3 border-b border-[#D4D4D459]/20">
            <a
              className=" mr-auto hidden md:flex  closeIcon text-[24px]"
              onClick={() => setSelectedWindowComponent("emptyLand")}
            >
              <IoIosArrowBack />
            </a>
            <a className=" !font-semibold md:hidden ml-2 blueText">From: {chosenLand?.tokenId}</a>
            <a
              onClick={() => setSelectedWindowComponent("emptyLand")}
              className="blueText !font-semibold md:hidden ml-auto mr-auto hover:cursor-pointer hover:brightness-150"
            >
              To: {selectedLand?.coordinate}
            </a>
            <a
              className=" ml-auto  closeIcon "
              onClick={() => setSelectedWindowComponent(null)}
            >
              <CloseIcon />
            </a>
          </div>

          <div className=" flex flex-row ml-auto mr-auto md:ml-0 md:mr-0 justify-center md:justify-around h-[80%]">
            <AttackerComp />
            <div className="md:flex flex-col justify-center hidden md:visible">
              <DoubleSword />
            </div>
            <div className=" md:flex flex-col items-center hidden  w-[35%] max-w-[22.5rem] ">
              <div className="  relative">
                {" "}
                <LandCard tokenId={selectedLand?.coordinate || 0} />
              </div>
              <AttackTargetInfo />
            </div>
          </div>
          <div className="p-1 md:p-3 justify-center absolute bottom-0 flex  flex-col left-1/2 -translate-x-1/2 w-full md:w-auto ">
            {" "}
            <div className=" w-full p-2 justify-between flex flex-col md:flex-row ">
              <p className="text-[12px] text-center"> Required food:    {totalSelectedArmy()}</p>
        <p className="text-[12px] text-center">Estimated time: {estimatedTime} mintes</p>
            </div>
            <button
              disabled={
                totalSelectedArmy() <= 0 ||
                isUserDataLoading ||
                Number(formatEther(inViewLand?.goodsBalance[0] || 0)) <=
                  totalSelectedArmy()
              }
              onClick={() => {
                dispatchArmy();
              }}
              className="redButton mt-auto !w-full md:!w-[30rem]"
            >
              {!isUserDataLoading ? (
                <>
                  {Number(formatEther(inViewLand?.goodsBalance[0] || 0)) <=
                  totalSelectedArmy()
                    ? "Insufficient food"
                    :<>{totalSelectedArmy() > 0  ?`Confirm attack`:"Select army"} </>}
                </>
              ) : (
                "Loading data.."
              )}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
