"use client"
import React from "react";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { inViewParcels, parcelLands, separatedCoordinate } from "@/lib/utils";
import { parcelsViewHookProps } from "@/lib/types";



export default function ParcelsWideMode({
  setSelectedLand,
  setSlideBar,
  selectedParcel,
  setSelectedParcel
}: parcelsViewHookProps) {


  return (
    <>
         {/* <a
          onClick={() => {
            selectedParcel.y < 190 &&
              setSelectedParcel((prevState) => ({
                ...prevState,
                y: prevState.y + 10,
              }));
          }}
          className={`${
            selectedParcel.y >= 190 ? "brightness-50  opacity-50" : "cursor-pointer"
          } invisible md:visible  z-50  md:left-[52.5rem] md:-bottom-[1rem] absolute`}
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
          } invisible md:visible  z-50 md:-right-[12rem] bottom-[0rem] absolute`}
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
            selectedParcel.y <= 100 ? "brightness-50  opacity-50 " : "cursor-pointer"
          } invisible md:visible   z-50 md:-right-[13rem] md:top-[39rem] 2xl:top-[7.5rem] absolute`}
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
          } invisible md:visible   z-50 md:left-[53rem] md:top-[40rem] 2xl:top-[8rem] absolute`}
        >
          <Image
            src={"/svg/gameItems/topLeftArrow.svg"}
            width={60}
            height={60}
            alt="arrow"
          />
        </a> */}
    <div className=" transition-all invisible md:visible absolute grid gap-[1px] w-[1080px] md:w-[1590px] 2xl:w-[2130px] transform grid-cols-3 md:left-[20rem] 2xl:left-[27.5rem] top-0 viewGrid ">
      {inViewParcels(selectedParcel).map((parcel, key) => (
        <div
          key={key}
          className={`grid w-fit grid-cols-10 gap-[1px] ${
            key == 4 ? "" : "blur-md brightness-50"
          }`}
        >
          {parcelLands(selectedParcel.x, selectedParcel.y).map(
            (land, index) => (
              <Tooltip
                radius="sm"
                key={key}
                color={"default"}
                content={separatedCoordinate(land.toString())}
                className={`capitalize  !bg-[#06291D]/80 ${
                  key != 4 && "invisible"
                }`}
              >
                <a
                  key={index}
                  onClick={() => {
                    key == 4 && setSelectedLand(land),
                      key == 4 && setSlideBar(true),
                      console.log(land);
                  }}
                  className={`${
                    key == 4
                      ? "cursor-pointer hover:bg-blue-gray-900/10"
                      : "cursor-default"
                  } text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
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
            )
          )}
        </div>
      ))}
    </div>
    </>
  );
}
