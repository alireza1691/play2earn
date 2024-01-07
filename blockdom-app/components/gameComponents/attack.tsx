"use client";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import CloseIcon from "@/svg/closeIcon";
import DoubleSword from "@/svg/doubleSword";
import Image from "next/image";
import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosArrowBack } from "react-icons/io";
import AttackTargetInfo from "./attackTargetInfo";
import WarriorsSliders from "./warriorsSliders";



export default function Attack() {
  const [selectedLand, setSelectedLand] = useState<number | null>(101101);
  const [dropDown, setDropDown] = useState<boolean>(false);
  const {selectedWindowComponent, setSelectedWindowComponent} = useSelectedWindowContext()
  let isAttackSelected = false;

  const Lands = [101101, 105105];
  return (
    <>
      {/* {selectedWindowComponent == "attack" && ( */}
        <section className={` ${selectedWindowComponent == "attack" ?"top-[6rem]" : " top-[200rem]"} w-[90%] h-[80%] absolute left-1/2 -translate-x-1/2 z-50 transition-all`}>
          <div className=" flex flex-col  w-full h-full border-[#D4D4D4]/30 bg-[#21302A]/60  backdrop-blur-md  rounded-xl border">
            <div className="w-full flex flex-row">
            <a className=" mr-auto hidden md:flex  closeIcon m-2 text-[24px]" onClick={() => setSelectedWindowComponent("emptyLand")}><IoIosArrowBack/></a>
              <a  className=" md:hidden p-1 m-2">From: {selectedLand}</a>
              <a onClick={() => setSelectedWindowComponent("emptyLand")}  className=" md:hidden p-1 m-2 ml-auto mr-auto hover:cursor-pointer hover:brightness-150">To: 109108</a>
            <a className=" ml-auto  closeIcon m-2 " onClick={() => setSelectedWindowComponent(null)}><CloseIcon/></a>
            </div>
         
            <div className=" flex flex-row justify-center md:justify-around h-[80%]">
              <div className=" flex flex-col items-center w-full px-4 md:px-1 md:w-[35%] max-w-[22.5rem]">
                <div className=" relative w-auto  md:w-[200px] max-h-[55%] h-full ">
                  <Image
                    className="h-full w-full  "
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
                      } transition-all active:opacity-60 ring-gray-600 group  cursor-pointer flex flex-row justify-between items-center bg-[#06291D]/50 text-[#98FBD7] font-medium text-[16px] w-full px-6 py-3 rounded-b-[1.02rem] backdrop-blur-sm`}
                    >
                      {selectedLand}
                      {dropDown ? (
                        <IoIosArrowUp className="  group-active:-translate-y-1" />
                      ) : (
                        <IoIosArrowDown className=" group-active:translate-y-1" />
                      )}
                    </ul>
                    {dropDown && (
                      <div className="z-10 absolute w-[225px] mt-2 bg-gradient-to-r from-[#34594B] to-[#213830] rounded-lg border border-[#D4D4D4]/20">
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
              <div className="md:flex flex-col justify-center hidden md:visible">
                <DoubleSword />
              </div>
              <div className=" md:flex flex-col items-center hidden md:visible w-[35%] max-w-[22.5rem]">
                <Image
                  className="  w-[200px] h-auto max-h-[55%]"
                  src={"/cards/LandCard.png"}
                  height={364}
                  width={256}
                  alt="targetCard"
                />
                <AttackTargetInfo />
              </div>
            </div>
            <div className="p-1 md:p-3 justify-center flex mt-auto ">
              {" "}
              <button className="redButton mt-auto !w-full md:!w-[30rem]">Attack</button>
            </div>
          </div>
        </section>
      {/* )} */}
    </>
  );
}