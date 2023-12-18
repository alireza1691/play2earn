"use client"
import WorldVector from '@/svg/worldVector'
import React, { useState } from 'react'

type mapHandlerProps = {
  setIsParcelSelected: React.Dispatch<React.SetStateAction<boolean>>
}

export default function MapHandler({setIsParcelSelected}:mapHandlerProps) {
    const [attackBox, setAttackBox] = useState(false)
  return (
<div className=" absolute z-50 w-[200px] left-1/2 -translate-x-1/2 -top-[2rem]" >
<a onClick={() => {setIsParcelSelected(false)}} className=" z-50 transition-all cursor-pointer shadow-md hover:bg-[#06291D]/40 font- text-[#98FBD7] top-[10rem]  flex flex-row items-center gap-3 rounded-md  absolute bg-[#06291D]/50 px-4 py-3" >
        <WorldVector /> Go to world map
      </a>
</div>
    
  )
}
