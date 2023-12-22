"use client";
import { inViewParcels, parcelLands, separatedCoordinate } from "@/lib/utils";
import React from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { parcelsViewHookProps } from "@/lib/types";
import { useSelectedWindowContext } from "@/context/selected-window-context";

export default function ParcelsMobileScreen({
  setSelectedLand,
  setSlideBar,
  selectedParcel,
  isParcelSelected,
}: parcelsViewHookProps) {
  const { setSelectedWindowComponent } =
    useSelectedWindowContext();

  return (
    <>
      {/* {isParcelSelected && (
     
      )} */}
    </>
  );
}
