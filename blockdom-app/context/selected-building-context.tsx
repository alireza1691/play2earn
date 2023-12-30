"use client";

import { landItems } from "@/lib/data";
import { createContext, useContext, useState } from "react";

type itemType = (typeof landItems)[number];

type SelectedBuildingContextProviderProps = {
  children: React.ReactNode;
};

type SelectedResourceBuildingType = {
  tokenId : number
  level: number
  // earnedAmount: number
  type: "GoldMine" | "Farm"
}

type SelectedBuildingContextType = {
  selectedItem: itemType | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<itemType | null>>;
  activeMode: boolean;
  setActiveMode: React.Dispatch<React.SetStateAction<boolean>>;
  upgradeMode: boolean;
  setUpgradeMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedResourceBuilding: null | SelectedResourceBuildingType
  setSelectedResourceBuilding: React.Dispatch<React.SetStateAction<null | SelectedResourceBuildingType>>;
};

const StatesContext = createContext<SelectedBuildingContextType | null>(null);

export default function SelectedBuildingContextProvider({
  children,
}: SelectedBuildingContextProviderProps) {
  const [selectedItem, setSelectedItem] = useState<itemType | null>(null);
  const [activeMode, setActiveMode] = useState<boolean>(false);
  const [upgradeMode, setUpgradeMode] = useState<boolean>(false);
  const [selectedResourceBuilding, setSelectedResourceBuilding] =
    useState<null | SelectedResourceBuildingType>(null);

  return (
    <StatesContext.Provider
      value={{
        selectedItem,
        setSelectedItem,
        activeMode,
        setActiveMode,
        upgradeMode,
        setUpgradeMode,
        selectedResourceBuilding,
        setSelectedResourceBuilding
      }}
    >
      {children}
    </StatesContext.Provider>
  );
}

export function useSelectedBuildingContext() {
  const context = useContext(StatesContext);
  if (context === null) {
    throw new Error(
      "useSelectedBuildingContext must be used within an useSelectedBuildingContext"
    );
  }
  return context;
}
