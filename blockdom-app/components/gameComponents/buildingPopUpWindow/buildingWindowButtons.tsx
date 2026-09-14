import { useBlockchainStateContext } from "@/context/blockchain-state-context";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townSInst } from "@/lib/instances";
import TopDuobleArrow from "@/svg/topDuobleArrow";
import { useSigner } from "@thirdweb-dev/react";
import React from "react";
import SelectedBuilding from "./selectedBuilding";
import { useIsMyLand } from "@/lib/useIsMyLand";
import { useAddress } from "@thirdweb-dev/react";

export default function BuildingWindowButtons() {
  const {
    selectedItem,
    setUpgradeMode,
    setActiveMode,
    activeMode,
    upgradeMode,
  } = useSelectedBuildingContext();
  const { buildBuilding,claim,mintResourceBuilding } = useBlockchainUtilsContext();
  const { inViewLand } = useUserDataContext();
  const {selectedResourceBuilding} = useSelectedBuildingContext()
  const signer = useSigner();
  const isMine = useIsMyLand();
  const address = useAddress();

  const relevantButton = () => {
    if (selectedItem?.name == "Townhall") {
      return "Clan";
    }
    if (selectedItem?.name == "Barracks") {
      return "Train army";
    }
    if (selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm") {
      return "Claim resources";
    }
    if (selectedItem?.name == "Wall") {
      return "Upgrade";
    }
    if (selectedItem?.name == "TrainingCamp") {
      return "Edit army";
    }
  };

  const isAllowed = (): boolean => {
    let allowed = false;
    if (inViewLand && selectedItem) {
      if (selectedItem.name == "Townhall") {
        return true;
      }
      const townHallLevel = Number(inViewLand.townhallLvl);
      if (selectedItem.name == "Barracks") {
        if (townHallLevel > Number(inViewLand.barracksLvl)) {
          return true;
        }
      }
      if (selectedItem.name == "TrainingCamp") {
        if (townHallLevel > Number(inViewLand.trainingCampLvl)) {
          return true;
        }
      }
      if (selectedItem.name == "Wall") {
        if (townHallLevel > Number(inViewLand.wallLvl)) {
          return true;
        }
      }

      if (selectedItem.name == "Farm") {
        if (townHallLevel > Number(selectedResourceBuilding?.level)) {
          return true
        }
      }
      if (selectedItem.name == "GoldMine") {
        if (townHallLevel > Number(selectedResourceBuilding?.level)) {
          return true
        }
      }
    }
    return allowed;
  };

 

  async function upgrade() {
    if (selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm") {
      await mintResourceBuilding();
    } else {
      await buildBuilding();
    }
  }

  async function handleAction() {}

  /*
    Every action in this window is onlyLandOwner on chain, so on somebody
    else's town they can only revert. Replacing the whole row rather than
    disabling each branch: there are seven of them across three modes, and a
    guard that has to be remembered in seven places is one that will be
    forgotten in the eighth.

    The building details above stay visible — looking around is the point.
  */
  if (!isMine) {
    return (
      <div className="flex flex-col gap-1 p-3 flex-shrink-0 mt-auto text-center">
        <p className="text-[12px] text-white/50">
          {address ? "You are visiting this town." : "Viewing as a guest."}
        </p>
        <p className="text-[10px] text-white/30">
          {address
            ? "Only the owner can build here."
            : "Connect a wallet that owns this land to build."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-between gap-2 p-2  flex-shrink-0  mt-auto ">
      {upgradeMode && (
        <>
          <button
            onClick={() => setUpgradeMode(false)}
            className="redButton !w-1/2"
          >
            Back
          </button>
          {inViewLand && inViewLand.remainedBuildTime == 0 && isAllowed() && (
            <button onClick={() => upgrade()} className="greenButton !w-1/2">
              Upgrade
            </button>
          )}
          {inViewLand && inViewLand.remainedBuildTime == 0 && !isAllowed() && (
            <button className="greenButton !w-1/2" disabled>
              Upgrade
            </button>
          )}
          {inViewLand && Number(inViewLand.remainedBuildTime) > 0 && (
            <button className="greenButton !w-1/2" disabled>
              Worker is busy
            </button>
          )}
        </>
      )}
      {!upgradeMode && !activeMode && (
        <>
          { selectedItem?.name != "Farm" && selectedItem?.name != "GoldMine" && selectedItem?.name != "Wall" && selectedItem?.name != "Townhall" ?   <button
            onClick={() => setActiveMode(true)}
            className="greenButton !py-2 !w-[70%]"
          >
            {relevantButton()}
          </button>:(
            <>
            { selectedResourceBuilding  && selectedResourceBuilding.earnedAmount > 0 ?
              <button
              onClick={() => claim()}
              className="greenButton !py-2 !w-[70%]"
            >
              {relevantButton()}
            </button>
            :
            <>
            {selectedItem.name != "Wall" &&    <button
            className="greenButton !py-2 !w-[70%]"
            disabled
          >
            {relevantButton()}
          </button>}
        
          </>
            }
            </>
          ) }
          {/*
            The walls have no active mode and no upgrade chevron, so this one
            button is the whole window's action — and it called claim(), which
            reads selectedResourceBuilding and so bailed out on a wall without
            saying anything. It says Upgrade, so it upgrades.

            Guarded the same way the upgrade branch above is: a busy worker or
            a town hall that is not ahead of the walls would both revert.
          */}
          {selectedItem?.name == "Wall" &&
            (inViewLand && Number(inViewLand.remainedBuildTime) > 0 ? (
              <button className="greenButton !py-2 !w-full" disabled>
                Worker is busy
              </button>
            ) : (
              <button
                onClick={() => upgrade()}
                disabled={!isAllowed()}
                className="greenButton !py-2 !w-full"
              >
                {relevantButton()}
              </button>
            ))}
          
       {selectedItem?.name != "Wall" &&   <button
            onClick={() => {setUpgradeMode(true),console.log("upgrade mode actived");
            }}
            className="outlineGreenButton !py-1 !w-[30%] flex justify-center hover:brightness-150"
          >
            <TopDuobleArrow />
          </button>}
        
        </>
      )}
      {activeMode && (
        <>
          <button
            onClick={() => setActiveMode(false)}
            className="redButton !w-1/2"
          >
            Back
          </button>
          <button onClick={() => handleAction()} className="greenButton !w-1/2">
            Confirm
          </button>
        </>
      )}
    </div>
  );
}
// discharge

