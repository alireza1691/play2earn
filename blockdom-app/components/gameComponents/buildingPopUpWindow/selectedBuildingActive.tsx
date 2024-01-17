import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { baseTrainingCampCapacity, warriors, warriorsInfo } from "@/lib/data";
import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import CloseIcon from "@/svg/closeIcon";
import CoinIcon from "@/svg/coinIcon";
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

type InputAmountType = number|null
type EnteredAmountsType = InputAmountType[]

export default function SelectedBuildingActive() {
  return (
    <>
      <BarracksActiveComponent />
      <TrainingCampActiveComponent />
    </>
  );
}
const BarracksActiveComponent = () => {
  const { selectedItem, setSelectedItem, activeMode, setActiveMode } =
    useSelectedBuildingContext();
  const { inViewLand } = useUserDataContext();
  const { recruitArmy } = useBlockchainUtilsContext();

  const [enteredAmount, setEnteredAmount] = useState<EnteredAmountsType>([null,null,null,null,null,null]);
  const [error,setError] = useState<string | null>(null)
  const [isValidAmount,setIsValidAmount] = useState<boolean | null>(null)

  const updateAmountAtIndex = (index: number, value: number) => {
    setEnteredAmount((prevAmounts) =>
      prevAmounts.map((amount, i) => (i === index ? value : amount))
    );
  };
  const handleEnteredAmount = (amount: number ,price: number, foodCost: number, index:number) => {
    // setEnteredAmount(...enteredAmount, enteredAmount[index] = amount)
    updateAmountAtIndex(index,amount)
    if (!inViewLand || !amount) {
      setIsValidAmount(false) ;
    }
    if (inViewLand) {
      const totalRequiredGold = price * amount
      const totalRequiredFood = foodCost * amount;
      const foodBalance = Number(formatUnits(inViewLand.goodsBalance[0]));
      const goldBalance = Number(formatUnits(inViewLand.goodsBalance[1]));

    
      if (foodBalance < totalRequiredFood) {
        setError("Insufficient food");
        setIsValidAmount(false) ;
      }
      if (foodBalance >= totalRequiredFood ) {
        setIsValidAmount(true) ;
      }
    
      if (goldBalance < totalRequiredGold) {
        console.log("Insufficient gold");
        setError("Insufficient gold");
        setIsValidAmount(false) ;
      }
      if (goldBalance >= totalRequiredGold) {
        setIsValidAmount(true) ;
      }
    
      if (capacity() < amount) {
        console.log("Amount is higher than remaining capacity");
        setError("Amount is higher than remaining capacity");
        setIsValidAmount(false) ;
      }
      if (amount == 0) {
        setError(null)
        setIsValidAmount(false) ;
      }
    }


   
    }

    const capacity = () => {
      let cap = 0
      if (inViewLand) {
       cap =  2**(Number(inViewLand.barracksLvl) - 1) * baseTrainingCampCapacity
      }
return cap
    }

    const totalArmy= () => {
      let armyAmount= 0
      if (inViewLand){
    
        for (let index = 0; index < inViewLand.army.length; index++) {
          const element = Number(inViewLand.army[index]);
          armyAmount += element
        }
      }
      return armyAmount
    }
  


  return (
    <section
      className={` ${activeMode == false && " !left-[-120rem]"} ${
        selectedItem && selectedItem.name != "Barracks" && "!left-[-120rem]"
      } z-30 barracksActiveBg flex flex-col absolute  w-[95%] left-1/2 -translate-x-1/2  top-[4.43rem] h-[80.5%] sm:h-[80vh]`}
    >
      <div className=" flex flex-row justify-between py-2 px-3 !text-white items-center flex-shrink-0">
        <h3>Barracks</h3>
        <a
          className="closeIcon"
          onClick={() => {
            setActiveMode(false), setSelectedItem(null);
          }}
        >
          <CloseIcon />
        </a>
      </div>
      <div className=" flex flex-row sm:justify-evenly flex-shrink-0 justify-center ">
        <div className="w-[80%]  sm:w-[30%] flex flex-col ">
          <div className=" flex flex-row items-center font-semibold !text-white ">
            <ArmyCapacityIcon />
            <h3 className="ml-3"> Capacity:</h3>
            <h3 className="ml-auto">
              <span className="lightBlue">{totalArmy()}</span>/{capacity()}
            </h3>
          </div>
          <CapacityProgressBar amount={totalArmy()*100 / capacity()} />
        </div>
        <div className="w-[30%] hidden sm:flex"></div>
      </div>
      <div className="md:pb-3 md:px-2 rounded-md darkShadow md:shadow-none bg-black/20 md:bg-transparent py-2 flex flex-col overflow-y-auto custom-scrollbar  md:grid md:grid-cols-2 gap-4 w-[85%] ml-auto mr-auto flex-grow mt-6 ">
        {warriorsInfo.map((warrior, key) => (
          <div
            key={key}
            className={`flex flex-col gap-1  !rounded-lg  relative  ${
              inViewLand && key >= Number(inViewLand?.barracksLvl) && "opacity-50"
            }`}
          >
            { inViewLand && key >= Number(inViewLand.barracksLvl) && (
              <div className="flex  justify-center z-10 absolute  w-full h-full rounded-md backdrop-brightness-75 bg-black/60 ">
                <h3 className=" text-center text-[#98FBD7] text-[14px] mt-2">
                  Unlock at <span className=" font-bold">level {key + 1}</span>{" "}
                </h3>
              </div>
            )}
            <div className=" glassBg darkShadow blueText !font-normal text-center py-2 mt-0">
              {warrior.name}
            </div>
            <div className=" flex flex-row relative h-full glassBg">
              <Image
                className="py-1 px-1 rounded-lg !h-auto w-[35%]"
                src={warrior.image}
                width={100}
                height={150}
                alt="warrior"
              />
              <div className=" flex flex-col w-full">
                <div className=" flex flex-row justify-around py-2 ">
                  <div className="redItemHolder flex !w-[45%] px-2">
                    <DamageIcon />{" "}
                    <p className=" text-[12px] w-full">
                      Attack<br></br>
                      <a>{warrior.attPw}</a>
                    </p>
                  </div>
                  <div className="redItemHolder flex !w-[45%] px-2">
                    <DamageIcon />
                    <p className=" text-[12px] w-full">
                      Def<br></br>
                      <a>{warrior.defPw}</a>
                    </p>
                  </div>
                </div>
                <div className=" flex flex-row justify-around  mb-2">
                  <div className="lightGreenItemHolder flex !w-[45%] px-2 ">
                    <HpIcon />
                    <p className=" text-[12px] w-full">
                      Hp<br></br>
                      <a>{warrior.hp}</a>
                    </p>
                  </div>
                  <div className="redItemHolder flex !w-[45%] px-2 ">
                    <CoinIcon />{" "}
                    <p className=" text-[12px] w-full">
                      Price<br></br>
                      <a>{warrior.price}</a>
                    </p>
                  </div>
                </div>
                <div className=" flex flex-row px-2 gap-1">
                  <input
                    type="number"
                    onChange={(event) => handleEnteredAmount(Number(event.target.value),warrior.price,warrior.foodCost,key)}
                    className=" bg-black/20 w-full rounded-md focus:outline-0 text-[12px] py-1 px-3 border border-[#98fbd7]/40"
                    placeholder="Enter amount"
                  />
                  {isValidAmount && isValidAmount ==true? (
                    <button
                      onClick={() => {
                        enteredAmount[key] != null && recruitArmy(key, enteredAmount[key] || 0);
                      }}
                      className="greenButton !rounded-md !text-[12px] !py-1 px-2"
                    >
                      Recruit
                    </button>
                  ) : (
                    <button
                      disabled
                      className="greenButton !rounded-md !text-[12px] !py-1 px-2"
                    >
                      Recruit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className=" flex-shrink flex flex-row justify-center gap-3 mb-2 mt-4 ">
        <button
          onClick={() => setActiveMode(false)}
          className="!w-[12.5rem] redButton"
        >
          Back
        </button>
        {/* <button className="!w-[12.5rem] greenButton">Confirm</button> */}
      </div>
    </section>
  );
};

const TrainingCampActiveComponent = () => {
  const { selectedItem, setSelectedItem, activeMode, setActiveMode } =
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
      <div className=" flex flex-grow flex-col w-4/5 ml-auto mr-auto mt-4 gap-3 overflow-scroll sm:overflow-auto bg-black/10 sm:bg-transparent  px-1 py-1 rounded-md">
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
