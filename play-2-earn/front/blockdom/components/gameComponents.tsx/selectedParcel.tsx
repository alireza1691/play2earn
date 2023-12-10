"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import {Tooltip, Button} from "@nextui-org/react";
import ParcelsWideMode from "./parcelsWideMode";
import ParcelsMobileMode from "./parcelsMobileMode";

type landSelectorHookProps = {
  setSelectedLand: React.Dispatch<React.SetStateAction<number | null>>;
  setSlideBar: React.Dispatch<React.SetStateAction<boolean>>;
};
type selectedParcelType = {
  x: number;
  y: number;
};

export default function SelectedParcel2({
  setSelectedLand,
  setSlideBar,
}: landSelectorHookProps) {

const containerRef = useRef<HTMLDivElement >(null);


  const [selectedParcel, setSelectedParcel] = useState<selectedParcelType>({
    x: 100,
    y: 100,
  });



  useEffect(() => {
    const container = containerRef.current!;

    // Calculate the scroll position to center the content
    const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    const scrollTop = (container.scrollHeight - container.clientHeight) / 2;

    // Scroll the container to the center position
    container.scrollTo(scrollLeft, scrollTop);
  }, []);
  
  return (
    <>
      <div className="z-20 absolute top-[4.5rem] h-[3rem] w-full greenHeaderGradient items-center flex justify-center ">
      
        <h3 className="text-[#98FBD7] -z-10">
          {selectedParcel.x}
          {selectedParcel.y}
        </h3>
      </div>
      {/* <div ref={containerRef} className="w-[100vw] h-[100vh] md:max-w-[720px] lg:max-w-[967px] 2xl:max-w-[1320px] ml-auto mr-auto   overflow-scroll  object-cover relative"> */}

      <div ref={containerRef} className="w-[100vw] h-[100vh]   overflow-scroll  items-center justify-center object-cover relative">
        <div className=" absolute h-[40rem] w-[40rem] top-[30rem] left-[800px]">
        <a
          onClick={() => {
            selectedParcel.y >= 110 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                y: prevState.y - 10,
              }));
          }}
          className={` ${
            selectedParcel.y <= 100 ? "brightness-50  opacity-50 " : "cursor-pointer"
          } invisible md:visible   z-50 md:right-[4rem] md:top-[9.5rem] 2xl:top-[7.5rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/topRightArrow.svg"}
            width={60}
            height={60}
            alt="arrow"
          />
        </a>
        <a
          onClick={() => {
            selectedParcel.x >= 110 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                x: prevState.x - 10,
              }));
          }}
          className={`${
            selectedParcel.x <= 100 ? "brightness-50  opacity-50" : "cursor-pointer"
          } invisible md:visible   z-50 md:left-[3rem] md:top-[10.5rem] 2xl:top-[8rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/topLeftArrow.svg"}
            width={60}
            height={60}
            alt="arrow"
          />
        </a>
        <a
          onClick={() => {
            selectedParcel.y < 190 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                y: prevState.y + 10,
              }));
          }}
          className={`${
            selectedParcel.y >= 190 ? "brightness-50  opacity-50" : "cursor-pointer"
          } invisible md:visible  z-50  md:left-[2.5rem] md:bottom-[9.5rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/bottomLeftArrow.svg"}
            width={65}
            height={65}
            alt="arrow"
          />
        </a>
        <a
          onClick={() => {
            selectedParcel.x < 190 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                x: prevState.x + 10,
              }));
          }}
          className={` ${
            selectedParcel.x >= 190 ? "brightness-50  opacity-50" : "cursor-pointer"
          } invisible md:visible  z-50 md:right-[4rem] bottom-[11rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/bottomRightArrow.svg"}
            width={60}
            height={60}
            alt="arrow"
          />
        </a>
        </div>

      {/* <div className=" invisible md:visible absolute grid gap-[1px] w-[1080px] md:w-[1590px] 2xl:w-[2130px] transform grid-cols-3 md:left-[20rem] 2xl:left-[27.5rem] top-0 viewGrid ">
            {parcels(selectedParcel).map((parcel,key) =>(
                <div key={key} className={`grid w-fit grid-cols-10 gap-[1px] ${key == 4 ? "":"blur-md brightness-50"}`}>
                    {lands(selectedParcel.x, selectedParcel.y).map((land,index) => (
                               <Tooltip radius="sm" key={key} color={"default"} content={separatedCoordinate(land.toString())} className={`capitalize  !bg-[#06291D]/80 ${key != 4 && "invisible"}`}>
                               <a
                                 key={index}
                                 onClick={() =>  
                                   {key == 4 && setSelectedLand(land),key == 4 && setSlideBar(true),console.log(land);
                                   }
                                 }
                                 className={`${key == 4 ? "cursor-pointer hover:bg-blue-gray-900/10" : "cursor-default"} text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `} 
                               >
                                 <Image
                                   className=" h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10"
                                   src={"/parcels/parcel.png"}
                                   width={60}
                                   height={60}
                                   alt="parcel"
                                   quality={30}
                                 />
                                 {land}
                               </a>
                               </Tooltip>
                    ))}
              
                </div>
            ))}
        </div> */}
        <ParcelsWideMode setSlideBar={setSlideBar} setSelectedLand={setSelectedLand} setSelectedParcel={setSelectedParcel} selectedParcel={selectedParcel} />
        <ParcelsMobileMode setSlideBar={setSlideBar} setSelectedLand={setSelectedLand} setSelectedParcel={setSelectedParcel} selectedParcel={selectedParcel} />
        {/* <div  className=" absolute grid gap-[1px] w-[1590px]  transform grid-cols-3 left-[0rem] top-0 md:invisible ">
            {inViewParcels(selectedParcel).map((parcel,key) =>(
                <div key={key} className={`grid w-fit grid-cols-10 gap-[1px] ${key == 4 ? "":"blur-md brightness-50"}`}>
                    {parcelLands(selectedParcel.x, selectedParcel.y).map((land,index) => (
                               <Tooltip radius="sm" key={key} color={"default"} content={separatedCoordinate(land.toString())} className={`capitalize  !bg-[#06291D]/80 ${key != 4 && "invisible"}`}>
                               <a
                                 key={index}
                                 onClick={() =>  
                                   {key == 4 && setSelectedLand(land),key == 4 && setSlideBar(true),console.log(land);
                                   }
                                 }
                                 className={`${key == 4 ? "cursor-pointer hover:bg-blue-gray-900/10" : "cursor-default"} text-black text-[8px] h-[52px] w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `} 
                               >
                                 <Image
                                   className=" h-[52px] w-[52px] absolute -z-10"
                                   src={"/parcels/parcel.png"}
                                   width={60}
                                   height={60}
                                   alt="parcel"
                                   quality={30}
                                 />
                                 {land}
                               </a>
                               </Tooltip>
                    ))}
              
                </div>
            ))}
        </div> */}
      </div>
     
      <section className="z-10 absolute   ">
  
        {/* <a
          onClick={() => {
            selectedParcel.y < 190 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                y: prevState.y + 10,
              }));
          }}
          className={`${
            selectedParcel.y >= 190 && "brightness-50 invisible "
          }  cursor-pointer z-50  bottom-[3rem] -left-[1rem] lg:bottom-[6.5rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/bottomLeftArrow.svg"}
            width={65}
            height={65}
            alt="arrow"
          />
        </a>
        <a
          onClick={() => {
            selectedParcel.x < 190 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                x: prevState.x + 10,
              }));
          }}
          className={` ${
            selectedParcel.x >= 190 && "brightness-50 invisible "
          } cursor-pointer z-50 right-[0rem] bottom-[3.5rem] lg:bottom-[7.5rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/bottomRightArrow.svg"}
            width={60}
            height={60}
            alt="arrow"
          />
        </a>
        <a
          onClick={() => {
            selectedParcel.y >= 110 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                y: prevState.y - 10,
              }));
          }}
          className={` ${
            selectedParcel.y <= 100 && "brightness-50 invisible "
          } cursor-pointer z-50 right-[0rem] top-[3.5rem] lg:top-[7.5rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/topRightArrow.svg"}
            width={60}
            height={60}
            alt="arrow"
          />
        </a>
        <a
          onClick={() => {
            selectedParcel.x >= 110 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                x: prevState.x - 10,
              }));
          }}
          className={`${
            selectedParcel.x <= 100 && "brightness-50 invisible "
          } cursor-pointer z-50 left-[0rem] top-[4rem] lg:top-[8rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/topLeftArrow.svg"}
            width={60}
            height={60}
            alt="arrow"
          />
        </a> */}
        {/* <div className="z-10 grid gap-[1px] grid-cols-10 transform viewGrid w-max shadow-black shadow-large ">
          {lands(selectedParcel.x, selectedParcel.y).map((land, key) => (
             <Tooltip radius="sm" key={key} color={"default"} content={separatedCoordinate(land.toString())} className="capitalize  !bg-[#06291D]/80">
            <a
              key={key}
              onClick={() => {
                console.log(land), setSelectedLand(land), setSlideBar(true);
              }}
              className="  cursor-pointer text-black text-[8px] w-[35px] h-[35px] lg:w-[66px] lg:h-[66px] 2xl:w-[70px] 2xl:h-[70px] shadow-md hover:bg-blue-gray-900/10"
            >
              <Image
                className=" h-[35px] w-[35px] lg:w-[66px] lg:h-[66px] 2xl:w-[70px] 2xl:h-[70px] absolute -z-10"
                src={"/parcels/parcel.png"}
                width={60}
                height={60}
                alt="parcel"
                quality={50}
              />
              {land}
            </a>
            </Tooltip>
          ))}
        </div> */}

      </section>
    </>
  );
}
