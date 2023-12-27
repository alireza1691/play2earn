import { useMapContext } from "@/context/map-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { landsAddress } from "@/lib/blockchainData";
import { landsABI, landsPInst, landsSInst } from "@/lib/instances";
import { SelectedLandType } from "@/lib/types";
import { landObjectFromTokenId, separatedCoordinate } from "@/lib/utils";
import { useChainId, useMetamask, useSigner, useNetworkMismatch, useSwitchChain } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { Sepolia } from "@thirdweb-dev/chains";
import React, { useEffect, useState } from "react";
import { useBlockchainStateContext } from "@/context/blockchain-state-context";

export default function SlideBarButtons() {
  const { selectedLand } = useMapContext();
  const { isOwnedLand } = useUserDataContext();
  let signer = useSigner();
  const [priceFormatEther, setPriceFromatEther] = useState<BigNumber | null>(
    null
  );

  const {setTransactionState,setErrorMsg} = useBlockchainStateContext()
  const connectWithMetamask = useMetamask();
  const chainId = useChainId();
  const validChainId = Sepolia.chainId;
  const switchChain = useSwitchChain()


  const handleConnectWithMetamask = async () => {
    try {
      await connectWithMetamask({
        chainId: validChainId,
      });
      // Connection successful
    } catch (error) {
      console.log("Error connecting with MetaMask:", error);
      // Handle the error gracefully without showing it on the screen
    }
  };

  const mintLand = async () => {

    if (!signer) {
      try {
        setTransactionState("waitingWalletConnection")
        await handleConnectWithMetamask();
      } catch (error) {
        console.log(error);
        setTransactionState("connectionRejected")
      } 
    } 
    if (chainId && chainId != validChainId ) {
      try {
        setTransactionState("waitingWalletConnection")
        await switchChain(validChainId)
      } catch (error) {
        setTransactionState("connectionRejected")
        console.log(error);
      } 
    }
        if (chainId && chainId == validChainId && selectedLand && signer) {
          setTransactionState("waitingUserApproval")
          try {
            const landsInst = landsSInst(signer);
            const landCoordinatesObject = landObjectFromTokenId(
              selectedLand.coordinate
            );
            console.log("minting...");
            
            await landsInst.mintLand(
              landCoordinatesObject.x,
              landCoordinatesObject.y,
              {
                value: priceFormatEther,
              }
            );
    
          setTransactionState("waitingBlockchainConfirmation")
              
            // setVisibleConfirmation(true);
          } catch (error) {
            setTransactionState("txRejected")
            
      
              setErrorMsg("tx rej")
  
        

          }

          setTransactionState("waitingBlockchainConfirmation")
        }
   
  

 
  };

  // async function mint() {
  //   console.log("minting a land...");

  //   try {
  //     if (signer && selectedLand && priceFormatEther) {
  //       const inst = landsSInst(signer);
  //       const landCoordinatesObject = landObjectFromTokenId(
  //         selectedLand.coordinate
  //       );
  //       console.log(
  //         "minted land coordinates: x:",
  //         landCoordinatesObject.x,
  //         "y:",
  //         landCoordinatesObject.y
  //       );
  //       await inst.mintLand(landCoordinatesObject.x, landCoordinatesObject.y, {
  //         value: priceFormatEther,
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  useEffect(() => {
    const getData = async () => {
      if (signer) {
        const inst = landsPInst;

        const price = await inst.getPrice();
        setPriceFromatEther(price);
      }
    };
    getData();
  }, [signer]);

  const { selectedWindowComponent, setSelectedWindowComponent } =
    useSelectedWindowContext();

  return (
    <div className="w-full mt-auto flex flex-col py-3">
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
        {selectedLand && !selectedLand.isMinted && (
          <button
            onClick={() => mintLand()}
            className="greenButton !w-full mt-2"
          >
            Mint
          </button>
        )}
        {selectedLand && selectedLand.isMinted && !isOwnedLand && (
          <button className="outlineGreenButton !w-full  md:!w-[50%]">
            Send help
          </button>
        )}
        {selectedLand && selectedLand.isMinted && !isOwnedLand && (
          <button
            onClick={() => {
              setSelectedWindowComponent("attack");
            }}
            className="redButton !w-full md:!w-[50%]"
          >
            Attack
          </button>
        )}
        {selectedLand && selectedLand.isMinted && isOwnedLand && (
          <button className="outlineGreenButton !w-full md:!w-[50%]" disabled>
            Send help
          </button>
        )}
        {selectedLand && selectedLand.isMinted && isOwnedLand && (
          <button className="greenButton !w-full md:!w-[50%]">
            Visit land
          </button>
        )}
      </div>
    </div>
  );
}
