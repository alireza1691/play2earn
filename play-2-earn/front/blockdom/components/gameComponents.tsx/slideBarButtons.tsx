import React from 'react'

export default function SlideBarButtons() {
    let isMinted = true
    let isEnemy = false
  return (
    <div className="w-full mt-auto flex flex-col">
    <div className="w-full px-3">
      {" "}
      {!isMinted  && <button className= "greenButton !w-full">Price: 0.02 ETH</button>}

    </div>

    <div className=" flex flex-row p-3 gap-2">
   
      {!isMinted  && <button className= "greenButton !w-full">Mint</button>}
      {isMinted && isEnemy && <button className= "outlineGreenButton !w-[50%]">Send help</button> }
      {isMinted && isEnemy &&  <button className= "redButton !w-[50%]">Attack</button>}
      {isMinted && !isEnemy && <button className= "outlineGreenButton !w-[50%]">Send help</button> }
      {isMinted && !isEnemy &&  <button className= "greenButton !w-[50%]">Visit land</button>}
   
    </div>
  </div>
 

  )
}
