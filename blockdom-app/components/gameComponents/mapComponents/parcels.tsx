"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Tooltip } from "@nextui-org/react";
import {
  getMintedLandsFromEvents,
  inViewParcels,
  parcelLands,
  separatedCoordinate,
  zeroAddress,
} from "@/lib/utils";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { MintedLand } from "@/lib/types";

export default function Parcels() {
  const { setSelectedWindowComponent } = useSelectedWindowContext();
  const [mintedLands, setMintedLands] = useState<MintedLand[] | null>(null);
  const { apiData, loading } = useApiData();
  const { selectedParcel, setSelectedLand } = useMapContext();

  const getOwnerFromEvents = (tokenId: number): string => {
    let isPresent: boolean;
    let ownerAddress: string = zeroAddress;
    if (!mintedLands) {
      isPresent = false;
    } else {
      isPresent = mintedLands?.some(
        (item) => item.tokenId === tokenId.toString()
      );
      if (isPresent) {
        const land = mintedLands.find(
          (item) => item.tokenId === tokenId.toString()
        );
        ownerAddress = land?.owner ?? ownerAddress;
      }
    }
    return ownerAddress;
  };

  const parcelBg = (x: number, y: number): string => {
    if (x == 90 && y == 90) {
      return "bg-[url(/map/Outer1.png)] bg-cover";
    }
    if (x == 200 && y == 200) {
      return "bg-[url(/map/Outer5.png)] bg-cover";
    }
    if (x == 90 && y < 200 && y > 90) {
      return "bg-[url(/map/Outer2.png)] bg-cover";
    }
    if (x > 90 && x < 200 && y == 90) {
      return "bg-[url(/map/Outer8.png)] bg-cover";
    }
    if (x > 90 && x < 200 && y > 90 && y < 200) {
      return "bg-[url(/map/centerParcel.png)] bg-cover";
    }
    if (x == 200 && y == 90) {
      return "bg-[url(/map/Outer7.png)] bg-cover";
    }
    if (x == 200 && y > 90 && y < 200) {
      return "bg-[url(/map/Outer6.png)] bg-cover";
    }
    if (x < 200 && x > 90 && y == 200) {
      return "bg-[url(/map/Outer4.png)] bg-cover";
    }
    if (x == 90 && y == 200) {
      return "bg-[url(/map/Outer3.png)] bg-cover";
    } else return "";
  };

  useEffect(() => {
    const getData = () => {
      if (apiData) {
        const mintedLandsFromEvents = getMintedLandsFromEvents(apiData.result);
        setMintedLands(mintedLandsFromEvents);
      }
    };
    getData();
  }, [apiData]);



  return (
    <>
      {selectedParcel && (
        <>
          <div className="z-10 transition-all invisible md:visible absolute grid gap-[0px] w-[1080px] md:w-[1590px] 2xl:w-[2130px]  grid-cols-3 md:left-[20rem] 2xl:left-[27.5rem] top-0 viewGrid ">
            {inViewParcels(selectedParcel).map((parcel, key) => (
              <div
                key={key}
                className={` grid w-fit grid-cols-10 gap-[1px] ${
                  key == 4 ? " " : " brightness-50 "
                }
              ${parcelBg(parcel.x, parcel.y)}
               `}
              >
                {parcelLands(parcel.x, parcel.y).map((land, index) => (
                  <Tooltip
                    radius="sm"
                    key={land}
                    color={"default"}
                    content={separatedCoordinate(land.toString())}
                    className={`capitalize p-2 rounded-xl text-[12px] text-white !bg-[#06291D]/60 ${
                      key != 4 && "invisible"
                    }`}
                  >
                    <a
                      key={land}
                      onClick={() => {
                        key == 4 &&
                          setSelectedLand({
                            coordinate: land,
                            owner: getOwnerFromEvents(land),
                            isMinted: getOwnerFromEvents(land) != zeroAddress,
                          }),
                          // key == 4 && setSlideBar(true),
                          key == 4 && setSelectedWindowComponent("emptyLand"),
                          console.log(land);
                      }}
                      className={`${
                        key == 4
                          ? ` cursor-pointer  hover:backdrop-brightness-50 active:backdrop-brightness-110 backdrop-brightness-75 ${
                              getOwnerFromEvents(land) != zeroAddress &&
                              "bg-black/10"
                            } `
                          : `cursor-default ${
                              getOwnerFromEvents(land) != zeroAddress &&
                              "brightness-50 bg-black/50"
                            } `
                      }   transition-all duration-100 text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                    >
                      {key == 4 && getOwnerFromEvents(land) != zeroAddress && (
                        <div className="flex w-4/5 h-4/5 border-3 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-gray-800/20 border-gray-800/50 rounded-full absolute  ">
                          <div className="!w-[10px] !h-[10px] p-2 rounded-md mt-auto mb-auto mr-auto ml-auto bg-gray-700/60"></div>
                        </div>
                      )}
                      {/* {
                      key == 4 &&
                      <Image
                      className={`${getOwnerFromEvents(land) != zeroAddress && " brightness-50" }  h-[35px] w-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px] absolute -z-10`}
                      src={"/parcels/parcel.png"}
                      width={60}
                      height={60}
                      alt="parcel"
                      quality={30}
                    />
                    } */}

                      {/* {land} */}
                    </a>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
          <div className="z-10 md:-z-10 absolute grid gap-[1px] w-[1590px]  transform grid-cols-3 left-[0rem] top-0 md:invisible ">
            {inViewParcels(selectedParcel).map((parcel, key) => (
              <div
                key={key}
                className={`grid w-fit grid-cols-10 gap-[2px] ${
                  key == 4 ? "" : " brightness-50"
                } ${parcelBg(parcel.x, parcel.y)}`}
              >
                {parcelLands(parcel.x, parcel.y).map((land) => (
                  <a
                    key={land}
                    onClick={() => {
                      key == 4 &&
                        setSelectedLand({
                          coordinate: land,
                          owner: getOwnerFromEvents(land),
                          isMinted: getOwnerFromEvents(land) != zeroAddress,
                        }),
                        key == 4 && setSelectedWindowComponent("emptyLand"),
                        console.log(land);
                    }}
                    className={`${
                      key == 4
                        ? `${
                          getOwnerFromEvents(land) != zeroAddress &&
                          "bg-black/20"
                        } cursor-pointer hover:backdrop-brightness-50 active:backdrop-brightness-110 backdrop-brightness-75 transition-all`
                        : `${
                          getOwnerFromEvents(land) != zeroAddress &&
                          "bg-black/30"
                        }  cursor-default`
                    } text-black text-[8px] h-[52px] w-[52px] 2xl:h-[70px] 2xl:w-[70px]  shadow-md `}
                  >
                    {key == 4 && land}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
