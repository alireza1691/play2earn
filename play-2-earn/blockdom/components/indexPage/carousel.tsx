import Image from "next/image";
import React from "react";
import { IoMdDownload } from "react-icons/io";

export default function Carousel() {
  return (
    <section className=" px-6 md:px-20 my-[5rem]">
      <div className="relative w-full rounded-xl overflow-hidden">
        <Image
          className=" bg-gray-300/20 brightness-50 object-cover blur-[0.1rem] w-full h-[30rem]"
          src={"/icons/map.jpeg"}
          width={500}
          height={500}
          alt="carouselBackground"
        />
        <div className=" absolute left-4 top-6 max-w-[50%]">
          <h3 className=" font-bold text-[32px] text-white mb-6">
            Innovative tokenomics
          </h3>
          <p className=" text-white/90 mb-6">
            What makes BLOCKDOM from the other play to earn apps is TOKENOMICS.
            Blockdom is not a P2E game for the short term like others.We've
            developed innovative solutions to address the imbalance in the
            supply and demand of BMT (Blockdom token), ensuring the sustained
            value of BMT. This provides users with a reliable source of
            long-term income. For additional details, Refer to the white paper.
          </p>
          <button
            // initial={{ opacity: 0, y: 100 }}
            // animate={{ opacity: 1, y: 0 }}
            className="group flex flex-row items-center gap-3 outlineGreenButton"
          >
            Whitepaper{" "}
            <IoMdDownload className=" text-xl group-hover:translate-y-1 transition-all" />
          </button>
{/* 
          <button className="outlineGreenButton">Open</button> */}
        </div>
      </div>
    </section>
  );
}
