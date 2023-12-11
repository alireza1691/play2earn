
import ErrorBoundary from "@/components/ErrorBoundary";
import SelectedBuilding from "@/components/gameComponents.tsx/selectedBuilding";
import Town from "@/components/gameComponents.tsx/town";
import { useSelectedBuildingContext } from "@/context/selected-building-context";
import Image from "next/image";
import React from "react";

export default function MyLand() {

  return (
    <>
    <ErrorBoundary fallback={"myland page occurs an error"}>
      <Image
        className=" absolute w-screen h-screen"
        src={"/testBg.png"}
        width={1024}
        height={720}
        alt="bg"
      />
      <Town />
      
      <div> MyLand</div>
      <SelectedBuilding />
      </ErrorBoundary>
    </>
  );
}
