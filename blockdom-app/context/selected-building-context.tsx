"use client";

import { landItems } from "@/lib/data";
import { createContext, useCallback, useContext, useState } from "react";

type itemType = (typeof landItems)[number];

type SelectedBuildingContextProviderProps = {
  children: React.ReactNode;
};

type SelectedResourceBuildingType = {
  tokenId : number
  level: number
  earnedAmount: number
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

  /**
   * Opening a building always starts from its normal panel.
   *
   * `upgradeMode` and `activeMode` used to be cleared only by the window's own
   * close button, so putting one building into upgrade mode and then clicking a
   * different one left the new building showing the upgrade panel — a state it
   * was never put into. Clearing them here means every entry point gets it
   * right, rather than each of the dozen call sites having to remember.
   */
  const selectItem = useCallback<
    React.Dispatch<React.SetStateAction<itemType | null>>
  >((value) => {
    setUpgradeMode(false);
    setActiveMode(false);
    setSelectedItem(value);
  }, []);

  return (
    <StatesContext.Provider
      value={{
        selectedItem,
        setSelectedItem: selectItem,
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
