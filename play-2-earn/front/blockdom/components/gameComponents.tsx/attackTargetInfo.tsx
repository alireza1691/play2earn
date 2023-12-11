import CopyIcon from "@/svg/copyIcon";
import WalletIcon from "@/svg/walletIcon";
import Image from "next/image";
import React from "react";

const warriors = [10, 50, 22, 70, 0];

export default function AttackTargetInfo() {
  return (
    <div className=" flex flex-col w-[20rem] mt-3">
      <div className=" h-[4.5rem] w-full bronzeBg rounded-xl  flex flex-col darkShadow">
        <h3 className="ml-8  font-bold text-[24px]">Target</h3>
        <p className="ml-8 w-full flex flex-row gap-3 text-[#98FBD7]">
          <WalletIcon /> 0x1234...2345
          <CopyIcon />
        </p>
      </div>
      <div className=" flex flex-row gap-4 mt-4">
        <div className="goodsBalanceKeeper goldBg w-1/2 darkShadow">20000</div>
        <div className="goodsBalanceKeeper foodBg w-1/2 darkShadow">40000</div>
      </div>
      <div className=" flex flex-row justify-evenly mt-4">
        {warriors.map((warrior, key) => (
          <div key={key} className="cardBg ml-auto mr-auto darkShadow">
            <Image
              src={"/warriorTest.png"}
              alt="warriorCard"
              width={40}
              height={64}
               className ={" w-[50px] h-auto"}
            />
            <h4 className="mt-1 text-center text-[10px]">{warrior}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
