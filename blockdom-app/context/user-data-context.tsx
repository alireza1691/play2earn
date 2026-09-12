"use client";

import {
  InViewLandType,
  MintedLand,
  MintedResourceBuildingType,
} from "@/lib/types";
import React, { createContext, useCallback, useContext, useState } from "react";

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
  plotBalance: number | null
  setPlotBalance : React.Dispatch<React.SetStateAction<number | null >>
  landRefresh: LandRefresh
  refreshLand: (options?: { blocking?: boolean }) => void
};

/**
 * A request to re-read the selected land from chain.
 *
 * `id` only ever goes up, so the reader can tell a fresh request from one it
 * has already served without anyone having to reset a flag.
 *
 * `blocking` decides whether the player waits behind the full-screen spinner.
 * A first load or a land switch has nothing on screen worth keeping, so it
 * blocks. A refresh after the player's own transaction lands on a screen that
 * is already populated and correct, so it stays silent — the old code blocked
 * for both, which is why every confirmed transaction made the whole game
 * blank out and re-appear.
 */
export type LandRefresh = { id: number; blocking: boolean };

const UserDataContext = createContext<UserDataContextType | null>(null);

export default function UserDataContextProvider({
  children,
}: UserDataContextProviderProps) {
  const [ownedLands, setOwnedLands] = useState<MintedLand[] | null>(null);
  const [plotBalance, setPlotBalance] = useState<null | number>(null)
  const [inViewLand, setInViewLand] = useState<InViewLandType | null>(null);
  const [chosenLand,setChosenLand] = useState<MintedLand | null>(null)
  const [buildedResBuildings, setBuildedResBuildings] =
    useState<BuildedResBuildingsType | null>(null);
  const [farms, setFarms] = useState<ResourceBuildingObj[] | null>(null);
  const [goldMines, setGoldMines] = useState<ResourceBuildingObj[] | null>(
    null
  );
  const [army, setArmy] = useState<number | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState <boolean>(true)
  const [landRefresh, setLandRefresh] = useState<LandRefresh>({ id: 0, blocking: false })

  const refreshLand = useCallback(
    ({ blocking = false }: { blocking?: boolean } = {}) =>
      setLandRefresh((current) => ({ id: current.id + 1, blocking })),
    []
  )

  return (
    <UserDataContext.Provider
      value={{
        ownedLands,
        setOwnedLands,
        inViewLand,
        setInViewLand,
        landRefresh,
        refreshLand,
        farms,
        setFarms,
        goldMines,
        setGoldMines,
        buildedResBuildings,
        setBuildedResBuildings,
        chosenLand,setChosenLand,army,setArmy,
        isUserDataLoading,setIsUserDataLoading,plotBalance,setPlotBalance
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
