import { tokenIdAsString } from "@/lib/utils";
import Image from "next/image";
import React from "react";

type LandCardProps = {
  tokenId: number;
};
export default function LandCard({ tokenId }: LandCardProps) {


  return (
    <div className="relative  flex flex-shrink h-[17rem] md:h-[20rem] w-fit glassBg px-2 py-2">
        <h3 className=" text-[14px] text-[#98FBD7] absolute right-[20%] top-[7%]">{tokenIdAsString(tokenId)}</h3>
      <Image
      className="h-[100%] w-auto "
        src={"/cards/landCardBlankNumber.png"}
        width={240}
        height={360}
        alt="card"
      />
    </div>
  );
}
