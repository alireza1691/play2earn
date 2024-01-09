import { useMapContext } from "@/context/map-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import {  landsMainnetPInst, landsPInst, landsSInst } from "@/lib/instances";
import {

  useSigner,
} from "@thirdweb-dev/react";
import { BigNumberish, Transaction } from "ethers";
import { Sepolia } from "@thirdweb-dev/chains";
import React, { useEffect, useState } from "react";
import { useBlockchainStateContext } from "@/context/blockchain-state-context";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { usePathname } from "next/navigation";


export default function SlideBarButtons() {
  const { selectedLand,setSelectedLand } = useMapContext();
  const { ownedLands } = useUserDataContext();
  const {  mint } = useBlockchainUtilsContext()

  const [priceFormatEther, setPriceFromatEther] = useState<BigNumberish | null>(
    null
  );

  const pathname = usePathname()
  const isTestnet = pathname.includes("/testnet/")
  const {  setSelectedWindowComponent } =
    useSelectedWindowContext();

  const isOwned = () =>{
    if (ownedLands && selectedLand) {
      if (
        ownedLands.some(
          (item) => item.tokenId == selectedLand.coordinate.toString()
        )
      ) {
        return true
      } else {
        return false
      }
    }

  }


  useEffect(() => {
    const getData = async () => {
      if (selectedLand?.isMinted == false) {

        const inst = isTestnet ? landsPInst : landsMainnetPInst;

        const price = await inst.getPrice();
        setPriceFromatEther(price);
        
      }
    };
    getData();
    
    
  }, [selectedLand]);


  return (
    <div className="w-full mt-auto flex flex-col py-3 flex-shrink">
      {" "}
      <div className="w-full ">
        {" "}
        {selectedLand && !selectedLand.isMinted && (
          <h3 className="py-2 px-5 bg-[#06291D]/50 rounded-xl text-[#98FBD7] !w-full text-center">
            Price:{" "}
            {formatEther(
              priceFormatEther ? priceFormatEther : parseEther("0.002")
            )}{" "}
            ETH
          </h3>
        )}
      </div>
      <div className=" flex flex-col md:flex-row  w-full gap-2">
        <>
        {selectedLand && !selectedLand.isMinted && priceFormatEther && (
          <button
            onClick={() => mint(selectedLand,priceFormatEther)}
            className="greenButton !w-full mt-2"
          >
            Mint
          </button>
        )}
        {selectedLand && !selectedLand.isMinted && !priceFormatEther && (
          <button
          disabled
            className="greenButton !w-full mt-2"
          >
            Mint
          </button>
        )}
        {selectedLand && selectedLand.isMinted && !isOwned() && (
           <>
           {ownedLands && ownedLands?.length > 0 ? (
          <button className="outlineGreenButton !w-full md:!w-[50%]"disabled >
            Send help
          </button>
           ):(<button className="outlineGreenButton !w-full md:!w-[50%]" disabled>
           Send help
         </button>)}
          </>
        )}
        {selectedLand && selectedLand.isMinted && !isOwned() && (
          <>
          {ownedLands && ownedLands?.length > 0 ? (
        <button
        onClick={() => {
          setSelectedWindowComponent("attack");
        }}
        className="redButton z-30 !w-full md:!w-[50%]"
      >
        Attack
      </button>
          ):(
            <button
           disabled
            className=" redButton !w-full md:!w-[50%]"
          >
            Attack
          </button>
          )}
  
          </>
        )}
        {selectedLand && selectedLand.isMinted && isOwned() && (
          <>
           {ownedLands && ownedLands?.length > 0 ? (
          <button className="outlineGreenButton !w-full md:!w-[50%]" disabled>
            Send help
          </button>
           ):(<button className="outlineGreenButton !w-full md:!w-[50%]" disabled>
           Send help
         </button>)}
          </>
        )}
        {selectedLand && selectedLand.isMinted && isOwned() && (
          <button className="greenButton !w-full md:!w-[50%]">
            Visit land
          </button>
        )}
        </>
      </div>
    </div>
  );
}
