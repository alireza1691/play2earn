"use client";
import React, { useEffect, useState, useRef } from "react";

import Map from "./map";
import { useMapContext } from "@/context/map-context";
import ParcelSwitchArrows from "./parcelSwitchArrows";
import Parcels from "./parcels";
import ExploreStats from "./exploreStats";
import ParcelRangeHeader from "./parcelRangeHeader";



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
      {/*
        Replaces the green header that used to sit here just to print the open
        parcel's coordinates — that is the last cell of this strip now, next to
        the supply, the live mint price and how many lands the wallet holds.
      */}
      <ExploreStats />
      <ParcelRangeHeader />

      <div
        ref={containerRef}
        className="w-[100vw] h-[100vh]   overflow-scroll custom-scrollbar  items-center justify-center object-cover  relative"
      >
        <Map />
        <ParcelSwitchArrows />

        <Parcels />
      </div>
    </>
  );
}
