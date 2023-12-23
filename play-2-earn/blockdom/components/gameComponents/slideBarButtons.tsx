import { useSelectedWindowContext } from "@/context/selected-window-context";
import { landsAddress } from "@/lib/blockchainData";
import { landsABI, landsPInst, landsSInst } from "@/lib/instances";
import { SelectedLandType } from "@/lib/types";
import { landObjectFromTokenId, separatedCoordinate } from "@/lib/utils";
import { useSigner } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";

import React, { useEffect, useState } from "react";

type SlidebarButtonsProps = {
  selectedLand : SelectedLandType | null
  isOwnedLand : boolean
}

export default function SlideBarButtons({selectedLand,isOwnedLand}:SlidebarButtonsProps) {
  let signer = useSigner()
  const [priceFormatEther, setPriceFromatEther] = useState<number | null>(null)

  async function mint() {
    console.log("minting a land...");
    
    try {
      if (signer && selectedLand && priceFormatEther) {
        const inst = landsSInst(signer)
        const landCoordinatesObject = landObjectFromTokenId(selectedLand.coordinate)
        console.log("minted land coordinates: x:",landCoordinatesObject.x,"y:",landCoordinatesObject.y);
        await inst.mintLand(landCoordinatesObject.x,landCoordinatesObject.y,{value: priceFormatEther})
      }
 
    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(() => {
    
  
    const getData = async () => {
      if (signer) {
        const inst = landsSInst(signer)
        const price = await inst.getPrice()
        setPriceFromatEther(price)
      }
    
    }
    getData()
  }, [signer])
  

  const { selectedWindowComponent, setSelectedWindowComponent } =
    useSelectedWindowContext();

  return (
    <div className="w-full mt-auto flex flex-col py-3">
      {" "}
   
      <div className="w-full ">
        {" "}
        {selectedLand && !selectedLand.isMinted && (
          <h3 className="py-2 px-5 bg-[#06291D]/50 rounded-xl text-[#98FBD7] !w-full text-center">Price: 0.02 ETH</h3>
        )}
      </div>
      <div className=" flex flex-col md:flex-row  w-full gap-2">
        {selectedLand && !selectedLand.isMinted  && <button onClick={() => mint()} className="greenButton !w-full mt-2">Mint</button>}
        {selectedLand && selectedLand.isMinted  && !isOwnedLand && (
          <button className="outlineGreenButton !w-full  md:!w-[50%]">
            Send help
          </button>
        )}
        {selectedLand && selectedLand.isMinted  && !isOwnedLand && (
          <button
            onClick={() => {
              setSelectedWindowComponent("attack");
            }}
            className="redButton !w-full md:!w-[50%]"
          >
            Attack
          </button>
        )}
        {selectedLand && selectedLand.isMinted  && isOwnedLand && (
          <button className="outlineGreenButton !w-full md:!w-[50%]">
            Send help
          </button>
        )}
        {selectedLand && selectedLand.isMinted  && isOwnedLand && (
          <button className="greenButton !w-full md:!w-[50%]">
            Visit land
          </button>
        )}
      </div>
    </div>
  );
}
