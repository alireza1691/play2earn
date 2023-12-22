import { useSelectedWindowContext } from "@/context/selected-window-context";
import { landsPInst, landsSInst } from "@/lib/instances";
import { SelectedLandType } from "@/lib/types";
import { landObjectFromTokenId, separatedCoordinate } from "@/lib/utils";
import { useSigner } from "@thirdweb-dev/react";

import React from "react";

type SlidebarButtonsProps = {
  selectedLand : SelectedLandType | null
}

export default function SlideBarButtons({selectedLand}:SlidebarButtonsProps) {
  let isEnemy = true;
  let signer = useSigner()

  async function mint() {
    console.log("minting a land...");
    
    try {
      if (signer && selectedLand) {
        const inst = landsSInst(signer)
        const landCoordinatesObject = landObjectFromTokenId(selectedLand.coordinate)
        await inst.mintLand(landCoordinatesObject.x,landCoordinatesObject.y)
      }
 
    } catch (error) {
      console.log(error);
      
    }
  }

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
        {selectedLand && selectedLand.isMinted  && isEnemy && (
          <button className="outlineGreenButton !w-full  md:!w-[50%]">
            Send help
          </button>
        )}
        {selectedLand && selectedLand.isMinted  && isEnemy && (
          <button
            onClick={() => {
              setSelectedWindowComponent("attack");
            }}
            className="redButton !w-full md:!w-[50%]"
          >
            Attack
          </button>
        )}
        {selectedLand && selectedLand.isMinted  && !isEnemy && (
          <button className="outlineGreenButton !w-full md:!w-[50%]">
            Send help
          </button>
        )}
        {selectedLand && selectedLand.isMinted  && !isEnemy && (
          <button className="greenButton !w-full md:!w-[50%]">
            Visit land
          </button>
        )}
      </div>
    </div>
  );
}
