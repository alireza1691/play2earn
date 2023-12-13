"use client";
import DoubleSword from "@/svg/doubleSword";
import Image from "next/image";
import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import AttackTargetInfo from "./attackTargetInfo";
import WarriorsSliders from "./warriorsSliders";

export default function Attack() {
  const [selectedLand, setSelectedLand] = useState<number | null>(101101);
  const [dropDown, setDropDown] = useState<boolean>(false);
  let isAttackSelected = false;

  const Lands = [101101, 105105];
  return (
    <>
      {isAttackSelected && (
        <section className="top-[6rem] w-[90%] h-[50rem] absolute left-1/2 -translate-x-1/2 z-50">
          <div className=" flex flex-col  w-full h-full border-[#D4D4D4]/30 attackWindowBg rounded-xl border">
            <div className="mt-10 flex flex-row justify-around h-full ">
              <div className=" flex flex-col items-center ">
                <div className=" relative  w-[200px] h-auto">
                  <Image
                    className="  "
                    src={"/cards/LandCard.png"}
                    height={364}
                    width={256}
                    alt="card"
                  />
                  <div className=" bottom-0 absolute w-full">
                    <ul
                      onClick={() => setDropDown(!dropDown)}
                      className={`${
                        dropDown ? " " : "bg-[#06291D]/50"
                      } transition-all active:opacity-60 ring-gray-600 group  cursor-pointer flex flex-row justify-between items-center bg-[#06291D]/50 text-[#98FBD7] font-medium text-[16px] w-full px-6 py-3 rounded-b-xl backdrop-blur-sm`}
                    >
                      {selectedLand}
                      {dropDown ? (
                        <IoIosArrowUp className="  group-active:-translate-y-1" />
                      ) : (
                        <IoIosArrowDown className=" group-active:translate-y-1" />
                      )}
                    </ul>
                    {dropDown && (
                      <div className=" absolute w-[225px] mt-2 bg-gradient-to-r from-[#34594B] to-[#213830] rounded-lg border border-[#D4D4D4]/20">
                        {Lands.map((land, key) => (
                          <li
                            key={key}
                            onClick={() => {
                              setSelectedLand(land), setDropDown(false);
                            }}
                            className=" text-white cursor-pointer px-3 py-2 hover:bg-green-100/10 rounded-lg"
                          >
                            {land}
                          </li>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <WarriorsSliders />
              </div>
              <div className="flex flex-col justify-center">
                <DoubleSword />
              </div>
              <div className=" flex flex-col items-center">
                <Image
                  className="  w-[200px] h-auto"
                  src={"/cards/LandCard.png"}
                  height={364}
                  width={256}
                  alt="card"
                />
                <AttackTargetInfo />
              </div>
            </div>
            <div className="p-3 justify-center flex">
              {" "}
              <button className="redButton mt-auto !w-[30rem]">Attack</button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
