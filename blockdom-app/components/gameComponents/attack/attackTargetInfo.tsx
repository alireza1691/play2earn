"use client"
import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { warriorsInfo } from "@/lib/data";
import { townPInst } from "@/lib/instances";
import { MintedLand } from "@/lib/types";
import { getOwnerFromEvents, shortenAddress, zeroAddress } from "@/lib/utils";
import CoinIcon from "@/svg/coinIcon";
import CopyIcon from "@/svg/copyIcon";
import FoodIcon from "@/svg/foodIcon";
import WalletIcon from "@/svg/walletIcon";
import { BigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type EnemyInfoType = {
 gold: string,
 food: string,
 army: BigNumberish[]
}

export default function AttackTargetInfo() {

   const {selectedLand} = useMapContext()
   const { mintedLands} = useApiData();
   const [info,setInfo] = useState< EnemyInfoType | null >()



   useEffect(() => {
    const getInfo =async () =>{
      if (selectedLand && selectedLand.isMinted) {
        
        try {
           const landData = await townPInst.getLandIdData(selectedLand.coordinate)
           const goods = landData.goodsBalance
          const army = await townPInst.getArmy(selectedLand.coordinate)
          
          const infoObj = {gold: formatEther(goods[1]) ,food:  formatEther(goods[0]) ,army: army  }
          setInfo(infoObj)
        } catch (error) {
          console.log(error);
          
        }
      }
    }
    getInfo()
   },[selectedLand])
  return (
    <div className=" flex flex-col w-full mt-5 ">
      {/* <div className=" h-[4.5rem] w-full bronzeBg rounded-xl  flex flex-col darkShadow">
        <h3 className="ml-8  font-bold text-[24px]">Target</h3>
        <p className="ml-8 w-full flex flex-row gap-3 text-[#98FBD7]">
          <WalletIcon /> {shortenAddress(selectedLand?.owner || zeroAddress) }
          <CopyIcon />
        </p>
      </div> */}
      <div className="bg-[#06291D80]/50  w-full rounded-lg border border-[#98FBD7]/70">
        <div className=" flex flex-row items-center gap-3 p-3"><WalletIcon/><p className=" blueText !text-[14px] !font-normal">Owner: {selectedLand && mintedLands && shortenAddress(getOwnerFromEvents(selectedLand.coordinate, mintedLands))}</p></div>

      </div>
      <div className=" flex flex-row gap-4 mt-4">
        <div className="goodsBalanceKeeper balBg w-1/2 darkShadow flex flex-row items-center ga-4"><CoinIcon/> <h3>{info && info.gold || 0 }</h3></div>
        <div className="goodsBalanceKeeper balBg w-1/2 darkShadow flex flex-row items-center ga-4"><FoodIcon/> <h3>{info && info.food || 0 }</h3></div>
      </div>
      {/* <div className=" border-2 border-black/10 h-fit w-full overflow-hidden overflow-x-scroll custom-scrollbar mt-4  bg-black/10 p-2 rounded-lg ">
      <div className=" flex flex-row justify-evenly  gap-4   w-fit darkShadow">
        {warriorsInfo.map((warrior, key) => (
          <div key={key} className="cardBg ml-auto mr-auto darkShadow w-max">
            <Image
              src={warrior.image}
              alt="warriorCard"
              width={40}
              height={64}
               className ={"!w-auto !h-[60px]"}
            />
            <h4 className="mt-1 text-center text-[10px]">{info && Number(info.army[key]) || 0}</h4>
          </div>
          
        ))}
      </div>
      </div> */}
    </div>
  );
}
