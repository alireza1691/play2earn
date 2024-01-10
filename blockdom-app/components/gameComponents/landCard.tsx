import Image from "next/image";
import React from "react";

type LandCardProps = {
  tokenId: number;
};
export default function LandCard({ tokenId }: LandCardProps) {

    const tokenIdAsString = (tokenIdAsNumber:number ) => {
        const middleIndex = Math.ceil(tokenIdAsNumber.toString().length / 2);
        const formattedString = tokenIdAsNumber.toString().slice(0, middleIndex) + " " + tokenIdAsNumber.toString().slice(middleIndex);
        return formattedString
    }
  return (
    <div className="relative  flex flex-shrink min-h-[15rem] min-w-[10rem] glassBg px-2 py-2">
        <h3 className=" text-[14px] text-[#98FBD7] absolute right-[20%] top-[7%]">{tokenIdAsString(tokenId)}</h3>
      <Image
      className=" h-full w-auto "
        src={"/cards/landCardBlankNumber.png"}
        width={240}
        height={360}
        alt="card"
      />
    </div>
  );
}
