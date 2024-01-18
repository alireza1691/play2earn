"use client";

import { landsMainnetSInst, landsSInst, townMainnetSInst, townSInst } from "@/lib/instances";
import { InViewLandType, SelectedLandType } from "@/lib/types";
import {
  metamaskWallet,
  Transaction,
  TransactionResult,
  useChainId,
  useConnect,
  useSigner,
  useSwitchChain,
} from "@thirdweb-dev/react";
import { createContext, useContext, useEffect, useState } from "react";
import { useBlockchainStateContext } from "./blockchain-state-context";
import { Sepolia, Polygon } from "@thirdweb-dev/chains";
import { landObjectFromTokenId } from "@/lib/utils";
import { BigNumber, BigNumberish, ContractTransaction, ethers, utils } from "ethers";
import { useSelectedBuildingContext } from "./selected-building-context";
import { useUserDataContext } from "./user-data-context";
import { usePathname } from "next/navigation";
import { useSelectedWindowContext } from "./selected-window-context";
import { useMapContext } from "./map-context";
import { useApiData } from "./api-data-context";
import { TransactionTypes } from "ethers/lib/utils";

type BlockchainUtilsProviderProps = {
  children: React.ReactNode;
};

type BlockchainUtilsContextType = {
  buildBuilding: () => Promise<void>;
  claim: () => Promise<void>;
  mint: (
    selectedLand: SelectedLandType,
    priceFormatEther: BigNumberish | null
  ) => Promise<void>;
  mintResourceBuilding: () => Promise<void>;
  recruitArmy:( amounts:number[]) => Promise<void>;
  dispatchArmy:  () => Promise<void>;
  dispatchedArmyAction : (dispatchedArmyIndex: number,isReturning:boolean) => Promise<void>;
};

const BlockchainUtilsContext = createContext<BlockchainUtilsContextType | null>(
  null
);

export default function BlockchainUtilsContextProvider({
  children
}: BlockchainUtilsProviderProps) {
  const { setTransactionState, setTxError } = useBlockchainStateContext();
  const {
    selectedItem,
    selectedResourceBuilding, setSelectedResourceBuilding
  } = useSelectedBuildingContext();
  const { inViewLand, chosenLand,setInViewLand} = useUserDataContext();
  const {selectedArmy} = useSelectedWindowContext()
  const {selectedLand,setSelectedLand} = useMapContext()
  const pathname = usePathname()
  const isTestnet = pathname.includes("/testnet/")
  
  const signer = useSigner();
  const connectWithMetamask = useConnect();
  const chainId = useChainId();
  const testnetChainId = Sepolia.chainId;
  const mainnetChainId = Polygon.chainId
  const switchChain = useSwitchChain();
  const metamaskConfig = metamaskWallet();


  const handleConnectWithMetamask = async () => {
    try {
      await connectWithMetamask(metamaskConfig, { chainId: isTestnet ? testnetChainId : mainnetChainId });
      // Connection successful
    } catch (error) {
      console.log("Error connecting with MetaMask:", error);
      // Handle the error gracefully without showing it on the screen
    }
  };

  const validateWallet = async () => {
    if (!signer) {
      try {
        setTransactionState("waitingWalletConnection");
        await handleConnectWithMetamask();
        setTransactionState("connected")
      } catch (error) {
        console.log(error);
        setTransactionState("connectionRejected");
      }
    }
  };

  const validateChain = async () => {
    if (chainId && chainId != testnetChainId) {
      try {
        setTransactionState("waitingWalletConnection");
        await switchChain(isTestnet ? testnetChainId : mainnetChainId);
        setTransactionState("connected")
      } catch (error) {
        setTransactionState("connectionRejected");
        console.log(error);
      }
    }
  };

  const handleError = (error: unknown) =>{
    console.log("Reverted :", error);

    setTransactionState("txRejected");
    if (error instanceof Error) {
      setTxError(error);
    } else {
      // Handle other types of errors
      const customError = new Error("An unknown error occurred");
      setTxError(customError);
    }
  }

  const handleResult = async (tx:ContractTransaction) => {
    let success = false
    setTransactionState("waitingBlockchainConfirmation");
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log(receipt.status === 1);
      setTransactionState("confirmed");
      success = true
    }
    return success
  }

  const approve = async () =>{
    validateWallet()
    validateChain()
    try {
      if (signer) {
        
      } else {
        setTransactionState(null);
      } 
    } catch (error) {
      handleError(error)
    }
  }

  const deposit = async (amount: number) =>{
    validateWallet()
    validateChain()
    try {
      if (signer) {
      const instance = isTestnet ? townSInst(signer) : townMainnetSInst(signer)
      setTransactionState("waitingUserApproval");
      const tx: ContractTransaction = await instance.deposit(amount)
      await handleResult(tx)
      } else {
        setTransactionState(null);
      } 
    } catch (error) {
      handleError(error)
    }
  }
  const withdraw = async () =>{
    validateWallet()
    validateChain()
    try {
      if (signer) {
        
      } else {
        setTransactionState(null);
      } 
    } catch (error) {
      handleError(error)
    }
  }

  // async function joinArmy(dispatchedArmyIndex: number) {
  //   validateWallet()
  //   validateChain()
    
  //   try {
  //     if (signer && chosenLand) {
  //       const instance = isTestnet ? townSInst(signer) : townMainnetSInst(signer)
  //       setTransactionState("waitingUserApproval");
  //       const tx = await instance.joinDispatchedArmy(Number(chosenLand.tokenId),dispatchedArmyIndex)
  //       setTransactionState("waitingBlockchainConfirmation");
  //       const receipt = await tx.wait();
  //       if (receipt.status === 1) {
  //         console.log(receipt.status === 1);
  
  //         setTransactionState("confirmed");
  //       }
  //     } else {
  //       setTransactionState(null);
  //     }
  //   } catch (error) {
  //     console.log("Reverted :", error);
  
  //     setTransactionState("txRejected");
  //     if (error instanceof Error) {
  //       setTxError(error);
  //     } else {
  //       // Handle other types of errors
  //       const customError = new Error("An unknown error occurred");
  //       setTxError(customError);
  //     }
  //   }
  // }

  async function dispatchedArmyAction(dispatchedArmyIndex: number,isReturning:boolean) {
    validateWallet()
    validateChain()
    
    try {
      if (signer && chosenLand) {
        const instance = isTestnet ? townSInst(signer) : townMainnetSInst(signer)
        setTransactionState("waitingUserApproval");
        // const tx = await instance.war(Number(chosenLand.tokenId),dispatchedArmyIndex)

        const tx:ContractTransaction = isReturning ? await instance.joinDispatchedArmy(Number(chosenLand.tokenId),dispatchedArmyIndex) : await instance.war(Number(chosenLand.tokenId),dispatchedArmyIndex)
        await handleResult(tx)
      } else {
        setTransactionState(null);
      }
    } catch (error) {
      handleError(error)
    }
  }

 async function dispatchArmy() {
  validateWallet()
  validateChain()
  try {
    if (signer && chosenLand && selectedArmy && selectedLand) {
      const instance = isTestnet ? townSInst(signer) : townMainnetSInst(signer)
      setTransactionState("waitingUserApproval");
      const tx:ContractTransaction  = await instance.dispatchArmy(selectedArmy,Number(chosenLand.tokenId),selectedLand.coordinate)
      await handleResult(tx)
    } else {
      setTransactionState(null);
    }
  } catch (error) {
    handleError(error)
  }
 }
  // async function recruitArmy(index: number, amount:number) {
  //   validateWallet()
  //   validateChain()
  //   try {
  //     if (signer && inViewLand) {
  //       setTransactionState("waitingUserApproval");
  //       const tx:ContractTransaction = await (isTestnet ? townSInst(signer) : townMainnetSInst(signer)).recruit(inViewLand.tokenId,index,amount)
  //       await handleResult(tx)
  //     } else {
  //       setTransactionState(null);
  //     }
  //   } catch (error) {
  //     handleError(error)
  //   }
  // }

  async function recruitArmy( amounts:number[]) {
    validateWallet()
    validateChain()
    try {
      if (signer && inViewLand) {
        setTransactionState("waitingUserApproval");
        const inst = isTestnet ? townSInst(signer) : townMainnetSInst(signer)
        const tx:ContractTransaction = await inst.recruit(inViewLand.tokenId,amounts)
        await handleResult(tx)
      } else {
        setTransactionState(null);
      }
    } catch (error) {
      handleError(error)
    }
  }

  async function mintResourceBuilding() {
    validateWallet();
    validateChain();
    try {
      if (signer && inViewLand && selectedResourceBuilding) {
        console.log(inViewLand.tokenId);
        let tx: ContractTransaction;
        if (selectedResourceBuilding.level == 0) {
          setTransactionState("waitingUserApproval");
          tx = await (isTestnet ? townSInst(signer) : townMainnetSInst(signer)).buildResourceBuilding(
            inViewLand.tokenId,
            selectedResourceBuilding.type == "Farm" ? 0 : 1
          );
        } else {
          setTransactionState("waitingUserApproval");
          tx = await (isTestnet ? townSInst(signer) : townMainnetSInst(signer)).upgradeResourceBuilding(
            selectedResourceBuilding.tokenId,
            inViewLand.tokenId
          );
        }
        const success = await handleResult(tx)
        if (success) {
          const updatedObj = {...selectedResourceBuilding,level : selectedResourceBuilding.level ++}
          setSelectedResourceBuilding(updatedObj)
        }
      } else {
        setTransactionState(null);
      }
    } catch (error) {
      handleError(error)
    }
  }
  const mint = async (
    selectedLand: SelectedLandType,
    priceFormatEther: BigNumberish | null
  ) => {
    validateWallet();
    validateChain();


    if (signer  && selectedLand) {
      try {
        const landsInst = isTestnet ? landsSInst(signer) : landsMainnetSInst(signer);
        
        const landCoordinatesObject = landObjectFromTokenId(
          selectedLand.coordinate
        );
        console.log("minting...");
        setTransactionState("waitingUserApproval");
        const tx:ContractTransaction = await landsInst.mintLand(
          landCoordinatesObject.x,
          landCoordinatesObject.y,
          {
            value: priceFormatEther,
          }
        );
          const success = await handleResult(tx)
          if (success) {
            setSelectedLand({coordinate: selectedLand.coordinate, isMinted: true, owner: await signer.getAddress()})

          }
      } catch (error) {
        handleError(error)
      }
    } else {
      setTransactionState(null);
    }
  };
  const claim = async () => {
    validateWallet();
    validateChain();

    if (
      signer &&
      chainId &&
      chainId == testnetChainId &&
      selectedResourceBuilding
    ) {
      try {
        const townInst = (isTestnet ? townSInst(signer) : townMainnetSInst(signer));
        setTransactionState("waitingUserApproval");
        const tx = await townInst.claimRevenue(
          selectedResourceBuilding.tokenId
        );
        await handleResult(tx)
      } catch (error) {
        handleError(error)
      }
    } else {
      setTransactionState(null);
    }
  };

  const buildBuilding = async () => {
    validateWallet();
    validateChain();

    if (
      signer &&
      chainId &&
      chainId == testnetChainId &&
      selectedItem &&
      inViewLand
    ) {
      try {
        const townInst = (isTestnet ? townSInst(signer) : townMainnetSInst(signer));
        setTransactionState("waitingUserApproval");
        let tx:ContractTransaction | undefined;
        let updatedObj :InViewLandType = inViewLand
        if (selectedItem.name == "Barracks") {
          console.log("upgrading barracks");
          tx = await townInst.buildBarracks(inViewLand.tokenId);
          updatedObj = {...inViewLand,barracksLvl: ethers.BigNumber.from(inViewLand.barracksLvl).add(1) }
        }
        if (selectedItem.name == "Townhall") {
          console.log("upgrading townhall");
          tx = await townInst.buildTownhall(inViewLand.tokenId);
          updatedObj = {...inViewLand,townhallLvl: ethers.BigNumber.from(inViewLand.townhallLvl).add(1) }

        }
        if (selectedItem.name == "TrainingCamp") {
          console.log("upgrading training camp");
          tx = await townInst.buildTrainingCamp(inViewLand.tokenId);
          updatedObj = {...inViewLand,trainingCampLvl: ethers.BigNumber.from(inViewLand.trainingCampLvl).add(1) }

        }
        if (selectedItem.name == "Wall") {
          console.log("upgrading walls");
          tx = await townInst.buildWalls(inViewLand.tokenId);
          updatedObj = {...inViewLand,wallLvl: ethers.BigNumber.from(inViewLand.wallLvl).add(1) }

        }
        if (tx) {
          await handleResult(tx)
          setInViewLand(updatedObj)
        }
      } catch (error) {
        handleError(error)
      }
    } else {
      setTransactionState(null);
    }
  };


  return (
    <BlockchainUtilsContext.Provider value={{ buildBuilding, mint, claim,mintResourceBuilding, recruitArmy ,dispatchArmy,dispatchedArmyAction}}>
      {children}
    </BlockchainUtilsContext.Provider>
  );
}

export function useBlockchainUtilsContext() {
  const context = useContext(BlockchainUtilsContext);
  if (context === null) {
    throw new Error(
      "useBlockchainUtilsContext must be used within an useSelectedWindowContext"
    );
  }
  return context;
}
