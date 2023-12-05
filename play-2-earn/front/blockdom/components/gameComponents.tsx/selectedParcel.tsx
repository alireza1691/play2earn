import Image from 'next/image';
import React from 'react'

type landSelectorHookProps = {
  setSelectedLand: React.Dispatch<React.SetStateAction<number | null>>,
  setSlideBar: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SelectedParcel({setSelectedLand, setSlideBar}:landSelectorHookProps) {

    const lands = (xFrom: number, yFrom: number) => {
        let items = [];
        for (let x = xFrom; x < xFrom + 10; x++) {
          for (let y = yFrom; y < yFrom + 10; y++) {
            items.push(Number(x.toString()+y.toString()));
          }
        }
        return items
      };
  return (
    <section className=' absolute top-[14.65rem] left-1/2 -translate-x-1/2'>
        <div className=' grid gap-[1px] grid-cols-10 transform viewGrid  '>
        {lands(100,100).map((land,key) => (
            <a key={key} onClick={() => { console.log(land),setSelectedLand(land), setSlideBar(true);
            }} className=' cursor-pointer text-black text-[8px] w-[60px] h-[60px] shadow-md hover:bg-blue-gray-900/10'>
                <Image className=' absolute -z-10' src={"/parcels/parcel.png"} width={60} height={60} alt="parcel" quality={50}/>
                {land}
            </a>
        ))}
        </div>
    </section>
  )
}
