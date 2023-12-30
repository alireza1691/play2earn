import { useBlockchainStateContext } from "@/context/blockchain-state-context";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useUserDataContext } from "@/context/user-data-context";
import { townSInst } from "@/lib/instances";
import TopDuobleArrow from "@/svg/topDuobleArrow";
import { useSigner } from "@thirdweb-dev/react";
import React from "react";

export default function BuildingWindowButtons() {
  const {
    selectedItem,
    setUpgradeMode,
    setActiveMode,
    activeMode,
    upgradeMode,
  } = useSelectedBuildingContext();
  const { buildBuilding } = useBlockchainUtilsContext();
  const { inViewLand } = useUserDataContext();
  const {selectedResourceBuilding} = useSelectedBuildingContext()
  const signer = useSigner();

  const relevantButton = () => {
    if (selectedItem?.name == "Townhall") {
      return "Approve";
    }
    if (selectedItem?.name == "Barracks") {
      return "Train army";
    }
    if (selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm") {
      return "Claim resources";
    }
    if (selectedItem?.name == "Wall") {
      return "Approve";
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

  async function mintResourceBuilding() {
    try {
      if (signer && inViewLand && selectedResourceBuilding && selectedItem) {
        console.log(inViewLand.tokenId);
        if (selectedResourceBuilding.level == 0) {
          await townSInst(signer).buildResourceBuilding(
            inViewLand.tokenId,
            selectedItem.name == "Farm" ? 0 : 1
          );
        }
        if (selectedResourceBuilding.level > 0) {
          await townSInst(signer).upgradeResourceBuilding(selectedResourceBuilding.tokenId,inViewLand.tokenId)
        }
  
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function upgrade() {
    if (selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm") {
      await mintResourceBuilding();
    } else {
      buildBuilding();
    }
  }

  async function handleAction() {}

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
              Confirm upgrade
            </button>
          )}
          {inViewLand && inViewLand.remainedBuildTime == 0 && !isAllowed() && (
            <button className="greenButton !w-1/2" disabled>
              Upgrade townhall
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
          {" "}
          <button
            onClick={() => setActiveMode(true)}
            className="greenButton !py-2 !w-[70%]"
          >
            {relevantButton()}
          </button>
          <button
            onClick={() => setUpgradeMode(true)}
            className="outlineGreenButton !py-1 !w-[30%] flex justify-center hover:brightness-150"
          >
            <TopDuobleArrow />
          </button>
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
