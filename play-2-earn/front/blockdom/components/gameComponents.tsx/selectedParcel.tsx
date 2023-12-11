"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { Tooltip, Button } from "@nextui-org/react";
import ParcelsWideMode from "./parcelsWideMode";
import ParcelsMobileMode from "./parcelsMobileMode";

type landSelectorHookProps = {
  setSelectedLand: React.Dispatch<React.SetStateAction<number | null>>;
  setSlideBar: React.Dispatch<React.SetStateAction<boolean>>;
};
type selectedParcelType = {
  x: number;
  y: number;
};

export default function SelectedParcel2({
  setSelectedLand,
  setSlideBar,
}: landSelectorHookProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedParcel, setSelectedParcel] = useState<selectedParcelType>({
    x: 100,
    y: 100,
  });

  useEffect(() => {
    const container = containerRef.current!;

    // Calculate the scroll position to center the content
    const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    const scrollTop = (container.scrollHeight - container.clientHeight) / 2;

    // Scroll the container to the center position
    container.scrollTo(scrollLeft, scrollTop);
  }, []);

  return (
    <>
      <div className="z-20 absolute top-[4.5rem] h-[3rem] w-full greenHeaderGradient items-center flex justify-center ">
        <h3 className="text-[#98FBD7] -z-10">
          {selectedParcel.x}
          {selectedParcel.y}
        </h3>
      </div>
      <div
        ref={containerRef}
        className="w-[100vw] h-[100vh]   overflow-scroll  items-center justify-center object-cover relative"
      >
        <div className=" absolute w-[42rem] h-[42rem] left-[29rem]  top-[29rem] md:h-[40rem] md:w-[40rem] md:top-[30rem] md:left-[800px] 2xl:left-[1140px] 2xl:top-[46rem] 2xl:w-[47rem] 2xl:h-[43rem] ">
          <a
            onClick={() => {
              selectedParcel.y >= 110 &&
                setSelectedParcel((prevState) => ({
                  ...prevState,
                  y: prevState.y - 10,
                }));
            }}
            className={` ${
              selectedParcel.y <= 100
                ? "brightness-50  opacity-50 "
                : "cursor-pointer"
            } invisible md:visible   z-50 md:right-[4rem] md:top-[9.5rem] 2xl:top-[7.5rem] absolute`}
          >
            <Image
              src={"/svg/gameItems/topRightArrow.svg"}
              width={60}
              height={60}
              alt="arrow"
            />
          </a>
          <a
            onClick={() => {
              selectedParcel.x >= 110 &&
                setSelectedParcel((prevState) => ({
                  ...prevState,
                  x: prevState.x - 10,
                }));
            }}
            className={`${
              selectedParcel.x <= 100
                ? "brightness-50  opacity-50"
                : "cursor-pointer"
            } invisible md:visible   z-50 md:left-[3rem] md:top-[10.5rem] 2xl:top-[8rem] absolute`}
          >
            <Image
              src={"/svg/gameItems/topLeftArrow.svg"}
              width={60}
              height={60}
              alt="arrow"
            />
          </a>
          <a
            onClick={() => {
              selectedParcel.y < 190 &&
                setSelectedParcel((prevState) => ({
                  ...prevState,
                  y: prevState.y + 10,
                }));
            }}
            className={`${
              selectedParcel.y >= 190
                ? "brightness-50  opacity-50"
                : "cursor-pointer"
            } invisible md:visible  z-50  md:left-[2.5rem] md:bottom-[9.5rem] absolute`}
          >
            <Image
              src={"/svg/gameItems/bottomLeftArrow.svg"}
              width={65}
              height={65}
              alt="arrow"
            />
          </a>
          <a
            onClick={() => {
              selectedParcel.x < 190 &&
                setSelectedParcel((prevState) => ({
                  ...prevState,
                  x: prevState.x + 10,
                }));
            }}
            className={` ${
              selectedParcel.x >= 190
                ? "brightness-50  opacity-50"
                : "cursor-pointer"
            }  invisible md:visible  z-50 md:right-[4rem] bottom-[11rem] absolute`}
          >
            <Image
              src={"/svg/gameItems/bottomRightArrow.svg"}
              width={60}
              height={60}
              alt="arrow"
            />
          </a>
        </div>

        <ParcelsWideMode
          setSlideBar={setSlideBar}
          setSelectedLand={setSelectedLand}
          setSelectedParcel={setSelectedParcel}
          selectedParcel={selectedParcel}
        />
        <ParcelsMobileMode
          setSlideBar={setSlideBar}
          setSelectedLand={setSelectedLand}
          setSelectedParcel={setSelectedParcel}
          selectedParcel={selectedParcel}
        />
      </div>

    </>
  );
}
