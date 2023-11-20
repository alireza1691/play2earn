import React from "react";
import { AiFillTwitterCircle } from "react-icons/ai";
import { RiTelegramFill } from "react-icons/ri";
import { FaDiscord } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleUp } from "react-icons/fa6";

import Image from "next/image";

export default function Footer() {
  return (
    <section className=" flex flex-col bg-[#213830] bottom-0 mt-[15rem]">
      <div className="flex  justify-center gap-5 text-[26px] py-5">
        <AiFillTwitterCircle />
        <FaDiscord />
        <RiTelegramFill />
      </div>
      <div className="flex flex-wrap sm:flex-row mt-[4rem]">
        <div className="w-full sm:w-[55%] sm:px-[13.5rem] ">
          <h2 className="text-[28px] mb-5 text-[#A5F4B6] font-semibold">
            Join our community
          </h2>
          <p className="text-[14px] opacity-60 text-white">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero
            neque quod est architecto reprehenderit unde iusto laborum
            exercitationem ipsum. Tenetur qui laudantium esse ratione.
            Accusantium, nulla. Esse facere distinctio cum.
          </p>
          <div className=" w-fit flex flex-row relative mt-8">
            {" "}
            <input
              placeholder="Email"
              className=" text-white bg-white/20  py-3 px-4 rounded-2xl border-[0.2rem] border-white/10   "
            ></input>
            <FaAngleRight className=" cursor-pointer text-[40px] p-2 text-black bg-white absolute right-2 top-[8px] rounded-xl" />
          </div>
        </div>
        <div className="w-full sm:w-[45%] px-[4rem] flex flex-wrap gap-10">
          <div className=" flex flex-col gap-4">
            <h2 className=" text-[22px] font-bold">Support</h2>
            <h3 className=" opacity-70">dsfsdsdf</h3>
            <h3 className=" opacity-70">sdfsdf</h3>
            <h3 className=" opacity-70">sdjfklsjanlk</h3>
          </div>
          <div className=" flex flex-col gap-4">
            <h2 className=" text-[22px] font-bold">Terms</h2>
            <h3 className=" opacity-70">dsfsdsdf</h3>
            <h3 className=" opacity-70">sdfsdf</h3>
            <h3 className=" opacity-70">sdjfklsjanlk</h3>
          </div>
        </div>
      </div>
      <div className=" flex flex-col sm:flex-row justify-around items-center p-10 mt-10 relative" >
        <Image src={"/"} width={200} height={50} alt={"logo"}></Image>
        <p className="absolute">@2024 Blockdom. All right reserved</p>
        <a className="p-4 bg-[#62AE94] rounded-full"><FaAngleUp/></a>
      </div>
    </section>
  );
}
