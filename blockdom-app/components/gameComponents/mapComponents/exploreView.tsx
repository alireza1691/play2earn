"use client";
import React, { useEffect, useState, useRef } from "react";

import Map from "./map";
import { useMapContext } from "@/context/map-context";
import ParcelSwitchArrows from "./parcelSwitchArrows";
import Parcels from "./parcels";



export default function ExploreView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedParcel, setSelectedParcel } = useMapContext();


  useEffect(() => {
    const container = containerRef.current!;

    // Calculate the scroll position to center the content
    const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    const scrollTop = (container.scrollHeight - container.clientHeight) / 2;

    // Scroll the container to the center position
    container.scrollTo(scrollLeft, scrollTop);
  }, [selectedParcel]);

  return (
    <>
      {selectedParcel && (
        <>
          {/* <MapHandler setIsParcelSelected={setIsParcelSelected} /> */}
          <div className="z-50 sm:z-20 absolute top-[4.5rem] h-[3rem] w-full greenHeaderGradient items-center flex justify-center ">
            <h3 className="text-[#98FBD7] -z-10">
              {selectedParcel.x}-{selectedParcel.y}
            </h3>
          </div>
        </>
      )}

      <div
        ref={containerRef}
        className="w-[100vw] h-[100vh]   overflow-scroll  items-center justify-center object-cover  relative"
      >
        <Map />
        <ParcelSwitchArrows />

        <Parcels />
      </div>
    </>
  );
}
