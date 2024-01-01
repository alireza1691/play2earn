import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { MintedLand, SelectedParcelType } from "@/lib/types";
import { coordinatesObject, getMintedLandsFromEvents, parcelLands, zeroAddress } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

export default function Map() {
  const { selectedParcel, setSelectedParcel } = useMapContext();
  const { apiData, loading ,mintedLands} = useApiData();


  const allParcels = useMemo(() => {
    let parcelLandsArray = [];
    for (let y = 9; y > -1; y--) {
      for (let x = 0; x < 10; x++) {
        const item = parcelLands((x + 10) * 10, (y + 10) * 10);
        parcelLandsArray.push(item);
      }
    }
    return parcelLandsArray;
  }, []);

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
    return ` xl:w-[10px] xl:h-[10px] w-[7px] h-[7px] bg-black/10 text-white  ${getOwnerFromEvents(land) !== zeroAddress && " !bg-black/30"}`;
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

{/* <div className='flex  z-10 w-[1920px] h-[110rem]   xl:h-[160rem] xl:w-[2560px]  bg-[url(/map/Base.png)] bg-cover overflow-hidden  '>
        <div className=' absolute right-[-58rem] top-0 flex flex-col  -mt-[21.5rem] xl:-mt-[33.5rem]  w-auto'>
        <Image className='    h-[39rem] xl:h-[59.5rem] w-auto' quality={90} src={"/map/Outer5.png"}  width={1000} height={1000} alt='map'/>
        <Image className='  h-[39rem] xl:h-[59.5rem] w-auto' quality={90} src={"/map/Outer6.png"} width={1000} height={1000} alt='map'/>
        <Image className='  h-[39rem] xl:h-[59.5rem] w-auto' quality={90} src={"/map/Outer6.png"} width={1000} height={1000} alt='map'/>
        <Image className=' h-[39rem] xl:h-[59.5rem] w-auto' quality={90} src={"/map/Outer7.png"} width={1000} height={1000} alt='map'/>
        </div>
        <div className=' absolute left-0 top-0 flex flex-col ml-auto -mt-[11.5rem] xl:-mt-[22.5rem]  w-auto'>
        <Image className=' -translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer3.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer2.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer2.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer1.png"} width={100} height={100} alt='map'/>
        </div>
        <div className=' absolute left-1/2 -translate-x-[82%] xl:-translate-x-[81%] top-0 flex flex-row ml-auto -mt-[11.25rem] xl:-mt-[21rem]  w-auto'>
        <Image className=' blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        </div>
        <div className=' absolute left-1/2 -translate-x-[82%] xl:-translate-x-[81%] bottom-0 flex flex-row ml-auto -mb-[14.25rem] xl:-mb-[23rem]  w-auto'>
        <Image className=' blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        </div>
          </div> */}
            {/* <div className='flex  z-10 w-[1920px] h-[110rem]   xl:h-[160rem] xl:w-[2560px]  bg-[url(/map/Base.png)] bg-cover overflow-hidden blur-sm '>
        <div className=' absolute right-0 top-0 flex flex-col ml-auto -mt-[11.5rem] xl:-mt-[33.5rem]  w-auto'>
        <Image className=' translate-x-[60%]  h-[27.25rem] xl:h-[57.5rem] w-auto' quality={90} src={"/map/Outer5.png"}  width={100} height={100} alt='map'/>
        <Image className=' translate-x-2/3  h-[27.25rem] xl:h-[57.5rem] w-auto' quality={90} src={"/map/Outer6.png"} width={100} height={100} alt='map'/>
        <Image className=' translate-x-2/3  h-[27.25rem] xl:h-[57.5rem] w-auto' quality={90} src={"/map/Outer6.png"} width={100} height={100} alt='map'/>
        <Image className=' translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer7.png"} width={100} height={100} alt='map'/>
        </div>
        <div className=' absolute left-0 top-0 flex flex-col ml-auto -mt-[11.5rem] xl:-mt-[22.5rem]  w-auto'>
        <Image className=' -translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer3.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer2.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer2.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm h-[27.25rem] xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer1.png"} width={100} height={100} alt='map'/>
        </div>
        <div className=' absolute left-1/2 -translate-x-[82%] xl:-translate-x-[81%] top-0 flex flex-row ml-auto -mt-[11.25rem] xl:-mt-[21rem]  w-auto'>
        <Image className=' blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        </div>
        <div className=' absolute left-1/2 -translate-x-[82%] xl:-translate-x-[81%] bottom-0 flex flex-row ml-auto -mb-[14.25rem] xl:-mb-[23rem]  w-auto'>
        <Image className=' blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm h-[26.75rem] xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        </div>
          </div> */}
          <div className=" gap-1 top-[34rem] left-[34rem] xl:left-[44.5rem] xl:top-[45rem] z-10 absolute  grid grid-cols-10    !h-max !w-max  ">
            {allParcels.map((parcel, key) => (
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
