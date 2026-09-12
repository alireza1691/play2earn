"use client";

import { BMTSInst, bmtWrite, townAddressFor, landsMainnetSInst, landsSInst, landsWrite, townMainnetSInst, townSInst, townWrite } from "@/lib/instances";
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
import { TxSuccessLink, useBlockchainStateContext } from "./blockchain-state-context";
import { Sepolia, Polygon } from "@thirdweb-dev/chains";
import { landObjectFromTokenId } from "@/lib/utils";
import { BigNumber, BigNumberish, ContractTransaction, ethers, utils } from "ethers";
import { useSelectedBuildingContext } from "./selected-building-context";
import { useUserDataContext } from "./user-data-context";
import { usePathname } from "next/navigation";
import { useSelectedWindowContext } from "./selected-window-context";
import { useMapContext } from "./map-context";
import { useApiData } from "./api-data-context";
import { parseEther, TransactionTypes } from "ethers/lib/utils";
import { clanSInst } from "@/lib/clans";

import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { hasSlippageGuards, isSepolia, routeFor, useDeployment } from "@/lib/deployments";


/**
 * How far below the quote a fill may land before the contract rejects it.
 *
 * A quote is only good for the reserves it was taken from, and anyone watching
 * the mempool can move those before the trade mines. 1% is the usual default;
 * the swap panel lets a player widen it when the pool is moving, or tighten it
 * when they would rather fail than fill badly.
 */
export const DEFAULT_SLIPPAGE_PERCENT = 1;
export const SLIPPAGE_CHOICES = [0.5, 1, 3] as const;

/**
 * Quote minus the tolerance, in basis points so a fractional percent survives
 * integer maths — 0.5% is 50 bps, and `mul(995).div(1000)` would not express it.
 */
const applyTolerance = (quoted: BigNumber, percent: number): BigNumber => {
  const bps = Math.round(Math.max(0, Math.min(100, percent)) * 100);
  return quoted.mul(10_000 - bps).div(10_000);
};

type BlockchainUtilsProviderProps = {
  children: React.ReactNode;
};

type BlockchainUtilsContextType = {
  buildBuilding: () => Promise<void>;
  claim: () => Promise<void>;
  claimAll: () => Promise<void>;
  mint: (
    selectedLand: SelectedLandType,
    priceFormatEther: BigNumberish | null
  ) => Promise<void>;
  mintResourceBuilding: () => Promise<void>;
  recruitArmy:( amounts:number[]) => Promise<void>;
  dispatchArmy:  () => Promise<void>;
  dispatchedArmyAction : (dispatchedArmyIndex: number,isReturning:boolean) => Promise<void>;
  retreatArmy: (dispatchedArmyIndex: number) => Promise<void>;
  disbandArmy: (amounts: number[]) => Promise<void>;
  transferGoods: (goodIndex: number, amount: number, toLandId: number) => Promise<void>;
  swapGoods: (fromIndex: number, amount: number, slippagePercent?: number) => Promise<void>;
  approve:  (amount: number) => Promise<number>;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  convert: (amount: number, index:number, isBuy: boolean, slippagePercent?: number) => Promise<void>;
  faucet: () => Promise<void>;
  finishNow: () => Promise<void>;
  createClan: (landTokenId: number, name: string) => Promise<void>;
  inviteToClan: (account: string) => Promise<void>;
  joinClan: (clanId: number) => Promise<void>;
  leaveClan: () => Promise<void>;
  kickFromClan: (account: string) => Promise<void>;
  transferClanLeadership: (account: string) => Promise<void>;
  requestToJoinClan: (clanId: number) => Promise<void>;
  cancelClanRequest: () => Promise<void>;
  approveClanRequest: (account: string) => Promise<void>;
  rejectClanRequest: (account: string) => Promise<void>;
};

const BlockchainUtilsContext = createContext<BlockchainUtilsContextType | null>(
  null
);

export default function BlockchainUtilsContextProvider({
  children
}: BlockchainUtilsProviderProps) {
  const { setTransactionState, setTxError ,setMessage, setSuccessLink} = useBlockchainStateContext();
  const {
    selectedItem,
    selectedResourceBuilding, setSelectedResourceBuilding
  } = useSelectedBuildingContext();
  const { inViewLand, chosenLand, setInViewLand, refreshLand } = useUserDataContext();
  const { setApiTrigger } = useApiData();
  const {selectedArmy} = useSelectedWindowContext()
  const {selectedLand,setSelectedLand} = useMapContext()
  const pathname = usePathname()
  const isTestnet = pathname.includes("/testnet/")
  const deployment = useDeployment();
  
  const signer = useSigner();
  const connectWithMetamask = useConnect();
  const chainId = useChainId();
  const testnetChainId = Sepolia.chainId;
  const mainnetChainId = Polygon.chainId
  const switchChain = useSwitchChain();
  const metamaskConfig = metamaskWallet();
  const notify = () => {
    // toast("Default Notification !");

    toast.success("Transaction submitted !", {
      position: "top-right"
    });

    // toast.error("Error Notification !", {
    //   position: "top-left"
    // });

    // toast.warn("Warning Notification !", {
    //   position: "bottom-left"
    // });

    // toast.info("Info Notification !", {
    //   position: "bottom-center"
    // });

    // toast("Custom Style Notification with css class!", {
    //   position: "bottom-right",
    //   className: 'foo-bar'
    // });
  };

  const handleConnectWithMetamask = async () => {
    try {
      await connectWithMetamask(metamaskConfig, { chainId: isSepolia(deployment) ? testnetChainId : mainnetChainId });
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
        await switchChain(isSepolia(deployment) ? testnetChainId : mainnetChainId);
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


  /**
   * What a confirmed transaction should say and refresh.
   *
   * Every action passes its own, because the modal reports whatever the last
   * one left behind: this used to be hardcoded to the mint message, so
   * claiming a farm, depositing, recruiting — everything — announced "Land
   * minted successfully".
   */
  type TxOutcome = {
    /** Shown in the confirmation modal. Name the action, in the past tense. */
    message: string;
    /**
     * Only for actions that write an event the read model is rebuilt from:
     * Transfer (mint), Build/Upgrade (resource buildings), Attack (war).
     * Everything else — goods, army counts, PLOT, town hall levels — is read
     * back with a direct call, so re-fetching the whole explorer log for those
     * cost seconds and rebuilt every derived list for nothing.
     */
    refetchLogs?: boolean;
    /** Somewhere to go next, when the action has an obvious follow-on. */
    link?: TxSuccessLink;
  };

  const handleResult = async (tx: ContractTransaction, outcome: TxOutcome) => {
    let success = false
    setTransactionState("waitingBlockchainConfirmation");
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      setTransactionState("confirmed");
      success = true
      notify()
      setMessage(outcome.message)
      setSuccessLink(outcome.link ?? null)
      // Refresh here rather than only when the modal's Close button is
      // pressed. A claim credits the land on chain immediately, but the screen
      // kept showing the balance it had read before the transaction, so a
      // successful claim looked like it had done nothing at all.
      //
      // Not blocking, though: the screen behind the modal is already showing
      // this land correctly, and only two numbers on it are about to change.
      refreshLand();
      if (outcome.refetchLogs) setApiTrigger(true);
    }
    return success
  }

  /**
   * @param slippagePercent The worst fill the caller will accept, as a
   *        percentage below the quote. Defaults to 1, which is what the panel
   *        offers unless the player picks otherwise. Only v5 can enforce it —
   *        v4's trade functions have no minimum-out argument at all.
   */
  const convert = async (amount:number, index: number, isbuy:boolean, slippagePercent: number = DEFAULT_SLIPPAGE_PERCENT) =>{
    validateWallet()
    validateChain()
    try {
      if (signer && inViewLand) {
        const instance = townWrite(signer, deployment)
        setTransactionState("waitingUserApproval");
        const wei = parseEther(amount.toString())

        // v5 added a minimum-out argument to both trade paths; v4 has the
        // three-argument form and cannot take a fourth. The pool prices each
        // trade against its own reserves, so the quote is only good for the
        // reserves it came from — quote now, and refuse a fill more than a
        // percent worse than that.
        const args: unknown[] = [inViewLand.tokenId, index, wei]
        if (hasSlippageGuards(deployment)) {
          const quoted: BigNumber = isbuy
            ? await instance.quoteBuy(index, wei)
            : await instance.quoteSell(index, wei)
          args.push(applyTolerance(quoted, slippagePercent))
        }

        const tx: ContractTransaction = isbuy
          ? await instance.buyGood(...args)
          : await instance.sellGood(...args)
        const good = index === 0 ? "Food" : "Gold"
        handleResult(tx, { message: isbuy ? `${good} bought` : `${good} sold` })
      } else {
        setTransactionState(null);
      } 
    } catch (error) {
      handleError(error)
    }
  }

  const faucet = async () =>{
    validateWallet()
    validateChain()
    try {
      if (signer && inViewLand) {
        const instance = bmtWrite(signer, deployment)
        setTransactionState("waitingUserApproval");
        const tx: ContractTransaction =  await instance.faucet()
        handleResult(tx, { message: "Test PLOT added to your wallet" })
      } else {
        setTransactionState(null);
      } 
    } catch (error) {
      handleError(error)
    }
  }


  const approve = async (amount: number) =>{
    let approvedAmount = 0
    validateWallet()
    validateChain()
    try {
      if (signer) {
        const instance = BMTSInst(signer)
        setTransactionState("waitingUserApproval");
        const tx: ContractTransaction = await instance.approve(townAddressFor(deployment), parseEther(amount.toString()))
        const success = await handleResult(tx, { message: "Spending approved" })
        if (success) {
          approvedAmount = amount
        }
      } else {
        setTransactionState(null);
      } 
    } catch (error) {
      handleError(error)
    }
    return approvedAmount
  }
  
  const deposit = async (amount: number) =>{
    validateWallet()
    validateChain()
    try {
      if (signer) {
      const instance = townWrite(signer, deployment)
      setTransactionState("waitingUserApproval");
      const tx: ContractTransaction = await instance.deposit(parseEther(amount.toString()))
      await handleResult(tx, { message: "PLOT moved into your game balance" })
      } else {
        setTransactionState(null);
      } 
    } catch (error) {
      handleError(error)
    }
  }
  const withdraw = async (amount: number) =>{
    validateWallet()
    validateChain()
    try {
      if (signer) {
        const instance = townWrite(signer, deployment)
      setTransactionState("waitingUserApproval");
      const tx: ContractTransaction = await instance.withdraw(parseEther(amount.toString()))
      await handleResult(tx, { message: "PLOT withdrawn to your wallet" })
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
  //       const instance = townWrite(signer, deployment)
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
        const instance = townWrite(signer, deployment)
        setTransactionState("waitingUserApproval");
        // const tx = await instance.war(Number(chosenLand.tokenId),dispatchedArmyIndex)

        const tx:ContractTransaction = isReturning ? await instance.joinDispatchedArmy(Number(chosenLand.tokenId),dispatchedArmyIndex) : await instance.war(Number(chosenLand.tokenId),dispatchedArmyIndex)
        await handleResult(tx, isReturning
          ? { message: "Army and loot are home" }
          : { message: "Battle resolved", refetchLogs: true })
      } else {
        setTransactionState(null);
      }
    } catch (error) {
      handleError(error)
    }
  }

  /**
   * Turns a marching army around before it reaches the target.
   *
   * Costs gold per warrior, burned rather than paid to the defender — paying
   * the target would have let two co-operating accounts ship goods to each
   * other for free, undercutting the 5% transferGoods charges for exactly that.
   * The march home is however far they already came, so calling this early is
   * cheap and calling it at the gates costs the full journey.
   */
  async function retreatArmy(dispatchedArmyIndex: number) {
    validateWallet()
    validateChain()
    try {
      if (signer && chosenLand) {
        const instance = townWrite(signer, deployment)
        setTransactionState("waitingUserApproval");
        const tx: ContractTransaction = await instance.retreat(
          Number(chosenLand.tokenId),
          dispatchedArmyIndex
        )
        await handleResult(tx, { message: "Army is turning back", refetchLogs: true })
      } else {
        setTransactionState(null);
      }
    } catch (error) {
      handleError(error)
    }
  }

  /**
   * Deletes warriors from the garrison outright. Nothing is refunded — this is
   * for freeing capacity under the training camp cap, not for selling troops.
   */
  async function disbandArmy(amounts: number[]) {
    validateWallet()
    validateChain()
    try {
      if (signer && chosenLand) {
        const instance = townWrite(signer, deployment)
        setTransactionState("waitingUserApproval");
        const tx: ContractTransaction = await instance.disbandArmy(
          Number(chosenLand.tokenId),
          amounts
        )
        await handleResult(tx, { message: "Warriors disbanded" })
      } else {
        setTransactionState(null);
      }
    } catch (error) {
      handleError(error)
    }
  }

  /**
   * Ships goods from the land in view to another land you own.
   *
   * 5% is lost in transit and leaves the world entirely — the panel says so
   * before sending, because the arriving balance is not the amount typed.
   */
  async function transferGoods(goodIndex: number, amount: number, toLandId: number) {
    validateWallet()
    validateChain()
    try {
      if (signer && inViewLand) {
        const instance = townWrite(signer, deployment)
        setTransactionState("waitingUserApproval");
        const tx: ContractTransaction = await instance.transferGoods(
          goodIndex,
          parseEther(amount.toString()),
          inViewLand.tokenId,
          toLandId
        )
        await handleResult(tx, { message: "Goods shipped" })
      } else {
        setTransactionState(null);
      }
    } catch (error) {
      handleError(error)
    }
  }

  /**
   * Food to gold or gold to food, through the pool.
   *
   * Two hops rather than one — the pool has no direct good-to-good pair, so it
   * routes through PLOT and pays the fee twice. That is why the panel quotes
   * the output rather than showing a rate.
   */
  async function swapGoods(fromIndex: number, amount: number, slippagePercent: number = DEFAULT_SLIPPAGE_PERCENT) {
    validateWallet()
    validateChain()
    try {
      if (signer && inViewLand) {
        const instance = townWrite(signer, deployment)
        setTransactionState("waitingUserApproval");
        const wei = parseEther(amount.toString())

        const args: unknown[] = [inViewLand.tokenId, fromIndex, wei]
        if (hasSlippageGuards(deployment)) {
          // No direct quote for the two-hop route, so price it the way the
          // contract does: good -> PLOT, then PLOT -> the other good.
          const mid: BigNumber = await instance.quoteSell(fromIndex, wei)
          const out: BigNumber = await instance.quoteBuy(fromIndex === 0 ? 1 : 0, mid)
          args.push(applyTolerance(out, slippagePercent))
        }

        const tx: ContractTransaction = await instance.swapGoods(...args)
        await handleResult(tx, {
          message: fromIndex === 0 ? "Food swapped for gold" : "Gold swapped for food",
        })
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
      const instance = townWrite(signer, deployment)
      setTransactionState("waitingUserApproval");
      const tx:ContractTransaction  = await instance.dispatchArmy(selectedArmy,Number(chosenLand.tokenId),selectedLand.coordinate)
      await handleResult(tx, { message: "Army dispatched" })
    } else {
      setTransactionState(null);
    }
  } catch (error) {
    handleError(error)
  }
 }

  async function recruitArmy( amounts:number[]) {
    validateWallet()
    validateChain()
    try {
      if (signer && inViewLand) {
        setTransactionState("waitingUserApproval");
        const inst = townWrite(signer, deployment)
        const tx:ContractTransaction = await inst.recruit(inViewLand.tokenId,amounts)
        await handleResult(tx, { message: "Warriors recruited" })
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
          tx = await (townWrite(signer, deployment)).buildResourceBuilding(
            inViewLand.tokenId,
            selectedResourceBuilding.type == "Farm" ? 0 : 1
          );
        } else {
          setTransactionState("waitingUserApproval");
          tx = await (townWrite(signer, deployment)).upgradeResourceBuilding(
            selectedResourceBuilding.tokenId,
            inViewLand.tokenId
          );
        }
        const started = selectedResourceBuilding.level == 0 ? "construction" : "upgrade"
        const success = await handleResult(tx, {
          message: `${selectedResourceBuilding.type} ${started} started`,
          refetchLogs: true,
        })
        if (success) {
          // `level++` returned the level *before* the increment and mutated
          // the object it was spreading from, so the card kept showing the old
          // level while the shared object silently gained the new one.
          const updatedObj = {...selectedResourceBuilding, level: selectedResourceBuilding.level + 1}
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
        const landsInst = landsWrite(signer, deployment);
        
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
          const success = await handleResult(tx, {
            message: "Land minted",
            refetchLogs: true,
            link: { href: routeFor(deployment, "myLand"), label: "My land" },
          })
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
        const townInst = (townWrite(signer, deployment));
        setTransactionState("waitingUserApproval");
        const tx = await townInst.claimRevenue(
          selectedResourceBuilding.tokenId
        );
        await handleResult(tx, {
          message: `${selectedResourceBuilding.type === "Farm" ? "Food" : "Gold"} claimed`,
        })
      } catch (error) {
        handleError(error)
      }
    } else {
      setTransactionState(null);
    }
  };

  /**
   * Claims every resource building on the land in one transaction.
   *
   * `claim` above bills a transaction per building, so a town with four of them
   * costs four approvals and four fees to collect what is one decision. The
   * contract has always been able to do the whole land at once; the client was
   * simply not asking.
   */
  const claimAll = async () => {
    validateWallet();
    validateChain();

    if (signer && chainId && chainId == testnetChainId && chosenLand) {
      try {
        const townInst = townWrite(signer, deployment);
        setTransactionState("waitingUserApproval");
        const tx = await townInst.claimAll(Number(chosenLand.tokenId));
        await handleResult(tx, { message: "All buildings claimed" });
      } catch (error) {
        handleError(error);
      }
    } else {
      setTransactionState(null);
    }
  };

  /**
   * Pays gold to end the worker's current job immediately.
   *
   * The cost is one gold per whole minute still to run, so it falls as the
   * build does — workerComp computes it from the same remaining-minutes figure
   * the contract does rather than reading it back separately.
   */
  const finishNow = async () => {
    validateWallet();
    validateChain();
    try {
      if (signer && inViewLand) {
        const instance = townWrite(signer, deployment);
        setTransactionState("waitingUserApproval");
        const tx: ContractTransaction = await instance.finishNow(
          inViewLand.tokenId
        );
        await handleResult(tx, { message: "Building finished" });
      } else {
        setTransactionState(null);
      }
    } catch (error) {
      handleError(error);
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
        const townInst = (townWrite(signer, deployment));
        setTransactionState("waitingUserApproval");
        let tx:ContractTransaction | undefined;
        let updatedObj :InViewLandType = inViewLand
        // What the modal calls this building, and the level it is on now — a
        // building still at zero is being put up, not upgraded.
        let label: string = selectedItem.name
        let currentLevel: BigNumberish = 0
        if (selectedItem.name == "Barracks") {
          tx = await townInst.buildBarracks(inViewLand.tokenId);
          updatedObj = {...inViewLand,barracksLvl: ethers.BigNumber.from(inViewLand.barracksLvl).add(1) }
          label = "Barracks"
          currentLevel = inViewLand.barracksLvl
        }
        if (selectedItem.name == "Townhall") {
          tx = await townInst.buildTownhall(inViewLand.tokenId);
          updatedObj = {...inViewLand,townhallLvl: ethers.BigNumber.from(inViewLand.townhallLvl).add(1) }
          label = "Town hall"
          currentLevel = inViewLand.townhallLvl
        }
        if (selectedItem.name == "TrainingCamp") {
          tx = await townInst.buildTrainingCamp(inViewLand.tokenId);
          updatedObj = {...inViewLand,trainingCampLvl: ethers.BigNumber.from(inViewLand.trainingCampLvl).add(1) }
          label = "Training camp"
          currentLevel = inViewLand.trainingCampLvl
        }
        if (selectedItem.name == "Wall") {
          tx = await townInst.buildWalls(inViewLand.tokenId);
          updatedObj = {...inViewLand,wallLvl: ethers.BigNumber.from(inViewLand.wallLvl).add(1) }
          label = "Walls"
          currentLevel = inViewLand.wallLvl
        }
        if (tx) {
          const started = ethers.BigNumber.from(currentLevel).isZero()
            ? "construction"
            : "upgrade"
          await handleResult(tx, { message: `${label} ${started} started` })
          setInViewLand(updatedObj)
        }
      } catch (error) {
        handleError(error)
      }
    } else {
      setTransactionState(null);
    }
  };


  /*  ****************************************************************
                                   Clans
      ****************************************************************  */

  /**
   * Clan writes all take the same shape, so they share one runner rather than
   * six near-identical copies of the validate / approve / confirm dance.
   *
   * They go through clanSInst, not townSInst: clans only exist on the v4
   * contracts, and lib/instances.ts still carries the deployed v3 ABI. Until
   * those are redeployed these will revert — see lib/clans.ts.
   */
  const clanAction = async (
    run: (instance: ReturnType<typeof clanSInst>) => Promise<ContractTransaction>,
    message: string
  ) => {
    validateWallet();
    validateChain();
    try {
      if (!signer) {
        setTransactionState(null);
        return;
      }
      setTransactionState("waitingUserApproval");
      const tx = await run(clanSInst(signer, deployment));
      await handleResult(tx, { message });
    } catch (error) {
      handleError(error);
    }
  };

  const createClan = async (landTokenId: number, name: string) =>
    clanAction((instance) => instance.createClan(landTokenId, name), `Clan ${name} created`);

  const inviteToClan = async (account: string) =>
    clanAction((instance) => instance.inviteToClan(account), "Invitation sent");

  const joinClan = async (clanId: number) =>
    clanAction((instance) => instance.joinClan(clanId), "You joined the clan");

  const leaveClan = async () =>
    clanAction((instance) => instance.leaveClan(), "You left the clan");

  const kickFromClan = async (account: string) =>
    clanAction((instance) => instance.kickFromClan(account), "Member removed");

  const transferClanLeadership = async (account: string) =>
    clanAction((instance) => instance.transferClanLeadership(account), "Leadership transferred");

  const requestToJoinClan = async (clanId: number) =>
    clanAction((instance) => instance.requestToJoinClan(clanId), "Request sent");

  const cancelClanRequest = async () =>
    clanAction((instance) => instance.cancelClanRequest(), "Request cancelled");

  const approveClanRequest = async (account: string) =>
    clanAction((instance) => instance.approveClanRequest(account), "Request approved");

  const rejectClanRequest = async (account: string) =>
    clanAction((instance) => instance.rejectClanRequest(account), "Request rejected");

  return (
    <BlockchainUtilsContext.Provider value={{ buildBuilding, mint, claim, claimAll, finishNow, mintResourceBuilding, recruitArmy ,dispatchArmy,dispatchedArmyAction, retreatArmy, disbandArmy, transferGoods, swapGoods, approve,deposit,withdraw,convert,faucet, createClan, inviteToClan, joinClan, leaveClan, kickFromClan, transferClanLeadership, requestToJoinClan, cancelClanRequest, approveClanRequest, rejectClanRequest}}>
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
