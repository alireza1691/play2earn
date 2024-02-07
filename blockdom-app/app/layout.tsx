import Navbar from "@/components/navbar";
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
import TokenActionComp from "@/components/gameComponents/tokenActionComp";
import Attack from "@/components/gameComponents/attack/attack";
// import toast, { Toaster } from 'react-hot-toast';
import { ToastContainer, toast } from 'react-toastify';



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blockdom",
  description: "Play to earn gaming application",
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
        <div className=" absolute bg-[#7FDDAD]  -top-[20rem] z-0 left-[10rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[13rem] sm:w-[15.75rem] sm:left-[3rem] sm:blur-[10rem] opacity-50 lg:left-[10rem] lg:w-[22.5rem]"></div>
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
                <BalanceContainer/>
                <TokenActionComp/>
                <Attack/>
                {children}
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
