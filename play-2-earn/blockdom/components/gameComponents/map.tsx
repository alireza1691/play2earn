import { selectedParcelType } from '@/lib/types';
import { coordinatesObject, parcelLands } from '@/lib/utils';
import React, { useMemo } from 'react'

type mapProps = {
    isParcelSelected: boolean,
    setIsParcelSelected: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedParcel: React.Dispatch<React.SetStateAction<selectedParcelType>>
}

export default function Map({isParcelSelected,setIsParcelSelected,setSelectedParcel}: mapProps) {
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
      const landStyleMapView =
      " xl:w-5 xl:h-5 w-3 h-3 bg-yellow-300  text-white text-[4px]";
    const parcelStyleMapView =
      "relative hover:brightness-75 transition-all cursor-pointer grid grid-cols-10 gap-[2px]  xl:!w-[13rem] !w-[8rem]  !h-auto ";

  return (
    <>
    {!isParcelSelected && (
        <div className="p-10 z-10 absolute left-[0rem]  grid grid-cols-10 gap-1 top-[4rem] !h-[90rem] w-[87rem] xl:h-[180rem] xl:w-[137rem] ">
          {allParcels.map((parcel, key) => (
            <div
              key={key}
              className={parcelStyleMapView}
        
            >
              <a       onClick={() => {
                setIsParcelSelected(true),
                  setSelectedParcel(coordinatesObject(parcel[0])),
                  console.log(parcel[0]);
              }} className=" active:backdrop-brightness-50 opacity-50 xl:opacity-10 xl:hover:opacity-100 h-full w-full flex items-center justify-center   text-center absolute z-50 text-white  text-[25px]">
                {parcel[0] - 9}
              </a>
              {parcel.map((land, index) => (
                <p key={index} className={landStyleMapView}></p>
              ))}
            </div>
          ))}
        </div>
      )}
      </>
  )
}
