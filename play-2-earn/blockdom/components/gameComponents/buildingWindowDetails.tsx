"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import Image from "next/image";
import React from "react";
import { Progress } from "@nextui-org/react";
import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import { warriors } from "@/lib/data";
import FoodIcon from "@/svg/foodIcon";
import { IoIosArrowDown } from "react-icons/io";
import DoubleArrow from "@/svg/doubleArrow";
import DualProgressBar from "./daulProgressBar";
import CoinIcon from "@/svg/coinIcon";
import ProgressBar from "./progressBar";

export default function BuildingWindowDetails() {
  const { selectedItem, setSelectedItem, upgradeMode } =
    useSelectedBuildingContext();

  const relevantContainer = () => {
    if (selectedItem?.name == "Townhall") {
      return TownhallContainer;
    }
    if (selectedItem?.name == "Wall") {
      return WallContainer;
    }
    if (selectedItem?.name == "Barracks") {
      return BarracksContainer;
    }
    if (selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm") {
      return ResourceContainer;
    }
  };
  const Container = relevantContainer(); // Call the function to get the component

  return (
    <>
      {/* {selectedItem?.name == "Barracks" && (
    <div className="h-[30%] overflow-y-scroll custom-scrollbar warriorsGridBg rounded-md w-[80%] ml-auto mr-auto ">
          
  
    <div className="h-full flex flex-col w-full py-3">
  
        <div className="px-3 h-full ">
          <div className=" flex flex-col h-[20%]">
            <h3 className="gap-2 text-[14px] font-bold flex flex-row items-center">
              {" "}
              <ArmyCapacityIcon /> 100/250 Units{" "}
            </h3>
            <Progress
              color="default"
              aria-label="Loading..."
              value={70}
              classNames={{
                indicator: "!bg-[#98DDFB]",
                track: "bg-gray-800/20 border border-gray-300/30 darkShadow",
              }}
            />
          </div>
          <div className="mt-6 grid grid-cols-3 h-[80%] px-2   gap-3  ">
            {warriors.map((warrior, key) => (
              <div key={key} className={"cardBg w-full "}>
                <Image
                  src={"/images/warriorTest.png"}
                  width={50}
                  height={80}
                  alt="warrior"
                  className="w-full h-auto"
                />
                <p className=" text-[10px] text-center">{warrior}<br></br>100</p>
              
              </div>
            ))}
          </div>
        </div>
        </div>
    </div>
      )}
 */}
      <div className="flex flex-grow">
        {Container && <Container />} {/* Use the component in JSX */}
      </div>
    </>
  );
}

const ResourceContainer = () => {
  const { upgradeMode, activeMode } = useSelectedBuildingContext();
  return (
    <div className=" w-[85%] ml-auto mr-auto flex flex-col mt-4 !text-white">
      {upgradeMode && (
        <>
          <div className=" flex flex-col gap-3">
            <UpgradeHeader currentLevel={1} title="Upgrade trait" />
            <div className=" flex flex-col">
              <h3 className=" flex flex-row items-center gap-2 font-medium">
                <FoodIcon />8<span className=" blueText !font-medium">+ 8</span>
                Food/Day
              </h3>
              <DualProgressBar currentLevel={2} />
            </div>
            <div className=" flex flex-col">
              <h3 className=" flex flex-row items-center gap-2 font-medium">
                <FoodIcon />
                50<span className=" blueText !font-medium">+ 50</span> Food
                capacity
              </h3>
              <DualProgressBar currentLevel={2} />
            </div>
          </div>
          <UpgradeContainer goldAmount={200} foodAmount={100} />
        </>
      )}
      {!upgradeMode && !activeMode && (
        <>
          <h3 className=" font-semibold  flex flex-row  items-center">
            <FoodIcon /> 8/Day
          </h3>
          <ProgressBar amount={16.5} />

          <h3 className="mt-4 font-semibold  flex flex-row  items-center">
            <FoodIcon /> 4 earned
          </h3>
          <ProgressBar amount={50} />
        </>
      )}
    </div>
  );
};
const BarracksContainer = () => {
  const { upgradeMode, activeMode } = useSelectedBuildingContext();
  let barracksLevel = 2;
  return (
    <div className="w-[85%] ml-auto mr-auto mt-4 flex flex-col">
      {!upgradeMode && !activeMode && (
        <>
          <h3 className=" darkGreenBg blueText !font-medium py-2 text-center justify-center">
            Availabe units
          </h3>
          <div className=" grid grid-cols-3 mt-4 gap-y-4 ">
            {warriors.map((warrior, key) => (
              <div key={key} className="relative cardBg py-1 justify-center items-center w-fit ml-auto mr-auto darkShadow">
                {barracksLevel <= key && (
                  <p className=" !leading-4 w-full px-1 z-10 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center  left-1/2 absolute blueText !font-light !text-[12px]">
                    Available at<br></br>{" "}
                    <span className=" font font-semibold">Level {key + 1}</span>
                  </p>
                )}
                <Image
                  className={`${
                    barracksLevel <= key && "brightness-50"
                  } w-[80px] !h-auto`}
                  src={"/images/warriorTest.png"}
                  width={60}
                  height={120}
                  alt="warrior image"
                />
              </div>
            ))}
          </div>
        </>
      )}
      { upgradeMode && (
        <>
        <UpgradeHeader title="New troop" currentLevel={1}/>
        <div className="cardBg w-fit ml-auto mr-auto mt-10 ">
        <Image
                  className={`w-[120px] !h-auto !px-[4px] !pb-[6px] !pt-[2px]`}
                  src={"/images/warriorTest.png"}
                  width={60}
                  height={120}
                  alt="warrior image"
                />
        </div>
        <UpgradeContainer goldAmount={100} foodAmount={100} />
        </>
      )   
      }
    </div>
  );
};

const TownhallContainer = () => {
  return (
    <>
      <p>townhall</p>
    </>
  );
};
const WallContainer = () => {
  return (
    <>
      <p>wall</p>
    </>
  );
};

type UpgradeContainerProps = {
  goldAmount: number;
  foodAmount: number;
};

const UpgradeContainer = ({
  goldAmount,
  foodAmount,
}: UpgradeContainerProps) => {
  return (
    <div className=" flex flex-col mt-auto gap-3 mb-3">
      <h3 className=" py-2 px-4 w-full text-center blueText !font-medium darkGreenBg">
        {" "}
        Required resources
      </h3>
      <div className="flex flex-row gap-4">
        <h3 className="balBg w-[50%] flex flex-row items-center blueText !font-medium gap-3 justify-center py-1">
          <CoinIcon />
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
const UpgradeHeader = ({ currentLevel, title }: UpgradeHeaderProps) => {
  return (
    <div className=" flex flex-col gap-3">
      <h3 className=" flex flex-row items-center gap-6 justify-center">
        Level {currentLevel} <DoubleArrow /> Level {currentLevel + 1}
      </h3>
      <h3 className=" py-2 px-4 w-full text-center blueText !font-medium darkGreenBg">
        {title}
      </h3>
    </div>
  );
};
{
  /* <Progress
            // label="0 per hour"
            value={16.5}
            maxValue={100}
            classNames={{
              base: "max-w-md ",
              track: " progress ",
              indicator: " progressIndicator",
              label: "tracking-wider font-medium text-default-600",
              value: "text-foreground/60 ",
            }}
          /> */
}
