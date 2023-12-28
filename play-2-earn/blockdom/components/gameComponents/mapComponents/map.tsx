import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { MintedLand, SelectedParcelType } from "@/lib/types";
import { coordinatesObject, getMintedLandsFromEvents, parcelLands, zeroAddress } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

export default function Map() {
  const { selectedParcel, setSelectedParcel } = useMapContext();
  const [mintedLands, setMintedLands] = useState<MintedLand[]|null>(null)
  const { apiData, loading} = useApiData();


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
    return ` xl:w-5 xl:h-5 w-3 h-3 bg-black/10   text-white text-[4px] ${getOwnerFromEvents(land) !== zeroAddress && " !bg-black/30"}`;
}
  const parcelStyleMapView =
    "relative hover:bg-black/20 hover:brightness-75 transition-all cursor-pointer grid grid-cols-10 gap-[2px]  xl:!w-[13rem] !w-[8rem]  !h-auto ";

  const gridImages = [
    "/map/Outer3.png",
    "/map/Outer4.png",
    "/map/Outer5.png",
    "/map/Outer2.png",
    "/map/centerParcel.png",
    "/map/Outer6.png",
    "/map/Outer1.png",
    "/map/Outer8.png",
    "/map/Outer7.png",
  ];



  useEffect(()=> {
    const getData =() => {
      if (apiData) {
        const mintedLandsFromEvents = getMintedLandsFromEvents(apiData.result )
        setMintedLands(mintedLandsFromEvents)
      }
    }
    getData()
  },[apiData])
  

  return (
    <>
      {selectedParcel == null && (
        <>
          {/* <div className=" grid grid-cols-3 z-10  xl:h-[160rem] xl:w-[157rem]  bg-[url(/map/Base.png)] bg-cover ">
            {gridImages.map((col, key) => (
              <Image
                className=" xl:h-[53rem] w-auto"
                src={col}
                width={100}
                height={100}
                alt="map"
              />
            ))} */}

            <div className='flex  z-10  xl:h-[160rem] xl:w-[145rem]  bg-[url(/map/Base.png)] bg-cover overflow-hidden blur-sm '>
        <div className=' absolute right-0 top-0 flex flex-col ml-auto -mt-[22.5rem]  w-auto'>
        <Image className=' translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer5.png"} width={100} height={100} alt='map'/>
        <Image className=' translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer6.png"} width={100} height={100} alt='map'/>
        <Image className=' translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer6.png"} width={100} height={100} alt='map'/>
        <Image className=' translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer6.png"} width={100} height={100} alt='map'/>
        <Image className=' translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer7.png"} width={100} height={100} alt='map'/>
        </div>
        <div className=' absolute left-0 top-0 flex flex-col ml-auto -mt-[22.5rem]  w-auto'>
        <Image className=' -translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer3.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer2.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer2.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer2.png"} width={100} height={100} alt='map'/>
        <Image className=' -translate-x-2/3 blur-sm xl:h-[41.5rem] w-auto' quality={10} src={"/map/Outer1.png"} width={100} height={100} alt='map'/>
        </div>
        <div className=' absolute left-1/2 -translate-x-[81%] top-0 flex flex-row ml-auto -mt-[21rem]  w-auto'>
        <Image className=' blur-sm xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer4.png"} width={100} height={100} alt='map'/>
        </div>
        <div className=' absolute left-1/2 -translate-x-[81%] bottom-0 flex flex-row ml-auto -mb-[23rem]  w-auto'>
        <Image className=' blur-sm xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        <Image className='  blur-sm xl:h-[39.5rem] w-auto' quality={10} src={"/map/Outer8.png"} width={100} height={100} alt='map'/>
        </div>
          </div>
          <div className=" xl:mt-[7.5rem] xl:left-[6.25rem] z-10 absolute  grid grid-cols-10 gap-1 top-[4rem] !h-[90rem] w-[87rem] xl:h-[160rem] xl:w-[132rem] ">
            {allParcels.map((parcel, key) => (
              <div key={key} className={parcelStyleMapView}>
                <a
                  onClick={() => {
                    setSelectedParcel(coordinatesObject(parcel[0])),
                      console.log(parcel[0]);
                  }}
                  className=" active:backdrop-brightness-50 opacity-50 xl:opacity-10 xl:hover:opacity-100 h-full w-full flex items-center justify-center   text-center absolute z-50 text-white  text-[25px]"
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
function getOwnerFromEvents(land: any) {
  throw new Error("Function not implemented.");
}

