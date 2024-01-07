"use client"
import React from "react";
import Image from "next/image";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { landItems } from "@/lib/data";
import TownBarracks from "./townBarracks";
import TownWalls from "./townWalls";
import TownTrainingCamp from "./townTrainingCamp";
import TownResourceBuildings from "./townResourceBuildings";
import TownHall from "./townHall";
import { useAddress, useConnect, useChainId,metamaskWallet } from "@thirdweb-dev/react";
import {Sepolia, Arbitrum} from "@thirdweb-dev/chains"
import { useUserDataContext } from "@/context/user-data-context";
import { useRouter } from "next/navigation";

export default function Town() {
const {ownedLands} = useUserDataContext() 
  const address = useAddress()
  const connect = useConnect()
  const router = useRouter()
  const chainId = useChainId();
  const validChainId = Sepolia.chainId;
  const metamaskConfig = metamaskWallet();

  const handleConnect = async () => {
    try {
      await connect(metamaskConfig, { chainId: validChainId });
      // Connection successful
    } catch (error) {
      console.log("Error connecting with MetaMask:", error);
      // Handle the error gracefully without showing it on the screen
    }
  };


  const townHall = landItems[0]
  // const walls = landItems[4]
  return (
    <section>
      {address ?(
        <>
        {ownedLands && ownedLands.length > 0? (
<>             <TownHall/>
      <TownBarracks/>
      <TownWalls/>
      <TownTrainingCamp/>
      <TownResourceBuildings/></>
        ):(
          <> <div className=" fixed z999 w-[90%] min-h-[12.5rem]  sm:w-[25.5rem] sm:min-h-[15rem]  left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 txStateBg flex flex-col">
          <h3 className="px-[10%]  mt-6 text-center !text-white font-semibold text-[18px]">
          You have not any land.</h3> <h3 className="px-[10%]  mt-4 text-center !text-white "> <br></br><br></br> <a onClick={()=>router.push("/testnet/explore")} className=" cursor-pointer blueText underline !font-bold !text-[18px] hover:brightness-110">Explore</a>  the map and mint your land.
          </h3> </div></>
        )}
 
</>
      ):(<> <div className=" fixed z999 w-[90%] min-h-[12.5rem]  sm:w-[25.5rem] sm:min-h-[15rem]  left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 txStateBg flex flex-col">
          <h3 className="px-[10%]  mt-6 text-center !text-white font-semibold text-[18px]">
          Wallet is not connected.</h3> <h3 className="px-[10%]  mt-4 text-center !text-white "> <br></br><br></br> Please <a onClick={()=>handleConnect()}   className="  cursor-pointer blueText underline !font-bold !text-[18px] hover:brightness-110">connect</a> your wallet.
          </h3> </div></>) }

    </section>
  );
}
