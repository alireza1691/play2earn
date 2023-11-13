
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
import { ThirdwebProvider } from "@thirdweb-dev/react";

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
    // <ThirdwebProvider>
    <html lang="en">
      <body className={`${inter.className} bg-black text-yellow-50 relative h-[5000px]`}>
        <div className="bg-green-500 absolute top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[30rem] sm:w-[68.75rem] opacity-30"></div>
        {/* <div className="bg-yellow-900 absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[30rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem]"></div> */}
        <Navbar/>
        {children}
      </body>
    
    </html>
    // </ThirdwebProvider>
  );
}
