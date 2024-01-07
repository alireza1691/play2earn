"use client";

import { landsSInst, townSInst } from "@/lib/instances";
import { SelectedLandType } from "@/lib/types";
import {
  metamaskWallet,
  useChainId,
  useConnect,
  useSigner,
  useSwitchChain,
} from "@thirdweb-dev/react";
import { createContext, useContext, useEffect, useState } from "react";
import { useBlockchainStateContext } from "./blockchain-state-context";
import { Sepolia } from "@thirdweb-dev/chains";
import { landObjectFromTokenId } from "@/lib/utils";
import { BigNumberish } from "ethers";
import { useSelectedBuildingContext } from "./selected-building-context";
import { useUserDataContext } from "./user-data-context";

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
  recruitArmy:(index: number, amount:number) => Promise<void>;
};

const BlockchainUtilsContext = createContext<BlockchainUtilsContextType | null>(
  null
);

export default function BlockchainUtilsContextProvider({
  children,
}: BlockchainUtilsProviderProps) {
  const { setTransactionState, setTxError } = useBlockchainStateContext();
  const {
    selectedItem,
    selectedResourceBuilding,
    setSelectedResourceBuilding,
  } = useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();

  const signer = useSigner();
  const connectWithMetamask = useConnect();
  const chainId = useChainId();
  const validChainId = Sepolia.chainId;
  const switchChain = useSwitchChain();
  const metamaskConfig = metamaskWallet();

  const handleConnectWithMetamask = async () => {
    try {
      await connectWithMetamask(metamaskConfig, { chainId: validChainId });
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
      } catch (error) {
        console.log(error);
        setTransactionState("connectionRejected");
      }
    }
  };

  const validateChain = async () => {
    if (chainId && chainId != validChainId) {
      try {
        setTransactionState("waitingWalletConnection");
        await switchChain(validChainId);
      } catch (error) {
        setTransactionState("connectionRejected");
        console.log(error);
      }
    }
  };

  async function recruitArmy(index: number, amount:number) {
    validateWallet()
    validateChain()
    try {
      if (signer && inViewLand) {
        setTransactionState("waitingUserApproval");
        const tx = await townSInst(signer).recruit(inViewLand.tokenId,index,amount)
        setTransactionState("waitingBlockchainConfirmation");
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log(receipt.status === 1);

          setTransactionState("confirmed");
        }
      } else {
        setTransactionState(null);
      }
    } catch (error) {
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
  }

  async function mintResourceBuilding() {
    validateWallet();
    validateChain();
    try {
      if (signer && inViewLand && selectedResourceBuilding) {
        console.log(inViewLand.tokenId);
        let tx;
        if (selectedResourceBuilding.level == 0) {
          setTransactionState("waitingUserApproval");
          tx = await townSInst(signer).buildResourceBuilding(
            inViewLand.tokenId,
            selectedResourceBuilding.type == "Farm" ? 0 : 1
          );
        } else {
          setTransactionState("waitingUserApproval");
          tx = await townSInst(signer).upgradeResourceBuilding(
            selectedResourceBuilding.tokenId,
            inViewLand.tokenId
          );
        }
        setTransactionState("waitingBlockchainConfirmation");

        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log(receipt.status === 1);

          setTransactionState("confirmed");
        }
      } else {
        setTransactionState(null);
      }
    } catch (error) {
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
  }
  const mint = async (
    selectedLand: SelectedLandType,
    priceFormatEther: BigNumberish | null
  ) => {
    validateWallet();
    validateChain();

    if (signer && chainId == validChainId && selectedLand) {
      try {
        const landsInst = landsSInst(signer);
        const landCoordinatesObject = landObjectFromTokenId(
          selectedLand.coordinate
        );
        console.log("minting...");
        setTransactionState("waitingUserApproval");
        const tx = await landsInst.mintLand(
          landCoordinatesObject.x,
          landCoordinatesObject.y,
          {
            value: priceFormatEther,
          }
        );

        setTransactionState("waitingBlockchainConfirmation");

        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log(receipt.status === 1);

          setTransactionState("confirmed");
        }
      } catch (error) {
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
      chainId == validChainId &&
      selectedResourceBuilding
    ) {
      try {
        const townInst = townSInst(signer);
        setTransactionState("waitingUserApproval");
        const tx = await townInst.claimRevenue(
          selectedResourceBuilding.tokenId
        );
        setTransactionState("waitingBlockchainConfirmation");
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log(receipt.status === 1);

          setTransactionState("confirmed");
          setSelectedResourceBuilding({
            ...selectedResourceBuilding,
            earnedAmount: 0,
          });
        }
      } catch (error) {
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
      chainId == validChainId &&
      selectedItem &&
      inViewLand
    ) {
      try {
        const townInst = townSInst(signer);
        setTransactionState("waitingUserApproval");
        let tx;
        if (selectedItem.name == "Barracks") {
          console.log("upgrading barracks");
          tx = await townInst.buildBarracks(inViewLand.tokenId);
        }
        if (selectedItem.name == "Townhall") {
          console.log("upgrading townhall");
          tx = await townInst.buildTownhall(inViewLand.tokenId);
        }
        if (selectedItem.name == "TrainingCamp") {
          console.log("upgrading training camp");

          tx = await townInst.buildTrainingCamp(inViewLand.tokenId);
        }
        if (selectedItem.name == "Wall") {
          console.log("upgrading walls");
          tx = await townInst.buildWalls(inViewLand.tokenId);
        }
        setTransactionState("waitingBlockchainConfirmation");

        const receipt = await tx.wait();
        if (receipt.status === 1) {
          console.log(receipt.status === 1);

          setTransactionState("confirmed");
        }
      } catch (error) {
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
    } else {
      setTransactionState(null);
    }
  };


  return (
    <BlockchainUtilsContext.Provider value={{ buildBuilding, mint, claim,mintResourceBuilding, recruitArmy }}>
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