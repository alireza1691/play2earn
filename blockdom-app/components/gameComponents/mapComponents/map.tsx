"use client";
import { useMapContext } from "@/context/map-context";
import { allLands, coordinatesObject, zeroAddress } from "@/lib/utils";
import { isRewrite, mapTilesFor, useDeployment } from "@/lib/deployments";
import React, { useMemo } from "react";
import { ownerOf, useLandOwners } from "./useLandOwners";
import { Relation, useLandClans } from "./useLandClans";

// The world map never changes shape, so build it once at module level instead
// of regenerating 10.000 coordinates on every render.
const ALL_PARCELS = allLands();

const parcelStyleMapView =
  "mapParcel relative hover:bg-black/20 hover:brightness-75 transition-all cursor-pointer";
const parcelStyleMapViewV4 =
  "mapParcel mapParcelV4 relative hover:bg-[#98FBD7]/10 hover:shadow-[inset_0_0_0_1px_#98FBD7] transition-all cursor-pointer";

/**
 * A minted land, coloured by who holds it.
 *
 * The world map used to paint every owned land the same colour, which in the v4
 * skin was the product accent — so a parcel holding two enemies read as
 * entirely friendly until you opened it and found red markers inside. The two
 * zoom levels have to agree about who owns what, so this is the same three-way
 * split TownMarker uses in the parcel view, in the same hues.
 */
const OWNED_TONE: Record<Relation, string> = {
  mine: "bg-[#98FBD7]/45",
  ally: "bg-[#7FB2FF]/45",
  enemy: "bg-[#FF6969]/45",
};

/** v3 kept its muted look, but it lied about ownership in exactly the same way. */
const OWNED_TONE_V3: Record<Relation, string> = {
  mine: "bg-[#98FBD7]/55",
  ally: "bg-[#7FB2FF]/55",
  enemy: "bg-[#FF6969]/55",
};

export default function Map() {
  const { selectedParcel, setSelectedParcel } = useMapContext();
  const owners = useLandOwners();
  const { relationTo } = useLandClans();
  const deployment = useDeployment();
  const v4 = isRewrite(deployment);

  // Per parcel, the grid slots that are owned. Everything else is painted by
  // the .mapParcel background pattern, so unowned lands cost no DOM at all.
  const ownedSlots = useMemo(
    () =>
      ALL_PARCELS.map((parcel) => {
        const slots: { slot: number; tone: Relation }[] = [];
        for (let i = 0; i < parcel.length; i++) {
          const owner = ownerOf(owners, parcel[i]);
          if (owner !== zeroAddress) {
            slots.push({ slot: i, tone: relationTo(owner) });
          }
        }
        return slots;
      }),
    [owners, relationTo]
  );

  if (selectedParcel != null) return null;

  return (
    <>
      {/*
        The island, as one 50KB SVG (~5KB over the wire) in place of nine 1024px
        PNGs. It used to be nine <img> in a 3-column grid, each forced to
        !w-[160rem] (2560px) inside an 853px column — so they overflowed and
        painted over each other instead of forming the island. One image also
        avoids the hairline seams nine of them leave, since a third of 2560px is
        not a whole number of pixels. next/image cannot optimise SVG, so a plain
        <img> is the right tag here.
      */}
      {/*
        max-w-none is load-bearing: Tailwind's preflight puts max-width:100% on
        every img, which would clamp the map to the viewport while the parcel
        grid below keeps its fixed pixel offsets — the grid then hangs off the
        east coast. The square 1920/2560 box is what centres the island on the
        grid at both breakpoints.
      */}
      <img
        className="block z-10 max-w-none w-[1920px] h-[120rem] xl:h-[160rem] xl:w-[2560px]"
        src={`${mapTilesFor(deployment)}/World.svg`}
        alt=""
      />

      <div className=" gap-1 top-[34rem] left-[34rem] xl:left-[44.8rem] xl:top-[44.8rem] z-10 absolute  grid grid-cols-10    !h-max !w-max  ">
        {ALL_PARCELS.map((parcel, key) => (
          <div key={key} className={v4 ? parcelStyleMapViewV4 : parcelStyleMapView}>
            <a
              onClick={() => setSelectedParcel(coordinatesObject(parcel[0]))}
              className=" active:backdrop-brightness-50 opacity-50 xl:opacity-10 xl:hover:opacity-100 h-full w-full flex items-center justify-center   text-center absolute z-50 text-white  text-[16px]"
            >
              {parcel[0] - 9}
            </a>
            {ownedSlots[key].length > 0 && (
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-[1px]">
                {/*
                  A minted land used to be a black square, which read as damage
                  to the map. v4 tints it with the product accent instead, so
                  settlement is the thing you see spreading.
                */}
                {ownedSlots[key].map(({ slot, tone }) => (
                  <span
                    key={slot}
                    className={(v4 ? OWNED_TONE : OWNED_TONE_V3)[tone]}
                    style={{
                      gridColumnStart: (slot % 10) + 1,
                      gridRowStart: Math.floor(slot / 10) + 1,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
