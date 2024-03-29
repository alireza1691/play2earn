"use client";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiSwitchVertical } from "react-icons/hi";

import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import { baseBuildAmounts, townHallUnlocks, warriors, warriorsInfo } from "@/lib/data";
import FoodIcon from "@/svg/foodIcon";
import { IoIosArrowDown } from "react-icons/io";
import DoubleArrow from "@/svg/doubleArrow";
import DualProgressBar from "../daulProgressBar";
import CoinIcon from "@/svg/coinIcon";
import ProgressBar from "../progressBar";
import CapacityProgressBar from "../capacityProgressBar";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useUserDataContext } from "@/context/user-data-context";
import TopDuobleArrow from "@/svg/topDuobleArrow";
import { formattedNumber } from "@/lib/utils";
import SmFoodIcon from "@/svg/smFoodIcon";
import SmCoinIcon from "@/svg/smCoinIcon";
import { bmtPInst } from "@/lib/instances";
import { useAddress } from "@thirdweb-dev/react";
import { townAddress } from "@/lib/blockchainData";
import BigNumber from "bignumber.js";
import { BigNumberish } from "ethers";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";

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
    if (selectedItem?.name == "TrainingCamp") {
      return TrainingCampContainer;
    }
    if (selectedItem?.name == "GoldMine" || selectedItem?.name == "Farm") {
      return ResourceContainer;
    }
  };
  const Container = relevantContainer(); // Call the function to get the component

  return (
    <>
      <div className="flex flex-grow">
        {Container && <Container />} {/* Use the component in JSX */}
      </div>
    </>
  );
}

const ResourceContainer = () => {
  const { farms } = useUserDataContext();
  const { upgradeMode, activeMode, selectedResourceBuilding } =
    useSelectedBuildingContext();
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
                <FoodIcon />
                {selectedResourceBuilding.level == 0
                  ? 0
                  : 8 ** selectedResourceBuilding.level}
                <span className=" blueText !font-medium">+ 8</span>
                Food/Day
              </h3>
              <DualProgressBar currentLevel={selectedResourceBuilding.level} />
            </div>
            <div className=" flex flex-col">
              <h3 className=" flex flex-row items-center gap-2 font-medium">
                <FoodIcon />
                {selectedResourceBuilding.level == 0
                  ? 0
                  : 80 ** selectedResourceBuilding.level}
                <span className=" blueText !font-medium">
                  +{" "}
                  {selectedResourceBuilding.level == 0
                    ? 80
                    : 80 ** selectedResourceBuilding.level}
                </span>{" "}
                Food capacity
              </h3>
              <DualProgressBar currentLevel={selectedResourceBuilding.level} />
            </div>
          </div>
          <UpgradeContainer
            goldAmount={
              selectedResourceBuilding.type == "Farm"
                ? baseBuildAmounts.Farm.gold
                : baseBuildAmounts.goldMine.gold
            }
            foodAmount={
              selectedResourceBuilding.type == "Farm"
                ? baseBuildAmounts.Farm.food
                : baseBuildAmounts.goldMine.food
            }
          />
        </>
      )}
      {!upgradeMode && !activeMode && (
        <>
          <h3 className=" font-semibold  flex flex-row  items-center">
            <FoodIcon />{" "}
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

          <h3 className="mt-4 font-semibold  flex flex-row  items-center">
            <FoodIcon />
            {""}
            {selectedResourceBuilding && selectedResourceBuilding.earnedAmount}
          </h3>
          <ProgressBar
            amount={
              (selectedResourceBuilding &&
                (selectedResourceBuilding.earnedAmount * 100) /
                  ((2 ** selectedResourceBuilding.level - 1) * 80)) ||
              0
            }
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
            goldAmount={baseBuildAmounts.barracks.gold}
            foodAmount={baseBuildAmounts.barracks.food}
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
                className="relative  !rounded-md cardBg px-1 pt-1 pb-6 justify-center items-center w-fit ml-auto mr-auto darkShadow"
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
                  } w-[80px] !h-auto rounded-md`}
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
            foodAmount={baseBuildAmounts.trainingCamp.food}
            goldAmount={baseBuildAmounts.trainingCamp.gold}
          />
        </>
      )}
    </div>
  );
};

type ActiveInputType = "Deposit/Withdraw" | "Buy/Sell" | "Transfer";

const TownhallContainer = () => {
  const { upgradeMode, activeMode } = useSelectedBuildingContext();
  const { inViewLand, BMTBalance } = useUserDataContext();
  const {approve, deposit, withdraw,convert} = useBlockchainUtilsContext()
  const [enteredAmount, setEnteredAmount] = useState(0);
  const [isDeposit, setIsDeposit] = useState(true);
  const [isBuy, setIsBuy] = useState(true);
  const [isGoldSelected, setIsGoldSelected] = useState(true);
  const [activeInput, setActiveInput] =
    useState<ActiveInputType>("Buy/Sell");
    const [approvedAmount,setApprovedAmount ] = useState(0)
    const address = useAddress()

    const handleApprove = async () =>{
      const approvedAm = await approve(enteredAmount)
      setApprovedAmount(approvedAm)
    }

    const buttonAction = async() =>{
      if (activeInput == "Deposit/Withdraw" && !isDeposit) {
        withdraw(enteredAmount)
      }
      if (activeInput == "Buy/Sell") {
      convert(enteredAmount, isGoldSelected ? 1 : 0, isBuy)
      }
    }

    const isDisable = () => {

      if (activeInput == "Buy/Sell") {
        if (isBuy && enteredAmount >  Number(formattedNumber(BMTBalance || 0))) {
          return true
        }
        if (!isBuy && isGoldSelected && enteredAmount >  Number(formattedNumber(inViewLand?.goodsBalance[1] || 0))) {
          return true
        }
        if (!isBuy && !isGoldSelected && enteredAmount >  Number(formattedNumber(inViewLand?.goodsBalance[0] || 0))) {
          return true
        }
      }
      if (activeInput == "Deposit/Withdraw") {
        if (!isDeposit && enteredAmount >  Number(formattedNumber(BMTBalance || 0))) {
          return true
        }
      }
      else {
        return false
      }
    }

    useEffect(() => {
      const getData = async () => {
        try {
          if (address) {
            const inst = bmtPInst
            const allowance:BigNumberish = await inst.allowance(address, townAddress)
            console.log("allowance:",formatEther(allowance));
            setApprovedAmount(Number(formatEther(allowance)))
            
          }
        } catch (error) {
          
        }
      }
      getData()
    },[address])

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
              <div className="flex flex-row gap-4 overflow-x-scroll px-2 py-2 bg-black/20 rounded-md  custom-scrollbar">
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
              goldAmount={baseBuildAmounts.townHall.gold}
              foodAmount={baseBuildAmounts.townHall.food}
            />
          </>
        )}
        {!upgradeMode && !activeMode && (
          <>
          
          {/* <div className={`flex flex-col  p-1 rounded-md ${ activeInput == "Deposit/Withdraw"? "border border-[#98fbd7]" : "hover:border hover:border-[#98fbd7] brightness-50"}`}>
              <a onClick={() => setActiveInput("Deposit/Withdraw")} className="blueText mt-3 text-center cursor-pointer darkGreenBg p-2 justify-around">
              Deposit/Withdraw
              </a>
              <div className=" flex flex-row items-center mt-3">
                <input
                  type="number"
                  onChange={(event) =>
                    setEnteredAmount(Number(event.target.value))
                  }
                  className=" bg-black/20 w-full rounded-l-md focus:outline-0 text-[12px] py-1 px-3 border border-[#98fbd7]/40 h-full"
                  placeholder="Enter amount"
                />
                <a
                  onClick={() => setIsDeposit(!isDeposit)}
                  className=" text-[14px] w-[10rem] text-center border h-full border-[#98fbd7]/40 rounded-r-md p-1 cursor-pointer hover:bg-white/10 transition-all flex flex-row items-center gap-2"
                >
                  <HiSwitchVertical />
                  {isDeposit ? "Deposit" : "Withdraw"}
                </a>
              </div>
              <p className=" text-[12px] text-white/70">
                Balance: {BMTBalance && formattedNumber(BMTBalance)}
              </p>
            </div> */}
            <div className={`mt-2 flex flex-col  p-1 rounded-md ${ activeInput == "Buy/Sell" ? "border border-[#98fbd7]" : "hover:border hover:border-[#98fbd7] brightness-50"}`}>
              <a onClick={() => setActiveInput("Buy/Sell")} className="blueText mt-3 text-center cursor-pointer darkGreenBg p-2 justify-around">
                Buy/Sell
              </a>
              <div className=" flex flex-row items-center mt-3">
                <a
                  onClick={() => setIsGoldSelected(!isGoldSelected)}
                  className=" items-center justify-center text-[14px] w-[3rem] text-center border h-full border-[#98fbd7]/40 rounded-l-md p-1 cursor-pointer hover:bg-white/10 transition-all flex flex-row  gap-2"
                >
                  {isGoldSelected ? <SmCoinIcon /> : <SmFoodIcon />}
                </a>
                <input
                  type="number"
                  onChange={(event) =>
                    setEnteredAmount(Number(event.target.value))
                  }
                  className="appearance-none bg-black/20 w-full  focus:outline-0 text-[12px] py-1 px-3 border border-[#98fbd7]/40 h-full"
                  placeholder={enteredAmount.toString()}
                  
                />
                <a
                  onClick={() => setIsBuy(!isBuy)}
                  className=" text-[14px] w-[10rem] text-center border h-full border-[#98fbd7]/40 rounded-r-md p-1 cursor-pointer hover:bg-white/10 transition-all flex flex-row items-center gap-2"
                >
                  <HiSwitchVertical />
                  {isBuy ? "Buy" : "Sell"}
                </a>
            
              </div>
              <p className=" text-[12px] text-white/70">
                {isBuy && `BMT Balance: ${BMTBalance && formattedNumber(BMTBalance)}`}
                {!isBuy && isGoldSelected && `Gold Balance: ${inViewLand && formattedNumber(inViewLand.goodsBalance[1])}`}
                {!isBuy && !isGoldSelected && `Food Balance: ${inViewLand && formattedNumber(inViewLand.goodsBalance[0])}`}

              </p>
            </div>
            <div className="mt-3 ml-auto mr-auto flex flex-row gap-3 ">
              {isDeposit && activeInput == "Deposit/Withdraw" ?
              <>
                <button onClick={() => handleApprove()} disabled={approvedAmount > 0} className="greenButton !py-2 !px-3 !text-[14px]">Approve</button>
                <button onClick={() => deposit(approvedAmount)} disabled={approvedAmount <= 0} className="greenButton !py-2 !px-3 !text-[14px]">Execute</button>
                </>
              :
              <button onClick={() => buttonAction()} disabled={isDisable()} className="greenButton !py-2 !px-3 !text-[14px]">Submit</button>
              }
            </div>
           
          </>
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
            foodAmount={baseBuildAmounts.wall.food}
            goldAmount={baseBuildAmounts.wall.gold}
          />
        </>
      )}
    </div>
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
