"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import ParcelsWideScreen from "./parcelsWideScreen";
import ParcelsMobileScreen from "./parcelsMobileScreen"
import ParcelSwitchArrows from "./parcelSwitchArrows";
import { selectedParcelType } from "@/lib/types";



type landSelectorHookProps = {
  setSelectedLand: React.Dispatch<React.SetStateAction<number | null>>;
  setSlideBar: React.Dispatch<React.SetStateAction<boolean>>;
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
       <ParcelSwitchArrows selectedParcel={selectedParcel} setSelectedParcel={setSelectedParcel}/>

        <ParcelsWideScreen
          setSlideBar={setSlideBar}
          setSelectedLand={setSelectedLand}
          setSelectedParcel={setSelectedParcel}
          selectedParcel={selectedParcel}
        />
        <ParcelsMobileScreen
          setSlideBar={setSlideBar}
          setSelectedLand={setSelectedLand}
          setSelectedParcel={setSelectedParcel}
          selectedParcel={selectedParcel}
        />
      </div>

    </>
  );
}
