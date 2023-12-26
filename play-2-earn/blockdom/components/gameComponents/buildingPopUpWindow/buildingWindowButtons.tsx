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
  const { inViewLand } = useUserDataContext();
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

  async function mintResourceBuilding() {
    try {
      if (signer && inViewLand) {
        console.log(inViewLand?.tokenId);

        await townSInst(signer).buildResourceBuilding(
          inViewLand?.tokenId,
          selectedItem?.name == "Farm" ? 0 : 1
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function upgrade() {
    if (selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm") {
      await mintResourceBuilding();
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
          <button onClick={() => upgrade()} className="greenButton !w-1/2">
            Confirm upgrade
          </button>
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
