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
    <div className=" flex justify-center  mb-3 flex-shrink h-[10rem]">
    {imageUrl && (
    
      <LandCard tokenId={selectedLand?.coordinate || 0}/>
    )}
  </div>
  )
}
