import Navbar from "@/components/navbar";
import FaucetBar from "@/components/faucetBar";
import ThemeContextProvider from "@/context/theme-context";
import { ThirdwebProvider } from "../components/ThirdwebProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ActiveSectionContextProvider from "@/context/active-section-context";
import SelectedWindowContextProvider from "@/context/selected-window-context";
import SelectedBuildingContextProvider from "@/context/selected-building-context";
import { ApiDataProvider } from "@/context/api-data-context";
import MapContextProvider from "@/context/map-context";
import UserDataContextProvider from "@/context/user-data-context";
import BlockchainStateContextProvider from "@/context/blockchain-state-context";
import BlockchainUtilsContextProvider from "@/context/blockchain-utils-context";
import BottomBar from "@/components/gameComponents/bottomBar";
import GlobalErrorBoundary from "@/components/errorBoundary";
import PopUpState from "@/components/popUpState";
import BalanceContainer from "@/components/gameComponents/balanceContainer";
import ArmyOverview from "@/components/gameComponents/armyOverview";
import TokenActionComp from "@/components/gameComponents/tokenActionComp";
import LandPicker from "@/components/gameComponents/landPicker";
import SwapComp from "@/components/gameComponents/swapComp";
import GoodsComp from "@/components/gameComponents/goodsComp";
import PoolComp from "@/components/gameComponents/poolComp";
import Attack from "@/components/gameComponents/attack/attack";
// import toast, { Toaster } from 'react-hot-toast';
import { ToastContainer, toast } from 'react-toastify';



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plotwar — 10,000 lands, one map",
  description:
    "A 100x100 map of 10,000 lands. Build, recruit, march, and convert goods into PLOT. Free on the Sepolia testnet, mainnet on Base from 1 October.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {




  return (
    <html lang="en" className=" !scroll-smooth overflow-x-hidden">
      <body
        className={`${inter.className} w-screen bg-black text-yellow-50 relative overflow-x-hidden overflow-y-hidden `}
      >
        <div className=" absolute bg-[color:var(--pw-accent)]  -top-[20rem] z-0 left-[10rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[13rem] sm:w-[15.75rem] sm:left-[3rem] sm:blur-[10rem] opacity-50 lg:left-[10rem] lg:w-[22.5rem]"></div>
        <GlobalErrorBoundary>
        <ThirdwebProvider>
        <BlockchainStateContextProvider>
          <UserDataContextProvider>
        <MapContextProvider>
        <ApiDataProvider>
      
        <SelectedWindowContextProvider>
          <SelectedBuildingContextProvider>
          <ThemeContextProvider>
            <ActiveSectionContextProvider>
              <BlockchainUtilsContextProvider>
              <ToastContainer />
                <PopUpState/>
                <Navbar/>
                <FaucetBar/>
                <BalanceContainer/>
                <ArmyOverview/>
                <TokenActionComp/>
                <SwapComp/>
                <GoodsComp/>
                <PoolComp/>
                <LandPicker/>
                <Attack/>
                {/*
                  A second boundary inside the providers, around the page only.
                  The outer one sits above ThirdwebProvider, so anything it
                  catches takes the wallet button and the navigation down with
                  it — which is how switching accounts left a black screen with
                  no way back. A page that throws should cost the page.
                */}
                <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
                <BottomBar/>
            
                </BlockchainUtilsContextProvider>
            </ActiveSectionContextProvider>
          </ThemeContextProvider>
          </SelectedBuildingContextProvider>
        </SelectedWindowContextProvider>
       
        </ApiDataProvider>
        </MapContextProvider>
        </UserDataContextProvider>
        </BlockchainStateContextProvider>
        </ThirdwebProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
