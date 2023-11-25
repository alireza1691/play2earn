import React from "react";
import { AiFillTwitterCircle } from "react-icons/ai";
import { RiTelegramFill } from "react-icons/ri";
import { FaDiscord } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleUp } from "react-icons/fa6";

import Image from "next/image";
import { footerRow1, footerRow2 } from "@/lib/data";

export default function Footer() {
  return (
    <section className=" flex flex-col text-white/75 bg-[#213830] bottom-0 mt-[15rem]">
      <div className="flex  justify-center gap-5 text-[26px] py-5">
        <AiFillTwitterCircle />
        <FaDiscord />
        <RiTelegramFill />
      </div>
      <div className="flex flex-wrap sm:flex-row mt-[4rem]">
        <div className="w-full px-10 text-center sm:text-left lg:w-[55%] lg:px-[7rem] xlg:px-[13.5rem] 2xl:px-[12.5%] ">
          <h2 className=" text-center lg:text-start text-[28px] mb-5 text-[#A5F4B6] font-semibold">
            Join our community
          </h2>
          <p className="text-[14px] opacity-60 text-white">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero
            neque quod est architecto reprehenderit unde iusto laborum
            exercitationem ipsum. Tenetur qui laudantium esse ratione.
            Accusantium, nulla. Esse facere distinctio cum.
          </p>
          <div className=" w-fit flex flex-row relative mt-8 left-1/2 -translate-x-1/2 lg:left-0 lg:-translate-x-0">
            {" "}
            <input
              placeholder="Email"
              className=" text-white bg-white/20  py-2 px-4 rounded-xl border-[0.15rem] border-white/20   "
            ></input>
            <FaAngleRight className=" cursor-pointer text-[40px] p-2 text-gray-700 bg-white absolute right-[2px] top-[2px] rounded-xl" />
          </div>
        </div>
        <div className="w-full  lg:w-[45%] px-[4rem] flex flex-wrap gap-10 justify-center lg:justify-start mt-20 lg:mt-0">
          <div className=" justify-center flex flex-col gap-4">
            {footerRow1.map((item,index) => (
              <h3 className="  cursor-pointer  hover:opacity-70 opacity-90">{item.name}</h3>
            ))}
            {/* <h2 className="  text-[22px] font-bold">Support</h2>*/}
          </div>
          <div className=" flex flex-col gap-4 justify-center">
          {footerRow2.map((item,index) => (
              <h3 className=" cursor-pointer hover:opacity-70 opacity-90">{item.name}</h3>
            ))}
          </div>
        </div>
      </div>
      <div className=" flex flex-col sm:flex-row justify-around items-center p-10 mt-10 relative" >
        <Image src={"/BlockdomLogo.png"} width={70} height={60} alt={"logo"}></Image>
        <p className="absolute">@2024 Blockdom. All right reserved</p>
        <a className="p-4 bg-[#62AE94] rounded-full"><FaAngleUp/></a>
      </div>
    </section>
  );
}
