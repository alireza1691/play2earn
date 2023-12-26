import { useMapContext } from '@/context/map-context';
import { useUserDataContext } from '@/context/user-data-context';
import { defaultImageAddress } from '@/lib/data';
import { landsPInst } from '@/lib/instances';
import CloseIcon from '@/svg/closeIcon';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

export default function LandSlideBarCard() {
    const [imageUrl, setImageUrl] = useState<null | string>(null);
  const { selectedLand, setSelectedLand } = useMapContext();
  const { ownedLands, isOwnedLand, setIsOwnedLands } = useUserDataContext();

  const getImageUrl = async () => {
    try {      
      const url = await landsPInst.URI();
      setImageUrl(url);
    } catch (error) {
      setImageUrl(defaultImageAddress)
    }
  }
    useEffect(() => {
        const fetchData = async () => {
          try {
            if (!imageUrl) {
              getImageUrl()
            }
            if (selectedLand && ownedLands) {
              if (
                ownedLands.some(
                  (item) => item.tokenId == selectedLand.coordinate.toString()
                )
              ) {
                setIsOwnedLands(true);
              }
            }
            if (!selectedLand) {
              setIsOwnedLands(false);
            }
          } catch (error) {
            console.log(error);
          }
        };
        fetchData();
      }, [imageUrl, selectedLand]);
    
  return (
    <div className=" flex justify-center mt-2 h-[35%]  ">
    {imageUrl && (
      <div className=" w-auto  h-auto !p-2 cardBg !rounded-lg darkShadow">
        <Image
          src={imageUrl}
          width={256}
          height={364}
          alt="card"
          className=" h-full w-auto "
        />
      </div>
    )}
  </div>
  )
}
