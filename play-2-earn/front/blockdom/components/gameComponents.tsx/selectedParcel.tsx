import Image from 'next/image';
import React from 'react'

type landSelectorHookProps = {
  setSelectedLand: React.Dispatch<React.SetStateAction<number | null>>,
  setSlideBar: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SelectedParcel({setSelectedLand, setSlideBar}:landSelectorHookProps) {

    let selectedParcel = {x:100, y:100}
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
    <>
    <div className='z-10 absolute top-[4.5rem] h-[3rem] w-full greenHeaderGradient items-center flex justify-center '>
    <h3 className='text-[#98FBD7]'>{selectedParcel.x}{selectedParcel.y}</h3>
        </div>
    <section className='z-10 absolute top-[12.5rem] lg:top-[10.25rem] left-1/2 lg:left-auto 2xl:right-2 lg:-right-[11rem] -translate-x-1/2  2xl:top-[9rem] '>
       
        <a onClick={() => {selectedParcel.x >= 110 && selectedParcel.x - 10}} className=" cursor-pointer z-50  bottom-[3rem] -left-[1rem] lg:bottom-[6.5rem] absolute">
        <Image src={"/svg/gameItems/bottomLeftArrow.svg"} width={65} height={65} alt="arrow"/>
        </a>
        <a onClick={() => {selectedParcel.x <= 190 && selectedParcel.x + 10}} className="cursor-pointer z-50 right-[0rem] bottom-[3.5rem] lg:bottom-[7.5rem] absolute">
        <Image src={"/svg/gameItems/bottomRightArrow.svg"} width={60} height={60} alt="arrow"/>
        </a>
        <a className="cursor-pointer z-50 right-[0rem] top-[3.5rem] lg:top-[7.5rem] absolute">
        <Image src={"/svg/gameItems/topRightArrow.svg"} width={60} height={60} alt="arrow"/>
        </a>
         <a className="z-20 cursor-pointerz-50 left-[0rem] top-[4rem] lg:top-[8rem] absolute">
        <Image src={"/svg/gameItems/topLeftArrow.svg"} width={60} height={60} alt="arrow"/>
        </a>
        <div className='z-10 grid gap-[1px] grid-cols-10 transform viewGrid w-max shadow-black shadow-large '>
        {lands(selectedParcel.x,selectedParcel.y).map((land,key) => (
            <a key={key} onClick={() => { console.log(land),setSelectedLand(land), setSlideBar(true);
            }} className='  cursor-pointer text-black text-[8px] w-[35px] h-[35px] lg:w-[66px] lg:h-[66px] 2xl:w-[70px] 2xl:h-[70px] shadow-md hover:bg-blue-gray-900/10'>
                <Image className=' h-[35px] w-[35px] lg:w-[66px] lg:h-[66px] 2xl:w-[70px] 2xl:h-[70px] absolute -z-10' src={"/parcels/parcel.png"} width={60} height={60} alt="parcel" quality={50}/>
                {land}
            </a>
        ))}
        </div>
    </section>
    </>
  )
}
