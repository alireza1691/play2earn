import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { warriors, warriorsInfo } from "@/lib/data";
import { Slider, SliderValue } from "@nextui-org/react";
import { Span } from "next/dist/trace";
import Image from "next/image";
import React from "react";
import { isArray, isNumber } from "util";



export default function WarriorsSliders() {

  const {ownedLands,inViewLand,chosenLand,setChosenLand} = useUserDataContext()
  const {selectedArmy, setSelectedArmy} = useSelectedWindowContext()

  const updateAmountAtIndex = (index: number, value: number) => {
    setSelectedArmy((prevSelectedArmy) =>
    prevSelectedArmy.map((prevValue, i) => (i === index ? value : prevValue))
  );
  };

  return (
    <>
    {inViewLand && 
    <div className=" mt-auto flex flex-col gap-1 flex-grow md:mt-6 w-full max-w-[17.5rem] h-[30%] max-h-[25rem] px-2 sm:h-[45%] overflow-y-scroll warriorsSlidersBg py-2 border-2 border-gray-300/20 rounded-md">
      {warriorsInfo.map((warrior,key) => (
    <div key={key} className=" flex flex-row relative ">
    <Image
      src={warrior.image}
      alt="warriorCard"
      width={25}
      height={40}
      className=" w-auto  h-[60px] rounded-md darkShadow"
    />
    {/* classNames={{indicator: "bg-[#98DDFB]",track:"bg-gray-800/20 border border-gray-300/30 darkShadow"}}  */}
    {inViewLand && Number(inViewLand.barracksLvl) > key ? (
      <Slider
      color="foreground"
      label={warrior.name}
      step={1}
      // onChange={(value)=>updateAmountAtIndex(key,Array.isArray(value) ? value[0] : value)}
      maxValue={Number(inViewLand.army[key])}
      minValue={0}
      defaultValue={0}
      getValue={(existedAmount) => `${existedAmount} of ${Number(inViewLand.army[key])}`}
      // className="max-w-md "
      onChangeEnd={(value: SliderValue)=> {updateAmountAtIndex(key,Array.isArray(value) ? value[0] : value)}}
     classNames={{
      base:" text-white",
      filler:"-ml-3 bg-[#9BFCD4] rounded-l-full ",
      track:" bg-gray-400/30 darkShadow border border-gray-300/30",
      thumb:" bg-[#9BFCD4]",
      
     }}
     renderThumb={(props) => (
      <div
        {...props}
        className="group p-[2px] top-1/2 bg-gray-200/70 border-small border-default-200 dark:border-gray-300/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
      >
        <span className="transition-transform bg-[#9BFCD4] shadow-small  rounded-full w-5 h-5 block group-data-[dragging=true]:scale-90" />
      </div>
    )}
    />
    ):(<Slider
    isDisabled
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
      base:" text-white",
      filler:"-ml-3 bg-[#9BFCD4] rounded-l-full ",
      track:" bg-gray-400/30 darkShadow border border-gray-300/30",
      thumb:" bg-[#9BFCD4]",
      
     }}
     renderThumb={(props) => (
      <div
        {...props}
        className="group p-[2px] top-1/2 bg-gray-200/70 border-small border-default-200 dark:border-gray-300/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
      >
        <span className="transition-transform bg-[#9BFCD4] shadow-small  rounded-full w-5 h-5 block group-data-[dragging=true]:scale-90" />
      </div>
    )}
    />)}
    
  </div>
      ))}

    </div>
    }
    </>
  );
}
