import { useSelectedBuildingContext } from "@/context/selected-building-context";
import { warriors } from "@/lib/data";
import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import CloseIcon from "@/svg/closeIcon";
import CoinIcon from "@/svg/coinIcon";
import DamageIcon from "@/svg/damageIcon";
import HpIcon from "@/svg/hpIcon";
import { Slider } from "@nextui-org/react";
import Image from "next/image";
import React from "react";
import BuildingWindowButtons from "./buildingWindowButtons";
import BuildingWindowHeader from "./buildingWindowHeader";
import CapacityProgressBar from "../capacityProgressBar";

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

  return (
    <section
      className={` ${activeMode == false && " !top-[100rem]"} ${
        selectedItem && selectedItem.name != "Barracks" && "!top-[100rem]"
      } barracksActiveBg flex flex-col absolute h-[85%] w-[95%] left-1/2 -translate-x-1/2 z-10 top-[4.5rem]`}
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
      <div className=" flex flex-row justify-evenly flex-shrink-0 ">
        <div className="w-[30%] flex flex-col">
          <div className=" flex flex-row items-center font-semibold !text-white ">
            <ArmyCapacityIcon />
            <h3 className="ml-3"> Capacity:</h3>
            <h3 className="ml-auto">
              <span className="lightBlue">40</span>/100{" "}
            </h3>
          </div>
          <CapacityProgressBar amount={50} />
        </div>
        <div className="w-[30%]"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-[80%] ml-auto mr-auto flex-grow pt-8">
        {warriors.map((warrior, key) => (
          <div key={key} className=" flex flex-col gap-1  !rounded-lg">
            <div className=" glassBg darkShadow blueText !font-normal text-center py-2 ">
              {warrior}
            </div>
            <div className=" flex flex-row relative h-full glassBg">
              <Image
                className="py-1 px-1 rounded-lg !h-[100%] w-auto"
                src={"/images/warriorTest.png"}
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
                      <a>100</a>
                    </p>
                  </div>
                  <div className="redItemHolder flex !w-[45%] px-2">
                    <DamageIcon />
                    <p className=" text-[12px] w-full">
                      Def<br></br>
                      <a>80</a>
                    </p>
                  </div>
                </div>
                <div className=" flex flex-row justify-around  ">
                  <div className="lightGreenItemHolder flex !w-[45%] px-2 ">
                    <HpIcon />
                    <p className=" text-[12px] w-full">
                      Hp<br></br>
                      <a>200</a>
                    </p>
                  </div>
                  <div className="redItemHolder flex !w-[45%] px-2">
                    <CoinIcon />{" "}
                    <p className=" text-[12px] w-full">
                      Price<br></br>
                      <a>100</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className=" flex-shrink flex flex-row justify-center gap-3 mb-2 mt-4">
        <button
          onClick={() => setActiveMode(false)}
          className="!w-[12.5rem] redButton"
        >
          Back
        </button>
        <button className="!w-[12.5rem] greenButton">Confirm</button>
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
      <div className=" flex flex-grow flex-col w-4/5 ml-auto mr-auto mt-4 gap-3">
        {warriors.map((warrior, key) => (
          <div key={key} className="flex flex-row h-full">
            <Image
              className="glassBg px-1 py-1 h-full w-auto"
              src={"/images/warriorTest.png"}
              height={100}
              width={60}
              alt="warrior"
            />
             <Slider
      color="foreground"
      label={warrior}
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
      base:" l text-white",
      filler:"-ml-3 bg-[#9BFCD4] rounded-l-full ",
      track:" bg-gray-400/30 darkShadow border border-gray-300/30  ",
      thumb:" bg-[#9BFCD4]",
      label: "ml-3"
      
     }}/>
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