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

export default function Attack() {
  const { selectedLand } = useMapContext();
  const { chosenLand, inViewLand, isUserDataLoading } = useUserDataContext();
  const { dispatchArmy } = useBlockchainUtilsContext();
  const currentRoute = usePathname();
  const router = useRouter();
  const isTestnet = currentRoute.includes("/testnet/");

  const { selectedWindowComponent, setSelectedWindowComponent, selectedArmy } =
    useSelectedWindowContext();

  const [phoneDefenderSlide, setPhoneDefenderSlide] = useState(false);
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
          selectedWindowComponent == "attack" ? "top-[4.5rem]" : " top-[200rem]"
        } w-[90%] h-[80dvh] absolute left-1/2 -translate-x-1/2 z-50 transition-all `}
      >
        <div className=" flex flex-col  w-full h-full border-[#D4D4D4]/30 bg-[#21302A]/60  backdrop-blur-md  rounded-xl border">
          <div className="w-full flex flex-row">
            <a
              className=" mr-auto hidden md:flex  closeIcon m-2 text-[24px]"
              onClick={() => setSelectedWindowComponent("emptyLand")}
            >
              <IoIosArrowBack />
            </a>
            <a className=" md:hidden p-1 m-2">From: {chosenLand?.tokenId}</a>
            <a
              onClick={() => setSelectedWindowComponent("emptyLand")}
              className=" md:hidden p-1 m-2 ml-auto mr-auto hover:cursor-pointer hover:brightness-150"
            >
              To: 109108
            </a>
            <a
              className=" ml-auto  closeIcon m-2 "
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
              <div className=" max-w-[70%] relative">
                {" "}
                <LandCard tokenId={selectedLand?.coordinate || 0} />
              </div>
              <AttackTargetInfo />
            </div>
          </div>
          <div className="p-1 md:p-3 justify-center flex mt-auto flex-col ml-auto mr-auto w-full md:w-auto ">
            {" "}
            <div className=" w-full p-2 justify-between flex flex-col md:flex-row ">
              <p className=" text-center"> Required food:    {totalSelectedArmy()}</p>
        <p className=" text-center">Estimated time: {estimatedTime} mintes</p>
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
