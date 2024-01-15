import { useMapContext } from '@/context/map-context';
import { useUserDataContext } from '@/context/user-data-context';
import { defaultImageAddress } from '@/lib/data';
import { landsPInst } from '@/lib/instances';
import CloseIcon from '@/svg/closeIcon';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import LandCard from '../landCard';

export default function LandSlideBarCard() {
    const [imageUrl, setImageUrl] = useState<null | string>(null);
  const { selectedLand} = useMapContext();
  const { ownedLands } = useUserDataContext();

  const getImageUrl = async () => {
    try {      
      const url = await landsPInst.URI();
      console.log(url);
      
      setImageUrl(url);
    } catch (error) {
      setImageUrl(defaultImageAddress)
    }
  }
    useEffect(() => {
        const fetchData = async () => {
          try {
            if (!imageUrl && selectedLand) {
              getImageUrl()
            }
          } catch (error) {
            console.log(error);
          }
        };
        fetchData();
      }, [imageUrl, selectedLand,ownedLands]);
    
  return (
    <div className=" flex justify-center mt- h-[35%] mb-3 flex-shrink ">
    {imageUrl && (
      // <div className=" w-auto  h-auto !p-2 cardBg !rounded-lg darkShadow">
      //   <Image
      //     src={imageUrl}
      //     width={256}
      //     height={364}
      //     alt="card"
      //     className=" h-full w-auto "
      //   />
      // </div>
      <LandCard tokenId={selectedLand?.coordinate || 0}/>
    )}
  </div>
  )
}
