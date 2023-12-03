import DoubleSword from "@/svg/doubleSword";
import Image from "next/image";
import React, { useState } from "react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";
import { IoIosArrowDown } from "react-icons/io";



export default function Attack() {
  const [selectedLand, setSelectedLand] = useState<number | null>(101101)
  const [dropDown, setDropDown] = useState<boolean>(false)

  const Lands = [101101,105105]
  return (
    <section className="top-[6rem] w-[90%] h-[50rem] absolute left-1/2 -translate-x-1/2 ">
      <div className=" flex flex-col bg-[#21302A]/60 w-full h-full border-[#D4D4D4]/30 bg-gradient-to-r from-[#A8834C]/20 to-[#6AA84C]/20 rounded-xl border">
        <div className=" flex flex-row justify-around h-full ">
          <div className=" flex flex-col items-center ">
            <Image className=" -translate-x-[8px]" src={"/svg/gameItems/landCard.svg"} height={364} width={256} alt="card"/>
            <div className="relative">
            <a onClick={() => {dropDown ? setDropDown(false) : setDropDown(true)}} className=" cursor-pointer flex flex-row justify-between items-center bg-[#06291D]/50 text-[#98FBD7] font-medium text-[16px] w-[226px] px-6 py-3 rounded-xl ">
              {selectedLand}
              <IoIosArrowDown/>
            </a>
            {dropDown && <div className=" absolute w-[220px] mt-2 bg-gradient-to-r from-[#34594B] to-[#213830] rounded-lg border border-[#D4D4D4]/20">
            {Lands.map((land,key) => (
              <ul className=" px-3 py-2">{land}</ul>
            ))}
            </div>}
            </div>
  
            {/* <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="bordered" 
          className=" bg-[#06291D]/50 border-0 w-[230px] text-[#98FBD7] font-medium text-[16px] justify-between px-6"
        >
          {selectedLand}<IoIosArrowDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Dynamic Actions" items={Lands} className={"w-[216px] bg-gradient-to-r from-[#34594B] to-[#213830] bg-[#06291D] "} >
        {Lands.map((land,key) => (
       <DropdownItem 

     >
       {land}
     </DropdownItem>
        ))}

      </DropdownMenu>
    </Dropdown> */}
          </div>
          <div className="flex flex-col justify-center">
            <DoubleSword />
          </div>
          <div></div>
        </div>
        <div className="p-3">
          {" "}
          <button className="redButton mt-auto !w-full">Attack</button>
        </div>
      </div>
    </section>
  );
}
