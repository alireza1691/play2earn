"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import Image from "next/image";
import React from "react";

import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import { baseBuildAmounts, BuildCost, buildingCapacity, requiredGoods, townHallUnlocks, warriorsInfo } from "@/lib/data";
import FoodIcon from "@/svg/foodIcon";
import DoubleArrow from "@/svg/doubleArrow";
import DualProgressBar from "../daulProgressBar";
import GoldIcon from "@/svg/goldIcon";
import ProgressBar from "../progressBar";
import CapacityProgressBar from "../capacityProgressBar";
import { useUserDataContext } from "@/context/user-data-context";
import { formattedNumber } from "@/lib/utils";
import { isRewrite, useDeployment } from "@/lib/deployments";

export default function BuildingWindowDetails() {
  const { selectedItem, setSelectedItem, upgradeMode } =
    useSelectedBuildingContext();

  // Returns the element rather than the component: handing a value computed
  // during render to JSX as a component type is what React cannot follow, and
  // it is one step of indirection for nothing.
  const relevantContainer = () => {
    switch (selectedItem?.name) {
      case "Townhall":
        return <TownhallContainer />;
      case "Wall":
        return <WallContainer />;
      case "Barracks":
        return <BarracksContainer />;
      case "TrainingCamp":
        return <TrainingCampContainer />;
      case "GoldMine":
      case "Farm":
        return <ResourceContainer />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-grow">{relevantContainer()}</div>
    </>
  );
}

/**
 * What a farm or gold mine upgrade will actually take off the land.
 *
 * v3's `upgradeResourceBuilding` hands `_spendGoods` its two amounts the wrong
 * way round — `[requiredGold, requiredFood]` into a function that reads
 * `[food, gold]` — so a farm upgrade charges the mine's numbers and vice
 * versa. v4 fixed it and says so in a comment. The panel quotes what the
 * player will be charged, so on v3 it has to quote the swap.
 */
const resourceUpgradeBase = (type: string, v4: boolean): BuildCost => {
  const base =
    type === "Farm" ? baseBuildAmounts.Farm : baseBuildAmounts.goldMine;
  return v4 ? base : { food: base.gold, gold: base.food };
};

const ResourceContainer = () => {
  const { farms } = useUserDataContext();
  const deployment = useDeployment();
  const { upgradeMode, activeMode, selectedResourceBuilding } =
    useSelectedBuildingContext();

  // A gold mine produces gold, not food. Every figure below was labelled and
  // iconed as food regardless of which building was open, so a gold mine read
  // as a farm with a different picture.
  const isFarm = selectedResourceBuilding?.type !== "GoldMine";
  const ResourceIcon = isFarm ? FoodIcon : GoldIcon;
  const resourceName = isFarm ? "Food" : "Gold";

  const level = selectedResourceBuilding?.level ?? 0;
  const earned = selectedResourceBuilding?.earnedAmount ?? 0;
  const capacity = buildingCapacity(level, isRewrite(deployment));
  const nextCapacity = buildingCapacity(level + 1, isRewrite(deployment));
  // Production stops here — see readyToClaimBadge.tsx.
  const isFull = capacity > 0 && earned >= capacity;

  return (
    <div className=" w-[85%] ml-auto mr-auto flex flex-col mt-4 !text-white">
      {upgradeMode && selectedResourceBuilding && (
        <>
          <div className=" flex flex-col gap-3">
            <UpgradeHeader
              currentLevel={selectedResourceBuilding.level}
              title="Upgrade trait"
            />
            <div className=" flex flex-col">
              <h3 className=" flex flex-row items-center gap-2 font-medium">
                <ResourceIcon />
                {selectedResourceBuilding.level == 0
                  ? 0
                  : 8 ** selectedResourceBuilding.level}
                <span className=" blueText !font-medium">+ 8</span>
                {resourceName}/Day
              </h3>
              <DualProgressBar currentLevel={selectedResourceBuilding.level} />
            </div>
            {/*
              The store, not a made-up curve: this quoted `80 ** level`, so a
              level 3 mine claimed to hold 512,000 gold against a real cap of
              160. `buildingCapacity` is the contract's own figure — and it is
              the number the town screen's "Full — claim" badge fires on.
            */}
            <div className=" flex flex-col">
              <h3 className=" flex flex-row items-center gap-2 font-medium">
                <ResourceIcon />
                {capacity}
                <span className=" blueText !font-medium">
                  + {nextCapacity - capacity}
                </span>{" "}
                {resourceName} capacity
              </h3>
              <DualProgressBar currentLevel={selectedResourceBuilding.level} />
            </div>
          </div>
          <UpgradeContainer
            base={resourceUpgradeBase(
              selectedResourceBuilding.type,
              isRewrite(deployment)
            )}
            currentLevel={selectedResourceBuilding.level}
          />
        </>
      )}
      {!upgradeMode && !activeMode && (
        <>
          <h3 className=" font-semibold  flex flex-row  items-center">
            <ResourceIcon />{" "}
            {selectedResourceBuilding && selectedResourceBuilding.level > 0
              ? 8 ** selectedResourceBuilding.level
              : 0}
            /Day
          </h3>
          <ProgressBar
            amount={
              selectedResourceBuilding
                ? selectedResourceBuilding.level * 16.5
                : 0
            }
          />

          {/*
            Stored against the cap. The bar used to divide by
            `(2 ** level - 1) * 80`, which is neither deployment's formula — it
            read 0% at level 1 with the building full, and undefined at level 0.
          */}
          <h3 className="mt-4 font-semibold  flex flex-row  items-center gap-2">
            <ResourceIcon />
            <span>
              {earned}
              <span className="text-white/50"> / {capacity}</span>
            </span>
            {isFull && (
              <span className="ml-auto text-[12px] font-bold text-[color:var(--pw-accent)]">
                Full — claim
              </span>
            )}
          </h3>
          <ProgressBar
            amount={capacity > 0 ? Math.min((earned * 100) / capacity, 100) : 0}
          />
        </>
      )}
    </div>
  );
};
const BarracksContainer = () => {
  const { upgradeMode, activeMode } = useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();

  return (
    <div className="w-[85%] ml-auto mr-auto mt-4 flex flex-col">
      {!upgradeMode && !activeMode && (
        <>
          <h3 className=" darkGreenBg blueText !font-medium py-2 text-center justify-center">
            Availabe units
          </h3>
          <div className=" grid grid-cols-3 mt-4 gap-y-4 ">
            {warriorsInfo.map((warrior, key) => (
              <div
                key={key}
                className="relative cardBg py-1 justify-center items-center w-fit ml-auto mr-auto darkShadow"
              >
                {inViewLand && Number(inViewLand.barracksLvl) <= key && (
                  <p className=" !leading-4 w-full px-1 z-10 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center  left-1/2 absolute blueText !font-light !text-[12px]">
                    Available at<br></br>{" "}
                    <span className=" font font-semibold">Level {key + 1}</span>
                  </p>
                )}
                <Image
                  className={`${
                    inViewLand &&
                    Number(inViewLand.barracksLvl) <= key &&
                    "brightness-50"
                  } w-[80px] !h-auto`}
                  src={warrior.image}
                  width={60}
                  height={120}
                  alt="warrior image"
                />
              </div>
            ))}
          </div>
        </>
      )}
      {upgradeMode && (
        <>
          <UpgradeHeader title="New troop" currentLevel={1} />
          <div className=" w-fit ml-auto mr-auto mt-auto mb-auto h-auto py-1">
            <Image
              className={`w-[80px] glassBg !h-auto px-1 py-[5px]`}
              src={"/images/warriorTest.png"}
              width={60}
              height={120}
              alt="warrior image"
            />
          </div>
          <UpgradeContainer
            base={baseBuildAmounts.barracks}
            currentLevel={Number(inViewLand?.barracksLvl) || 0}
          />
        </>
      )}
    </div>
  );
};
const TrainingCampContainer = () => {
  const { upgradeMode, activeMode } = useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();
  const totalArmyAmount = () => {
    let totalArmy = 0;
    if (inViewLand) {
      for (let index = 0; index < inViewLand.army.length; index++) {
        totalArmy += Number(inViewLand.army[index]);
      }
    }
    return totalArmy;
  };

  return (
    <div className="w-[80%] ml-auto mr-auto mt-4 flex flex-col">
      {!upgradeMode && !activeMode && inViewLand && (
        <>
          <div className=" flex flex-col">
            <div className=" flex flex-row items-center font-semibold !text-white gap-3">
              {" "}
              <ArmyCapacityIcon /> {totalArmyAmount()} units
            </div>
            <CapacityProgressBar amount={50} />
          </div>
          <div className="grid grid-cols-3 mt-4 gap-4 mr-auto ml-auto">
            {warriorsInfo.map((warrior, key) => (
              <div
                key={key}
                className="relative  !rounded-[4px] cardBg px-1 pt-1 pb-6 justify-center items-center w-fit ml-auto mr-auto darkShadow"
              >
                {inViewLand && Number(inViewLand.barracksLvl) <= key && (
                  <p className=" !leading-4 w-full px-1 z-10 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center  left-1/2 absolute blueText !font-light !text-[12px]">
                    Available at<br></br>{" "}
                    <span className=" font font-semibold">Level {key + 1}</span>
                  </p>
                )}
                <p className=" absolute bottom-0 left-1/2 -translate-x-1/2 font-semibold text-[14px]">
                  {inViewLand && Number(inViewLand.army[key])}
                </p>
                <Image
                  className={`${
                    inViewLand &&
                    Number(inViewLand.barracksLvl) <= key &&
                    "brightness-50"
                  } w-[80px] !h-auto rounded-[4px]`}
                  src={warrior.image}
                  width={60}
                  height={120}
                  alt="warrior image"
                />
              </div>
            ))}
          </div>
        </>
      )}
      {upgradeMode && (
        <>
          <UpgradeHeader title="Upgrade trait" currentLevel={1} />
          <div className=" flex flex-col mt-3">
            <div className=" flex flex-row items-center font-semibold !text-white gap-3">
              {" "}
              <ArmyCapacityIcon /> 100<span className="blueText">+ 100 </span>
              Army capacity
            </div>
            <DualProgressBar
              currentLevel={Number(inViewLand?.trainingCampLvl)}
            />
          </div>

          <UpgradeContainer
            base={baseBuildAmounts.trainingCamp}
            currentLevel={Number(inViewLand?.trainingCampLvl) || 0}
          />
        </>
      )}
    </div>
  );
};

/**
 * The town hall panel.
 *
 * It used to carry the goods/PLOT trade as a pair of unlabelled inputs at the
 * bottom — the only way into the game's market was three clicks inside a
 * building. That moved to `components/gameComponents/swapComp.tsx`, opened from
 * the balance bar; what is left here is a link to it, so a player who learned
 * the old place still finds it.
 */
const TownhallContainer = () => {
  const { upgradeMode, activeMode, setSelectedItem } =
    useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();
  const { setSelectedWindowComponent } = useSelectedWindowContext();

  return (
    <>
      <div className=" w-[85%] ml-auto mr-auto flex flex-col mt-4 !text-white">
        {upgradeMode && inViewLand && (
          <>
            <div className=" flex flex-col gap-3">
              <UpgradeHeader
                currentLevel={Number(inViewLand.townhallLvl)}
                title="Upgrades unlocks at next level"
              />
              <div className="flex flex-row gap-4 overflow-x-scroll px-2 py-2 bg-black/20 rounded-[4px]  custom-scrollbar">
                {townHallUnlocks[Number(inViewLand.townhallLvl)].map((item, key) => (
                  <a
                    key={key}
                    className="flex-1 glassBg flex text-[10px] min-w-16 !h-20 px-2 text-center justify-center items-center  "
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
            <UpgradeContainer
              base={baseBuildAmounts.townHall}
              currentLevel={Number(inViewLand?.townhallLvl) || 0}
            />
          </>
        )}
        {!upgradeMode && !activeMode && (
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex flex-row gap-3">
              <h3 className="balBg flex w-1/2 flex-row items-center justify-center gap-3 py-1 blueText !font-medium">
                <FoodIcon />
                {inViewLand && formattedNumber(inViewLand.goodsBalance[0])}
              </h3>
              <h3 className="balBg flex w-1/2 flex-row items-center justify-center gap-3 py-1 blueText !font-medium">
                <GoldIcon />
                {inViewLand && formattedNumber(inViewLand.goodsBalance[1])}
              </h3>
            </div>
            <p className="text-[12px] font-light leading-4 text-white/60">
              The market trades those two against PLOT. It has its own window
              now, reachable from the balance bar at the top of the screen.
            </p>
            <button
              onClick={() => {
                setSelectedItem(null);
                setSelectedWindowComponent("swap");
              }}
              className="greenButton !w-full !py-2"
            >
              Open swap
            </button>
          </div>
        )}
      </div>
    </>
  );
};
const WallContainer = () => {
  const { inViewLand } = useUserDataContext();
  return (
    <div className="w-[85%] ml-auto mr-auto mt-4 flex flex-col">
      {inViewLand && (
        <>
          <h3 className=" darkGreenBg blueText !font-medium py-2 text-center justify-center">
            Extra defense power:
          </h3>
          <h3>{Number(inViewLand.wallLvl) * 5}%</h3>
          <ProgressBar amount={Number(inViewLand.wallLvl) * 16.5 || 0} />

          <div className="mt-10">
            <UpgradeHeader
              title="+ 5% Defense power"
              currentLevel={Number(inViewLand.wallLvl)}
            />
            <DualProgressBar currentLevel={Number(inViewLand.wallLvl)} />
          </div>
          <UpgradeContainer
            base={baseBuildAmounts.wall}
            currentLevel={Number(inViewLand.wallLvl) || 0}
          />
        </>
      )}
    </div>
  );
};

type UpgradeContainerProps = {
  /** The building's cost at level 0, from lib/data. */
  base: BuildCost;
  /** The level it is on *now* — the contract scales by 2 ** currentLevel. */
  currentLevel: number;
};

/**
 * The "required resources" pair under a building's upgrade panel.
 *
 * It took the two figures ready-made, and every caller handed it the flat base
 * cost — so the panel quoted the same price at level 5 as at level 0. Taking
 * the base and the level instead keeps the doubling in one place, next to the
 * comment explaining where it comes from.
 */
const UpgradeContainer = ({ base, currentLevel }: UpgradeContainerProps) => {
  const { food: foodAmount, gold: goldAmount } = requiredGoods(
    base,
    currentLevel
  );
  return (
    <div className=" flex flex-col mt-auto gap-3 mb-3">
      <h3 className=" py-2 px-4 w-full text-center blueText !font-medium darkGreenBg">
        {" "}
        Required resources
      </h3>
      <div className="flex flex-row gap-4">
        <h3 className="balBg w-[50%] flex flex-row items-center blueText !font-medium gap-3 justify-center py-1">
          <GoldIcon />
          {goldAmount}
        </h3>
        <h3 className="balBg w-[50%] flex flex-row items-center blueText !font-medium gap-3 justify-center py-1">
          <FoodIcon />
          {foodAmount}
        </h3>
      </div>
    </div>
  );
};

type UpgradeHeaderProps = {
  currentLevel: number;
  title: string;
};
const UpgradeHeader = ({ title, currentLevel }: UpgradeHeaderProps) => {
  const { selectedResourceBuilding, selectedItem } =
    useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();
  return (
    <div className=" flex flex-col gap-3">
      <h3 className=" flex flex-row items-center gap-6 justify-center">
        {selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm" ? (
          <>
            {" "}
            Level {selectedResourceBuilding &&
              selectedResourceBuilding.level}{" "}
            <DoubleArrow /> Level{" "}
            {selectedResourceBuilding && selectedResourceBuilding.level + 1}
          </>
        ) : (
          <>
            Level {currentLevel} <DoubleArrow /> Level {currentLevel + 1}
          </>
        )}
      </h3>
      <h3 className=" py-2 px-4 w-full text-center blueText !font-medium darkGreenBg">
        {title}
      </h3>
    </div>
  );
};
{
}
