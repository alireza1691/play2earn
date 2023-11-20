
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import { ThirdwebProvider } from "../components/ThirdwebProvider"
import Footer from "@/components/footer";
import ThemeContextProvider from "@/context/theme-context";
import ThemeSwitch from "@/components/theme-switch";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blockdom",
  description: "Blockdom is a decentralized play-to-earn game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="en">
      <body className={`${inter.className} bg-white  dark:bg-black text-gray-800 dark:text-yellow-50 relative  pt-[7rem]`}>
        <div className="bg-[#0e6f3d] dark:bg-[#7FDDAD] absolute top-[-13rem] -z-10 left-[0rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[5rem] dark:blur-[13rem] sm:w-[15.75rem] sm:left-[3rem] sm:blur-[10rem] opacity-70  dark:opacity-50 lg:left-[10rem] lg:w-[22.5rem]" ></div>
        {/* <div className="bg-yellow-900 absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[30rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem]"></div> */}
        <ThemeContextProvider>
        <ThirdwebProvider>
        <Navbar/>
        {children}
        </ThirdwebProvider>
        <ThemeSwitch/>
        <Footer/>
        </ThemeContextProvider>
      </body>
    
    </html>

  );
}
