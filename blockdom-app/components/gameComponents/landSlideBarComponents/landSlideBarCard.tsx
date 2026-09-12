import { useMapContext } from "@/context/map-context";
import React from "react";
import LandCard from "../landCard";

/**
 * The card used to wait on a landsPInst.URI() call before rendering, but
 * LandCard draws a static image and never read that URL — the contract call
 * only ever gated the card behind one round trip and then threw its result
 * away. The card has everything it needs from the selected land, so it draws
 * straight away.
 */
export default function LandSlideBarCard() {
  const { selectedLand } = useMapContext();

  return (
    <div className=" flex justify-center  mb-3 flex-shrink h-[10rem]">
      {selectedLand && <LandCard tokenId={selectedLand.coordinate} />}
    </div>
  );
}
