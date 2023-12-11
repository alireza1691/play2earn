import { Slider } from "@nextui-org/react";
import Image from "next/image";
import React from "react";

export default function WarriorsSliders() {
  return (
    <div className=" flex flex-col mt-6 w-[20rem]">
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
          getValue={(warrior) => `${warrior} of 100 warriors`}
          className="max-w-md "
          onChangeEnd={() => {
            ("");
          }}
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
          getValue={(warrior) => `${warrior} of 100 warriors`}

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
          getValue={(warrior) => `${warrior} of 100 warriors`}

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
          getValue={(warrior) => `${warrior} of 100 warriors`}

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
          getValue={(warrior) => `${warrior} of 100 warriors`}

          onChangeEnd={() => {
            ("");
          }}
          isDisabled
        />
      </div>
    </div>
  );
}
