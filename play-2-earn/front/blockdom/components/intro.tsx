import Image from "next/image";
import React from "react";

export default function Intro() {
  return (
    <section>
      <div className="w-full md:w-[50%] h-[30rem]  ">
        <div
          // className=' md:right-0 flex md:justify-end md:ml-auto  md:w-[60%] sm:w-full sm:justify-center sm:items-center'
          className="w-full  h-[20rem] justify-center items-center md:w-[60%] md:object-right  md:ml-auto "
        >
          <div className="">
            {" "}
            <Image
              className=" flex justify-center right-0 object-center w-[90%] rounded-[1rem] md:mr-[1rem]  "
              src={"/test.jpeg"}
              width={200}
              height={200}
                // fill
              alt="sample"
            ></Image>
          </div>
          <div>
            <h1 className=" text-[64px]">Lorem ipsum dolor sit amet</h1>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Pariatur hic saepe eaque asperiores, maxime quaerat ad harum eveniet? Praesentium dolores autem soluta illum, iure assumenda saepe consectetur. Eveniet, repellendus ut.</p>
          </div>
          <div className="mt-8">
            <button className="py-3 px-7 mr-4 tex bg-gradient-to-l  to-[#75E5F4] from-[#9FFFCF] border-[1px] border-[#75E5F4] text-black rounded-[0.8rem] text-[0.8rem] font-semibold  hover:from-[#9168FB] hover:to-[#9168FB] hover:border-[#9168FB]">Get start</button>
            <button className="py-3 px-7 mr-4 tex border-neutral-50 border-[1px] text-[0.8rem] rounded-[0.8rem] font-semibold ">Check the Documentation</button>
          </div>
        </div>
      </div>
      <div className="w-[50%] bg-slate-500"></div>
    </section>
  );
}
