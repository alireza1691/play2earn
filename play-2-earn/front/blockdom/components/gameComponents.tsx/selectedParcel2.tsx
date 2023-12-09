"use client";
import Image from "next/image";
import React, { useState } from "react";
import {Tooltip, Button} from "@nextui-org/react";

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
  const [selectedParcel, setSelectedParcel] = useState<selectedParcelType>({
    x: 100,
    y: 100,
  });
  const parcels = (selectedParcel:selectedParcelType): selectedParcelType[] => {
    let parcelsArray = []

    parcelsArray[0] = {...selectedParcel, x : selectedParcel.x -10, y: selectedParcel.y - 10}
    parcelsArray[1] = {...selectedParcel,  y: selectedParcel.y - 10}
    parcelsArray[2] = {...selectedParcel, x : selectedParcel.x + 10,  y: selectedParcel.y - 10}
    parcelsArray[3] = {...selectedParcel, x : selectedParcel.x - 10}
    parcelsArray[4] = selectedParcel
    parcelsArray[5] = {...selectedParcel, x : selectedParcel.x + 10}
    parcelsArray[6] = {...selectedParcel, x : selectedParcel.x - 10, y: selectedParcel.y + 10}
    parcelsArray[7] = {...selectedParcel, y: selectedParcel.y + 10}
    parcelsArray[8] = {...selectedParcel, x : selectedParcel.x + 10, y: selectedParcel.y + 10}

    return parcelsArray
  }


  const lands = (xFrom: number, yFrom: number) => {
    let items = [];
    for (let x = xFrom; x < xFrom + 10; x++) {
      for (let y = yFrom; y < yFrom + 10; y++) {
        items.push(Number(x.toString() + y.toString()));
      }
    }
    return items;
  };

  const separatedCoordinate = (coordinate:string) =>{
    const middleIndex = Math.floor(coordinate.length / 2);
    const result = coordinate.slice(0, middleIndex) + " - " + coordinate.slice(middleIndex);
    return result
  }
  return (
    <>
      <div className="z-20 absolute top-[4.5rem] h-[3rem] w-full greenHeaderGradient items-center flex justify-center ">
      
        <h3 className="text-[#98FBD7] -z-10">
          {selectedParcel.x}
          {selectedParcel.y}
        </h3>
      </div>
      <div className="w-[100vw] h-[100vh] overflow-scroll flex items-center justify-center object-cover ">
      <div className="grid gap-[1px] w-fit transform grid-cols-3 left-0 top-0 viewGrid">
            {parcels(selectedParcel).map((parcel,key) =>(
                <div key={key} className={`grid w-fit grid-cols-10 ${key == 4 ? "":"blur-sm brightness-50"}`}>
                    {lands(selectedParcel.x, selectedParcel.y).map((land,index) => (
                               <Tooltip radius="sm" key={key} color={"default"} content={separatedCoordinate(land.toString())} className={`capitalize  !bg-[#06291D]/80 ${key != 4 && "invisible"}`}>
                               <a
                                 key={index}
                                 onClick={() =>  
                                   {key == 4 && setSelectedLand(land),key == 4 && setSlideBar(true),console.log(land);
                                   }
                                 }
                                 className={`${key == 4 ? "cursor-pointer" : "cursor-default"} text-black text-[8px] w-[35px] h-[35px]  shadow-md hover:bg-blue-gray-900/10`} 
                               >
                                 <Image
                                   className=" h-[35px] w-[35px] absolute -z-10"
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
              
                </div>
            ))}
        </div>
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
