
"use client";


import { landsPInst } from "@/lib/instances";
import { MintedLand, SelectedLandType, SelectedParcelType } from "@/lib/types";
import { useAddress } from "@thirdweb-dev/react";
import { createContext, useContext, useEffect, useState } from "react";


type UserDataContextProviderProps = {
    children: React.ReactNode;
  };

type UserDataContextType = {
  ownedLands: MintedLand[] | null,
  setOwnedLands: React.Dispatch<React.SetStateAction<MintedLand[] | null>>

}

const UserDataContext = createContext<UserDataContextType | null>(null)

export default function UserDataContextProvider({children}:UserDataContextProviderProps) {
    const [ownedLands, setOwnedLands] = useState<MintedLand[] | null>(null)




      return(
        <UserDataContext.Provider value={{ ownedLands, setOwnedLands}}>
            {children}
        </UserDataContext.Provider>
      )
}

export function useUserDataContext() {
    const context = useContext(UserDataContext)
    if (context === null) {
        throw new Error("useSelectedWindowContext must be used within an useSelectedWindowContext")
    }
    return context
}