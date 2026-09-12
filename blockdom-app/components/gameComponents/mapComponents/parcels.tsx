"use client";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  inViewParcels,
  parcelLands,
  separatedCoordinate,
  zeroAddress,
} from "@/lib/utils";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useMapContext } from "@/context/map-context";
import { selectedParcelType } from "@/lib/types";
import TownMarker from "@/svg/mapIcons/townMarker";
import { ownerOf, useLandOwners } from "./useLandOwners";
import { isWildLand, landTypesSupported, wildFill } from "@/lib/landTypes";
import {
  JungleMarker,
  LONE_WILD,
  neighbourBit,
  wildNeighbourIds,
} from "./jungleMarker";
import { useApiData } from "@/context/api-data-context";
import { Relation, useLandClans } from "./useLandClans";
import { isRewrite, mapTilesFor, useDeployment } from "@/lib/deployments";
import {
  parcelWorldBox,
  rocksInParcel,
  ROCK_FILL,
  ROCK_LIT,
  type Rock,
  type RockPart,
} from "@/lib/mapScenery";

/**
 * Terrain tile behind a single parcel, from the `parcel` set: one tile backs
 * one parcel here, so its coastline hugs the parcel's outer edge. The world
 * view stretches the same nine shapes across the whole island and needs a much
 * deeper inset, which is why it has its own set. See scripts/generateMapTiles.js.
 */
const parcelBg = (x: number, y: number): string | undefined => {
  const west = x == 90;
  const east = x == 200;
  const south = y == 90;
  const north = y == 200;

  if (west && south) return "Outer1";
  if (west && north) return "Outer3";
  if (east && south) return "Outer7";
  if (east && north) return "Outer5";
  if (west) return "Outer2";
  if (east) return "Outer6";
  if (south) return "Outer8";
  if (north) return "Outer4";
  if (x > 90 && x < 200 && y > 90 && y < 200) return "Base";
  return undefined;
};

/**
 * Land ids only exist for x/y in 100..199, so the ring of parcels the 3x3 view
 * shows at the edge of the world (origin 90 or 200) is pure sea: no land can
 * ever be minted there. Painting a 10x10 grid over it advertised 100 lands that
 * do not exist, on top of costing 100 nodes each.
 */
const isPlayable = (x: number, y: number) =>
  x >= 100 && x <= 190 && y >= 100 && y <= 190;

const terrainStyle = (
  x: number,
  y: number,
  tiles: string
): React.CSSProperties => {
  const tile = parcelBg(x, y);
  return {
    "--terrain": tile ? `url(${tiles}/parcel/${tile}.svg)` : "none",
  } as React.CSSProperties;
};

type HoverState = { coord: number; x: number; y: number } | null;

/**
 * How built-up each land is, so the marker can draw the town that is there
 * rather than a shape picked from its id — a level 2 hall with one farm was
 * drawing more buildings than a level 5 with four, purely by chance.
 *
 * Both numbers come from the Town logs api-data-context already fetches: no
 * extra request, and no per-land contract read, which is what would make
 * drawing nine parcels' worth of towns unaffordable.
 */
export type Development = { hall: number; works: number };
const UNBUILT: Development = { hall: 1, works: 0 };

type ParcelProps = {
  parcel: selectedParcelType;
  desktop: boolean;
  /** Root of the deployment's tile set — see mapTilesFor(). */
  tiles: string;
  /** v4 paints the land grid as a hairline instead of a black wash. */
  v4: boolean;
  /** Whether the deployed contracts know about land types — see landTypesSupported(). */
  landTypes: boolean;
  /** Land token id -> what is built on it. */
  built: Map<number, Development>;
  owners: Map<number, string>;
  relationTo: (owner: string) => Relation;
  /** What a wild land is holding, and which of its neighbours are wild too. */
  wildAt: (land: number) => WildState;
};

/**
 * A wild land's drawing state: the mask of wild neighbours, so the canopy grows
 * across a cluster instead of stopping at every plot line, and how far it has
 * regrown since it was last raided.
 */
export type WildState = { neighbours: number; fill: number };

/**
 * Marks a minted land as yours, a clan ally's, or someone else's. The ally tone
 * is the visible half of the clan rule: the contract refuses to march on those
 * lands, so the map must not present them as targets.
 */
const OwnerIcon = ({
  owner,
  built,
  iso,
  relationTo,
}: {
  owner: string;
  /** What stands on this land — drives how big the town is drawn. */
  built: Development;
  /** Desktop only: the mobile grid is flat, with no isometric to cancel. */
  iso: boolean;
  relationTo: (owner: string) => Relation;
}) => (
  <TownMarker
    tone={relationTo(owner)}
    hall={built.hall}
    works={built.works}
    iso={iso}
  />
);

const rockShapes = (rock: Rock, parts: RockPart[]) =>
  parts.map((part, i) => (
    <ellipse
      key={i}
      cx={rock.x + part.dx}
      cy={rock.y + part.dy}
      rx={part.rx}
      ry={part.ry}
    />
  ));

/**
 * The rocks that fall inside this parcel, drawn straight in world coordinates:
 * the viewBox is the parcel's own world box, so no conversion is needed and a
 * rock lands in exactly the spot the world map bakes into World.svg. That is
 * the whole point of ROCKS being a shared table rather than markup — open a
 * parcel and its rocks are where you saw them zoomed out.
 *
 * Rocks sit in the strip outside the parcel grid, so in practice only the sea
 * ring around the selection has any.
 */
const ParcelRocks = memo(function ParcelRocks({
  x,
  y,
}: {
  x: number;
  y: number;
}) {
  const rocks = rocksInParcel(x, y);
  if (rocks.length === 0) return null;

  const box = parcelWorldBox(x, y);
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`${box.x} ${box.y} ${box.size} ${box.size}`}
      preserveAspectRatio="none"
    >
      <g fill={ROCK_FILL} opacity={0.85}>
        {rocks.map((rock, i) => (
          <g key={i}>{rockShapes(rock, rock.body)}</g>
        ))}
      </g>
      <g fill={ROCK_LIT} opacity={0.7}>
        {rocks.map((rock, i) => (
          <g key={i}>{rockShapes(rock, rock.lit)}</g>
        ))}
      </g>
    </svg>
  );
});

/**
 * One of the eight parcels around the selection. They are not clickable, so
 * their 10x10 land grid is painted as a repeating background instead of 100
 * DOM nodes — the same trick .mapParcel uses on the world map. Only owned
 * lands become real elements. Sea parcels get no grid at all.
 */
const NeighbourParcel = memo(function NeighbourParcel({
  parcel,
  desktop,
  tiles,
  v4,
  landTypes,
  built,
  owners,
  relationTo,
  wildAt,
}: ParcelProps) {
  const playable = isPlayable(parcel.x, parcel.y);
  const lands = playable ? parcelLands(parcel.x, parcel.y) : [];

  return (
    <div
      className={`neighbourParcel ${desktop ? "" : "neighbourParcelMobile"} ${
        playable ? "" : "neighbourParcelSea"
      } ${v4 ? "neighbourParcelV4" : ""} relative brightness-50`}
      style={terrainStyle(parcel.x, parcel.y, tiles)}
    >
      <ParcelRocks x={parcel.x} y={parcel.y} />
      {playable && (
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
          {lands.map((land, slot) => {
            const owner = ownerOf(owners, land);
            // Wild parcels are worth drawing here too: they are the raid targets,
            // so a player scanning the neighbours should see where the jungle is
            // without opening every parcel.
            const wild = landTypes && isWildLand(land, owner);
            if (owner === zeroAddress && !wild) return null;
            return (
              <span
                key={land}
                className={`relative ${v4 ? "" : "bg-black/30"}`}
                style={{
                  gridColumnStart: (slot % 10) + 1,
                  gridRowStart: Math.floor(slot / 10) + 1,
                }}
              >
                {wild ? (
                  <JungleMarker landId={land} {...wildAt(land)} />
                ) : (
                  <OwnerIcon owner={owner} built={built.get(land) ?? UNBUILT} iso={desktop} relationTo={relationTo} />
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});

type CentreProps = ParcelProps & {
  onSelect: (coord: number, owner: string) => void;
};

/**
 * The selected parcel: the only 100 lands that are actually clickable, so the
 * only ones that need a node each.
 *
 * The cells used to darken the terrain with backdrop-brightness. That is a
 * backdrop-filter, and 100 of them inside .viewGrid's 3D transform forced the
 * compositor to re-sample the backdrop per cell on every frame — which is what
 * made opening a parcel crawl. A flat black overlay looks the same and costs
 * nothing to composite.
 */
const CentreParcel = memo(function CentreParcel({
  parcel,
  desktop,
  tiles,
  v4,
  landTypes,
  built,
  owners,
  relationTo,
  wildAt,
  onSelect,
}: CentreProps) {
  return (
    <div
      className={`parcelTerrain relative grid w-fit grid-cols-10 ${
        desktop ? "gap-[1px]" : "gap-[2px]"
      }`}
      style={terrainStyle(parcel.x, parcel.y, tiles)}
    >
      {/* Under the land cells, so their tint falls over the rock as it does
          over the terrain, and so the cells stay clickable. */}
      <ParcelRocks x={parcel.x} y={parcel.y} />
      {parcelLands(parcel.x, parcel.y).map((land) => {
        const owner = ownerOf(owners, land);
        const isOwned = owner !== zeroAddress;
        // Wild parcels are not on the market: minting one reverts. Only v4
        // knows about land types, so v3 keeps treating every plot as buyable.
        const wild = landTypes && isWildLand(land, owner);
        return (
          <a
            key={land}
            data-coord={land}
            onClick={() => onSelect(land, owner)}
            title={wild ? "Wild land — raidable, not for sale" : undefined}
            className={`${
              v4
                ? // One hairline and one wash on every land, wild or not. What a
                  // land IS gets said underneath it — worked ground inside a
                  // wall, or canopy over a cache — so the cell itself no longer
                  // has to carry three different treatments. Accent is left to
                  // hover and selection.
                  "bg-[#0D0F12]/[0.08] hover:bg-[#98FBD7]/20 shadow-[inset_0_0_0_1px_rgba(244,244,241,0.11)]"
                : `${
                    isOwned ? "bg-black/40" : "bg-black/25"
                  } hover:bg-black/60 shadow-md`
            } active:bg-black/10 cursor-pointer transition-colors duration-100 relative ${
              desktop
                ? "text-black text-[8px] w-[35px] h-[35px] md:h-[52px] md:w-[52px] 2xl:h-[70px] 2xl:w-[70px]"
                : "text-white/40 p-1 text-[8px] h-[52px] w-[52px] 2xl:h-[70px] 2xl:w-[70px]"
            }`}
          >
            {wild && <JungleMarker landId={land} {...wildAt(land)} />}
            {isOwned && (
              <div className="absolute inset-0">
                <OwnerIcon owner={owner} built={built.get(land) ?? UNBUILT} iso={desktop} relationTo={relationTo} />
              </div>
            )}
            {!desktop && (
              <p className="absolute bottom-0 left-1/2 -translate-x-1/2">
                {land}
              </p>
            )}
          </a>
        );
      })}
    </div>
  );
});

type GridProps = {
  variant: "desktop" | "mobile";
  selectedParcel: selectedParcelType;
  tiles: string;
  v4: boolean;
  /** Whether the deployed contracts know about land types — see landTypesSupported(). */
  landTypes: boolean;
  built: Map<number, Development>;
  owners: Map<number, string>;
  relationTo: (owner: string) => Relation;
  wildAt: (land: number) => WildState;
  onSelect: (coord: number, owner: string) => void;
  onHover: (state: HoverState) => void;
};

/**
 * The 3x3 block of parcels around the selection.
 *
 * Memoised so that moving the tooltip — which changes state on the parent —
 * does not re-render the block.
 */
const ParcelsGrid = memo(function ParcelsGrid({
  variant,
  selectedParcel,
  tiles,
  v4,
  landTypes,
  built,
  owners,
  relationTo,
  wildAt,
  onSelect,
  onHover,
}: GridProps) {
  const desktop = variant === "desktop";

  // One listener per grid instead of a Tooltip component per land.
  const handleOver = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const cell = (event.target as HTMLElement).closest("[data-coord]");
      if (!cell) return onHover(null);
      const box = cell.getBoundingClientRect();
      onHover({
        coord: Number(cell.getAttribute("data-coord")),
        x: box.left + box.width / 2,
        y: box.top,
      });
    },
    [onHover]
  );

  const clear = useCallback(() => onHover(null), [onHover]);

  return (
    <div
      className={
        desktop
          ? "z-10 transition-all invisible md:visible absolute grid gap-[0px] w-[1080px] md:w-[1590px] 2xl:w-[2130px]  grid-cols-3 md:left-[20rem] 2xl:left-[27.5rem] top-0 viewGrid "
          : "z-10 md:-z-10 absolute grid gap-[1px] w-[1590px]  transform grid-cols-3 left-[0rem] top-0 md:invisible "
      }
      onMouseOver={desktop ? handleOver : undefined}
      onMouseLeave={desktop ? clear : undefined}
    >
      {inViewParcels(selectedParcel).map((parcel, key) =>
        key == 4 ? (
          <CentreParcel
            key={key}
            parcel={parcel}
            desktop={desktop}
            tiles={tiles}
            v4={v4}
            landTypes={landTypes}
            built={built}
            owners={owners}
            relationTo={relationTo}
            wildAt={wildAt}
            onSelect={onSelect}
          />
        ) : (
          <NeighbourParcel
            key={key}
            parcel={parcel}
            desktop={desktop}
            tiles={tiles}
            v4={v4}
            landTypes={landTypes}
            built={built}
            owners={owners}
            relationTo={relationTo}
            wildAt={wildAt}
          />
        )
      )}
    </div>
  );
});

export default function Parcels() {
  const { setSelectedWindowComponent } = useSelectedWindowContext();
  const { selectedParcel, setSelectedLand } = useMapContext();
  const owners = useLandOwners();
  const { relationTo } = useLandClans();
  const deployment = useDeployment();
  const tiles = mapTilesFor(deployment);
  const v4 = isRewrite(deployment);
  const landTypes = landTypesSupported(deployment);
  const { buildedResourceBuildings, townhallLevels, lastRaids, logsFetchedAt } =
    useApiData();

  // One pass over the Build log for the whole map, not one lookup per land.
  const built = useMemo(() => {
    const byLand = new Map<number, Development>();
    const reach = (land: number) =>
      byLand.get(land) ?? { hall: 1, works: 0 };

    townhallLevels.forEach((hall, land) =>
      byLand.set(land, { ...reach(land), hall })
    );
    for (const building of buildedResourceBuildings ?? []) {
      const current = reach(building.land);
      byLand.set(building.land, { ...current, works: current.works + 1 });
    }
    return byLand;
  }, [buildedResourceBuildings, townhallLevels]);

  /**
   * Everything a wild land needs to draw itself.
   *
   * The neighbour mask is what lets a cluster grow one canopy: each land asks
   * which of the eight around it are wild too, across parcel borders as well,
   * since `owners` covers the whole map. The fill comes from the Attack logs —
   * see wildFill(), which mirrors the contract's own linear regrowth.
   *
   * The clock is the one the logs were fetched on, not one read here: a value
   * that moves over seven days has no business making a render non-idempotent,
   * and it can only change when the logs do anyway.
   */
  const wildAt = useCallback(
    (land: number) => {
      let neighbours = LONE_WILD;
      for (const { dc, dr, id } of wildNeighbourIds(land)) {
        if (isWildLand(id, ownerOf(owners, id))) neighbours |= neighbourBit(dc, dr);
      }
      return { neighbours, fill: wildFill(lastRaids.get(land), logsFetchedAt) };
    },
    [owners, lastRaids, logsFetchedAt]
  );

  const [hover, setHover] = useState<HoverState>(null);
  // Both grids used to mount at once and were only hidden with CSS, which cost
  // 900 unused cells on every device. Mount the one that is actually visible.
  const [desktop, setDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const onSelect = useCallback(
    (coord: number, owner: string) => {
      setSelectedLand({ coordinate: coord, owner, isMinted: owner != zeroAddress });
      setSelectedWindowComponent("emptyLand");
    },
    [setSelectedLand, setSelectedWindowComponent]
  );

  if (!selectedParcel || desktop === null) return null;

  return (
    <>
      <ParcelsGrid
        variant={desktop ? "desktop" : "mobile"}
        selectedParcel={selectedParcel}
        tiles={tiles}
        v4={v4}
        landTypes={landTypes}
        built={built}
        owners={owners}
        relationTo={relationTo}
        wildAt={wildAt}
        onSelect={onSelect}
        onHover={setHover}
      />
      {hover &&
        createPortal(
          // Rendered into <body> so the parcel grid's 3D transform does not
          // skew it, the same reason the old Tooltip was portalled.
          <div
            className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full capitalize p-2 rounded-[4px] text-[12px] text-white bg-[#0D0F12]/85"
            style={{ left: hover.x, top: hover.y - 6 }}
          >
            {separatedCoordinate(hover.coord.toString())}
          </div>,
          document.body
        )}
    </>
  );
}
