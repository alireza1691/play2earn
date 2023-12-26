import { useMapContext } from '@/context/map-context';
import CloseIcon from '@/svg/closeIcon';
import React from 'react'

export default function LandSlideBarHeader() {
    const { selectedLand, setSelectedLand } = useMapContext();

    function shortenAddress(address: string) {
      const firstFour = address.slice(0, 4);
      const lastFour = address.slice(-4);
      return `${firstFour}...${lastFour}`;
    }
  return (
    <div className="px-1 py-2 flex flex-row justify-between relative z-10">
    <h3 className=" text-white ">
      Land {selectedLand && selectedLand?.coordinate}
    </h3>
    {selectedLand?.isMinted && (
      <p className=' absolute left-1/2 -translate-x-1/2 blueText'>{ shortenAddress(selectedLand?.owner)}</p>
    )}
    
    <a
      className=" transition-all closeIcon ml-auto"
      onClick={() => {
        setSelectedLand(null);
      }}
    >
      <CloseIcon />
    </a>
  </div>
  )
}
