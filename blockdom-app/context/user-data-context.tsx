"use client";

import {
  InViewLandType,
  MintedLand,
  MintedResourceBuildingType,
} from "@/lib/types";
import React, { createContext, useContext, useState } from "react";

type ResourceBuildingObj = {
  tokenId: number;
  level: number;
  name: string;
  earnedAmount: number;
};

type UserDataContextProviderProps = {
  children: React.ReactNode;
};

type BuildedResBuildingsType = {
  goldMines: MintedResourceBuildingType[];
  farms: MintedResourceBuildingType[];
};

type UserDataContextType = {
  ownedLands: MintedLand[] | null;
  setOwnedLands: React.Dispatch<React.SetStateAction<MintedLand[] | null>>;
  inViewLand: InViewLandType | null;
  setInViewLand: React.Dispatch<React.SetStateAction<InViewLandType | null>>;
  // isOwnedLand: boolean;
  // setIsOwnedLand: React.Dispatch<React.SetStateAction<boolean>>;
  farms: ResourceBuildingObj[] | null;
  setFarms: React.Dispatch<React.SetStateAction<ResourceBuildingObj[] | null>>;
  goldMines: ResourceBuildingObj[] | null;
  setGoldMines: React.Dispatch<
    React.SetStateAction<ResourceBuildingObj[] | null>
  >;
  buildedResBuildings: BuildedResBuildingsType | null;
  setBuildedResBuildings: React.Dispatch<
    React.SetStateAction<BuildedResBuildingsType | null>
  >;
  chosenLand: MintedLand | null
  setChosenLand:  React.Dispatch<
  React.SetStateAction<MintedLand | null>>
  army: number | null 
  setArmy: React.Dispatch<React.SetStateAction<number|null>>
  isUserDataLoading: boolean
  setIsUserDataLoading: React.Dispatch<React.SetStateAction<boolean>>
};

const UserDataContext = createContext<UserDataContextType | null>(null);

export default function UserDataContextProvider({
  children,
}: UserDataContextProviderProps) {
  const [ownedLands, setOwnedLands] = useState<MintedLand[] | null>(null);
  const [inViewLand, setInViewLand] = useState<InViewLandType | null>(null);
  const [chosenLand,setChosenLand] = useState<MintedLand | null>(null)
  // const [isOwnedLand, setIsOwnedLand] = useState(false);
  const [buildedResBuildings, setBuildedResBuildings] =
    useState<BuildedResBuildingsType | null>(null);
  const [farms, setFarms] = useState<ResourceBuildingObj[] | null>(null);
  const [goldMines, setGoldMines] = useState<ResourceBuildingObj[] | null>(
    null
  );
  const [army, setArmy] = useState<number | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState <boolean>(true)

  return (
    <UserDataContext.Provider
      value={{
        ownedLands,
        setOwnedLands,
        inViewLand,
        setInViewLand,
        // isOwnedLand,
        // setIsOwnedLand,
        farms,
        setFarms,
        goldMines,
        setGoldMines,
        buildedResBuildings,
        setBuildedResBuildings,
        chosenLand,setChosenLand,army,setArmy,
        isUserDataLoading,setIsUserDataLoading
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserDataContext() {
  const context = useContext(UserDataContext);
  if (context === null) {
    throw new Error(
      "useUserDataContext must be used within an useUserDataContext"
    );
  }
  return context;
}
