import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { armyCapacity, warriorsInfo } from "@/lib/data";
import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import GoldIcon from "@/svg/goldIcon";
import DamageIcon from "@/svg/damageIcon";
import HpIcon from "@/svg/hpIcon";
import { Input, Slider } from "@nextui-org/react";
import Image from "next/image";
import React, { useState } from "react";
import BuildingWindowButtons from "./buildingWindowButtons";
import BuildingWindowHeader from "./buildingWindowHeader";
import CapacityProgressBar from "../capacityProgressBar";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useUserDataContext } from "@/context/user-data-context";
import { formatUnits } from "ethers/lib/utils";

type InputAmountType = number | null;
type EnteredAmountsType = InputAmountType[];

/** One of a warrior's four figures, on the shared .statChip treatment. */
const StatChip = ({
  icon,
  label,
  value,
  intent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  intent?: "attack" | "hp";
}) => (
  <div className={`statChip ${intent ? `statChip--${intent}` : ""}`}>
    {icon}
    <div className="min-w-0">
      <div className="statChip__label">{label}</div>
      <div className="statChip__value">{value}</div>
    </div>
  </div>
);

export default function SelectedBuildingActive() {
  return (
    <>
      <BarracksActiveComponent />
      <TrainingCampActiveComponent />
    </>
  );
}
const BarracksActiveComponent = () => {
  const { selectedItem, activeMode, setActiveMode } =
    useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();
  const { recruitArmy } = useBlockchainUtilsContext();

  const [enteredAmount, setEnteredAmount] = useState<number[]>([
    0, 0, 0, 0, 0, 0,
  ]);

  const handleEnteredAmount = (amount: number, index: number) => {

    setEnteredAmount((prevAmounts) =>
      prevAmounts.map((value, i) => (i === index ? amount : value))
    );
  };

  type TotalNumbersType = {
    totalArmy: number;
    totalRequiredGold: number;
    totalRequiredFood: number;
    foodBal: number;
    goldBal: number;
  };

  const totalAmounts = (): TotalNumbersType => {
    let totalAmount = 0;
    let totalRequiredGold = 0;
    let totalRequiredFood = 0;
    let foodBal = 0;
    let goldBal = 0;
    if (inViewLand) {
      for (let i = 0; i < enteredAmount.length; i++) {
        totalRequiredGold += enteredAmount[i] * warriorsInfo[i].price;
        totalRequiredFood += enteredAmount[i] * warriorsInfo[i].foodCost;
        totalAmount += enteredAmount[i];
      }
      foodBal = Number(formatUnits(inViewLand.goodsBalance[0]));
      goldBal = Number(formatUnits(inViewLand.goodsBalance[1]));
    }
    return {
      totalArmy: totalAmount,
      totalRequiredGold: totalRequiredGold,
      totalRequiredFood: totalRequiredFood,
      foodBal: foodBal,
      goldBal: goldBal,
    };
  };

  // The cap is the training camp's, not the barracks', and it scales linearly
  // — this raised 50 to a power of the barracks level, so it gated recruiting
  // on a number the contract had never heard of. See armyCapacity in lib/data.
  const capacity = () =>
    inViewLand ? armyCapacity(Number(inViewLand.trainingCampLvl)) : 0;

  const totalArmy = () => {
    let armyAmount = 0;
    if (inViewLand) {
      for (let index = 0; index < inViewLand.army.length; index++) {
        const element = Number(inViewLand.army[index]);
        armyAmount += element;
      }
    }
    return armyAmount;
  };

  return (
    <section
      className={` ${activeMode == false && " !left-[-120rem]"} ${
        selectedItem && selectedItem.name != "Barracks" && "!left-[-120rem]"
      } z-40 barracksActiveBg flex flex-col absolute  w-[95%] left-1/2 -translate-x-1/2 top-[4.3rem]  sm:top-[8rem] h-[80dvh] sm:h-[70dvh] `}
    >
      {/*
        The shared header, as every other building window uses — this one was
        hand-rolled, so it sat at a different height and was the only window
        that did not show the building's level.
      */}
      <BuildingWindowHeader />
      <div className=" flex flex-row sm:justify-evenly flex-shrink-0 justify-center ">
        <div className="w-[80%]  sm:w-[30%] flex flex-col ">
          <div className=" flex flex-row items-center font-semibold !text-white ">
            <ArmyCapacityIcon />
            <h3 className="ml-3"> Capacity:</h3>
            <h3 className="ml-auto">
              <span className="lightBlue">{totalArmy()}</span>/{capacity()}
            </h3>
          </div>
          <CapacityProgressBar amount={(totalArmy() * 100) / capacity()} />
        </div>
        <div className="w-[30%] hidden sm:flex"></div>
      </div>
      <div className="md:pb-3 md:px-2 rounded-[4px] darkShadow md:shadow-none bg-black/20 md:bg-transparent py-2 flex flex-col overflow-y-auto custom-scrollbar  md:grid md:grid-cols-2 gap-4 w-[85%] ml-auto mr-auto flex-grow mt-6 ">
        {warriorsInfo.map((warrior, key) => (
          <div
            key={key}
            className={`flex flex-col gap-1  !rounded-[4px]  relative  ${
              inViewLand &&
              key >= Number(inViewLand?.barracksLvl) &&
              "opacity-50"
            }`}
          >
            {inViewLand && key >= Number(inViewLand.barracksLvl) && (
              <div className="flex  justify-center z-10 absolute  w-full h-full rounded-[4px] backdrop-brightness-75 bg-black/60 ">
                <h3 className=" text-center text-[color:var(--pw-accent)] text-[14px] mt-2">
                  Unlock at <span className=" font-bold">level {key + 1}</span>{" "}
                </h3>
              </div>
            )}
            <div className=" glassBg darkShadow blueText !font-normal text-center py-2 mt-0">
              {warrior.name}
            </div>
            <div className=" flex flex-row relative h-full glassBg">
              <Image
                className="py-1 px-1 rounded-[4px] !h-auto w-[35%]"
                src={warrior.image}
                width={100}
                height={150}
                alt="warrior"
              />
              <div className=" flex flex-col w-full">
                <div className="grid grid-cols-2 gap-2 px-2 py-2">
                  <StatChip
                    intent="attack"
                    icon={<DamageIcon />}
                    label="Attack"
                    value={warrior.attPw}
                  />
                  <StatChip
                    icon={<DamageIcon />}
                    label="Def"
                    value={warrior.defPw}
                  />
                  <StatChip
                    intent="hp"
                    icon={<HpIcon />}
                    label="HP"
                    value={warrior.hp}
                  />
                  <StatChip
                    icon={<GoldIcon size={16} />}
                    label="Price"
                    value={warrior.price}
                  />
                </div>
                <div className=" flex flex-row px-2 gap-1 mt-auto mb-3 ">
                  <input
                    type="number"
                    min={0}
                    onChange={(event) =>
                      handleEnteredAmount(Number(event.target.value), key)
                    }
                    className="inputBg w-full text-[12px] py-[6px] px-3 placeholder:text-[color:var(--pw-muted)]"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Same footer shape as buildingWindowButtons — this one centred two
          fixed 12.5rem buttons, which matched nothing and overflowed narrow
          screens. */}
      <div className="flex justify-between gap-2 p-2 flex-shrink-0 mt-auto">
        <button
          onClick={() => setActiveMode(false)}
          className="redButton !w-1/2"
        >
          Back
        </button>
        <button
          disabled={
            totalAmounts().foodBal <= totalAmounts().totalRequiredFood ||
            totalAmounts().goldBal <= totalAmounts().totalRequiredGold || 
            totalAmounts().totalArmy == 0 || 
            totalAmounts().totalArmy > capacity() - totalArmy()
          }
          onClick={() => {
            enteredAmount && recruitArmy(enteredAmount);
          }}
          className="greenButton !w-1/2"
        >
          Confirm
        </button>
      </div>
    </section>
  );
};

const TrainingCampActiveComponent = () => {
  const { selectedItem, activeMode, setActiveMode } =
    useSelectedBuildingContext();

  return (
    <section
      className={`${activeMode == false && "!-left-[50rem]"} ${
        selectedItem && selectedItem.name != "TrainingCamp" && "!-left-[50rem]"
      } transition-all !flex-shrink-0 flex flex-col buildingWindow`}
    >
      <BuildingWindowHeader />
      <div className=" w-[80%] ml-auto mr-auto flex flex-col flex-shrink">
        <div className="  flex flex-row items-center font-semibold !text-white ">
          <ArmyCapacityIcon />
          <h3 className="ml-3"> Capacity:</h3>
          <h3 className="ml-auto">
            <span className="lightBlue">40</span>/100{" "}
          </h3>
        </div>
        <CapacityProgressBar amount={50} />
      </div>
      <div className=" flex flex-grow flex-col w-4/5 ml-auto mr-auto mt-4 gap-3 overflow-scroll sm:overflow-auto bg-black/10 sm:bg-transparent  px-1 py-1 rounded-[4px]">
        {warriorsInfo.map((warrior, key) => (
          <div key={key} className="flex flex-row h-full">
            <Image
              className="glassBg px-1 py-1 h-full w-auto"
              src={warrior.image}
              height={100}
              width={60}
              alt="warrior"
            />
            <Slider
              color="foreground"
              label={warrior.name}
              step={1}
              maxValue={100}
              minValue={0}
              defaultValue={0}
              // getValue={(warrior) => `${warrior} of 100`}
              // className="max-w-md "
              onChangeEnd={() => {
                ("");
              }}
              classNames={{
                base: " l text-white",
                filler: "-ml-3 bg-[#9BFCD4] rounded-l-full ",
                track: " bg-gray-400/30 darkShadow border border-gray-300/30  ",
                thumb: " bg-[#9BFCD4]",
                label: "ml-3",
              }}
            />
          </div>
        ))}
      </div>
      <h3 className=" w-[80%] ml-auto mr-auto !leading-6  mt-4 mb-2 darkGreenBg blueText !font-medium py-2 text-center justify-center">
        Discharge troops
        <br></br> <p className=" text-[12px]">Train new troops in barracks</p>
      </h3>
      <BuildingWindowButtons />
    </section>
  );
};
