
"use client";


import { InViewLandType, MintedLand,  } from "@/lib/types";
import { createContext, useContext, useState } from "react";

type ResourceBuildingObj = {
  tokenId: number,
  level: number,
  name: string,
  earnedAmount: number
}

type UserDataContextProviderProps = {
    children: React.ReactNode;
  };

type UserDataContextType = {
  ownedLands: MintedLand[] | null,
  setOwnedLands: React.Dispatch<React.SetStateAction<MintedLand[] | null>>
  inViewLand: InViewLandType | null
  setInViewLand: React.Dispatch<React.SetStateAction<InViewLandType | null>>
  isOwnedLand: boolean
  setIsOwnedLands: React.Dispatch<React.SetStateAction<boolean>>
  farms: ResourceBuildingObj[] | null
  setFarms: React.Dispatch<React.SetStateAction<ResourceBuildingObj[] | null>>
  goldMines: ResourceBuildingObj[] | null
  setGoldMines: React.Dispatch<React.SetStateAction<ResourceBuildingObj[] | null>>
}

const UserDataContext = createContext<UserDataContextType | null>(null)

export default function UserDataContextProvider({children}:UserDataContextProviderProps) {
    const [ownedLands, setOwnedLands] = useState<MintedLand[] | null>(null)
    const [inViewLand, setInViewLand] = useState<InViewLandType | null> (null)
    const [isOwnedLand, setIsOwnedLands] = useState(false);
    const [farms, setFarms] = useState <ResourceBuildingObj[] | null>(null)
        const [goldMines, setGoldMines] = useState<ResourceBuildingObj[] | null>(null)




      return(
        <UserDataContext.Provider value={{ ownedLands, setOwnedLands, inViewLand, setInViewLand, isOwnedLand, setIsOwnedLands,farms ,setFarms, goldMines, setGoldMines}}>
            {children}
        </UserDataContext.Provider>
      )
}

export function useUserDataContext() {
    const context = useContext(UserDataContext)
    if (context === null) {
        throw new Error("useUserDataContext must be used within an useSelectedWindowContext")
    }
    return context
}