import { warriors } from "@/lib/data";
import { Slider } from "@nextui-org/react";
import Image from "next/image";
import React from "react";



export default function WarriorsSliders() {
  return (
    <div className=" flex flex-col mt-2 md:mt-6 w-full px-2 h-[45%] overflow-y-scroll warriorsSlidersBg py-2 border-2 border-gray-300/20 rounded-md">
      {warriors.map((warrior,key) => (
    <div key={key} className=" flex flex-row relative ">
    <Image
      src={"/cards/warriorMiniCard.png"}
      alt="warriorCard"
      width={25}
      height={40}
      className=" w-auto  h-[60px] "
    />
    {/* classNames={{indicator: "bg-[#98DDFB]",track:"bg-gray-800/20 border border-gray-300/30 darkShadow"}}  */}
    <Slider
      color="foreground"
      label={warrior}
      step={1}
      maxValue={100}
      minValue={0}
      defaultValue={0}
      // getValue={(warrior) => `${warrior} of 100`}
      className="max-w-md "
      onChangeEnd={() => {
        ("");
      }}
     
    />
  </div>
      ))}
{/*   
      <div className=" flex flex-row relative">
        <Image
          src={"/cards/warriorMiniCard.png"}
          alt="warriorCard"
          width={50}
          height={80}
        />
        <Slider
          color="foreground"
          label="Spearman"
          step={1}
          maxValue={100}
          minValue={0}
          defaultValue={0}
          className="max-w-md "
          // getValue={(warrior) => `${warrior} of 100`}

          onChangeEnd={() => {
            ("");
          }}
        />
      </div>{" "}
      <div className=" flex flex-row relative">
        <Image
          src={"/cards/warriorMiniCard.png"}
          alt="warriorCard"
          width={50}
          height={80}
        />
        <Slider
          color="foreground"
          label="Spearman"
          step={1}
          maxValue={100}
          minValue={0}
          defaultValue={0}
          className="max-w-md "
          // getValue={(warrior) => `${warrior} of 100`}

          onChangeEnd={() => {
            ("");
          }}
          isDisabled
        />
      </div>
      <div className=" flex flex-row relative">
        <Image
          src={"/cards/warriorMiniCard.png"}
          alt="warriorCard"
          width={50}
          height={80}
        />
        <Slider
          color="foreground"
          label="Spearman"
          step={1}
          maxValue={100}
          minValue={0}
          defaultValue={0}
          className="max-w-md "
          // getValue={(warrior) => `${warrior} of 100`}

          onChangeEnd={() => {
            ("");
          }}
          isDisabled
        />
      </div>
      <div className=" flex flex-row relative">
        <Image
          src={"/cards/warriorMiniCard.png"}
          alt="warriorCard"
          width={50}
          height={80}
        />
        <Slider
          color="foreground"
          label="Spearman"
          step={1}
          maxValue={100}
          minValue={0}
          defaultValue={0}
          className="max-w-md "
          // getValue={(warrior) => `${warrior} of 100`}

          onChangeEnd={() => {
            ("");
          }}
          isDisabled
        />
      </div> */}
    </div>
  );
}
