
"use client";


import { InViewLandType, MintedLand,  } from "@/lib/types";
import { createContext, useContext, useState } from "react";


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

}

const UserDataContext = createContext<UserDataContextType | null>(null)

export default function UserDataContextProvider({children}:UserDataContextProviderProps) {
    const [ownedLands, setOwnedLands] = useState<MintedLand[] | null>(null)
    const [inViewLand, setInViewLand] = useState<InViewLandType | null> (null)
    const [isOwnedLand, setIsOwnedLands] = useState(false);




      return(
        <UserDataContext.Provider value={{ ownedLands, setOwnedLands, inViewLand, setInViewLand, isOwnedLand, setIsOwnedLands}}>
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