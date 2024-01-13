import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { MintedLand, SelectedParcelType } from "@/lib/types";
import { coordinatesObject, getMintedLandsFromEvents, parcelLands, zeroAddress } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useMemo, } from "react";

const allParcels =() => {
  let parcelLandsArray = [];
  for (let y = 9; y > -1; y--) {
    for (let x = 0; x < 10; x++) {
      const item = parcelLands((x + 10) * 10, (y + 10) * 10);
      parcelLandsArray.push(item);
    }
  }
  return parcelLandsArray;
};

export default function Map() {
  const { selectedParcel, setSelectedParcel } = useMapContext();
  const { apiData, loading ,mintedLands} = useApiData();

  // const memoizedParcels = useMemo(allParcels, []);
  // const allParcels = useMemo(() => {
  //   let parcelLandsArray = [];
  //   for (let y = 9; y > -1; y--) {
  //     for (let x = 0; x < 10; x++) {
  //       const item = parcelLands((x + 10) * 10, (y + 10) * 10);
  //       parcelLandsArray.push(item);
  //     }
  //   }
  //   return parcelLandsArray;
  // }, []);

  const getOwnerFromEvents =(tokenId:number):string =>{
    let isPresent: boolean
    let ownerAddress: string = zeroAddress
    if (!mintedLands) {
      isPresent = false;
    } else{
      isPresent = mintedLands?.some(item => item.tokenId === tokenId.toString());
      if (isPresent) {
        const land = mintedLands.find(item => item.tokenId === tokenId.toString());
        ownerAddress = land?.owner ?? ownerAddress;
      }

    }
    return ownerAddress 
  }

  const landStyleMapView = (land:number)=> {
    return ` xl:w-[10px] xl:h-[10px] w-[7px] h-[7px] bg-black/10 text-white  ${getOwnerFromEvents(land) !== zeroAddress && " !bg-black/50"}`;
}
  const parcelStyleMapView =
    "relative gap-[1px] hover:bg-black/20  hover:brightness-75 transition-all cursor-pointer grid grid-cols-10   !w-max  !h-max ";

  const gridImages = [
    "/map/Outer3.png",
    "/map/Outer4.png",
    "/map/Outer5.png",
    "/map/Outer2.png",
    "/map/Base.png",
    "/map/Outer6.png",
    "/map/Outer1.png",
    "/map/Outer8.png",
    "/map/Outer7.png",
  ];



  useEffect(()=> {
    const getData =() => {
      if (apiData) {
      }
    }
    getData()
  },[apiData])
  

  return (
    <>
      {selectedParcel == null && (
        <>
          <div className=" grid grid-cols-3 z-10 w-[1920px] h-[110rem]   xl:h-[160rem] xl:w-[2560px]   ">
            {gridImages.map((col, key) => (
              <Image
              key={key}
                className=" !w-[160rem]"
                src={col}
                width={1024}
                height={1024}
                alt="map parcel"
                // quality={100}
              />
            ))}
            </div>

          <div className=" gap-1 top-[34rem] left-[34rem] xl:left-[44.5rem] xl:top-[45rem] z-10 absolute  grid grid-cols-10    !h-max !w-max  ">
            {allParcels().map((parcel, key) => (
              <div key={key} className={parcelStyleMapView}>
                <a
                  onClick={() => {
                    setSelectedParcel(coordinatesObject(parcel[0])),
                      console.log(parcel[0]);
                  }}
                  className=" active:backdrop-brightness-50 opacity-50 xl:opacity-10 xl:hover:opacity-100 h-full w-full flex items-center justify-center   text-center absolute z-50 text-white  text-[16px]"
                >
                  {parcel[0] - 9}
                </a>
                {parcel.map((land, index) => (
                  <p key={index} className={landStyleMapView(land)}></p>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
