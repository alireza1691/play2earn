"use client";
import { useApiData } from "@/context/api-data-context";
import { useMapContext } from "@/context/map-context";
import { useUserDataContext } from "@/context/user-data-context";
import { parcelCoordRange } from "@/lib/utils";
import { landsMainnetPInst, landsPInst, landsRead } from "@/lib/instances";
import { useAddress } from "@thirdweb-dev/react";
import { formatEther } from "ethers/lib/utils";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { isSepolia, useDeployment } from "@/lib/deployments";

/** Total lands the contract can ever mint: a 100x100 grid, x and y in 100..199. */
const TOTAL_LANDS = 10000;

/**
 * World readout for the explore map: how much of the world is gone, what a
 * land costs right now, how much of it is yours, and where you are looking.
 *
 * Rendered as badges in the top-left corner, in the same block as the $PLOT
 * balance badge above them, so the map keeps its full width.
 *
 * Everything here is live — minted lands come from the explorer logs the map
 * itself is drawn from, the price is read off the Lands contract, and the
 * coordinates follow the parcel you have open.
 */
export default function ExploreStats() {
  const { mintedLands, loading } = useApiData();
  const { ownedLands } = useUserDataContext();
  const { selectedParcel } = useMapContext();
  const address = useAddress();

  const pathname = usePathname();
  const isTestnet = pathname.includes("/testnet/");
  const deployment = useDeployment();

  const [price, setPrice] = useState<string | null>(null);

  // The mint price is a contract read, not an event, so it is fetched here
  // rather than taken from api-data-context. It only changes when the owner
  // changes it, so once per mount is enough.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const instance = landsRead(deployment);
        const raw = await instance.getPrice();
        // formatEther keeps every decimal place; the price is a round number
        // of ETH, so drop the trailing zeros.
        if (!cancelled) setPrice(String(parseFloat(formatEther(raw))));
      } catch (error) {
        // A price we cannot read is shown as "—" rather than a wrong number.
        console.log("Mint price read failed", error);
        if (!cancelled) setPrice(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isTestnet]);

  const minted = mintedLands?.length ?? null;
  const pending = <span className="spinnerSm align-middle" />;

  return (
    // Slots in under the $PLOT badge, which only exists once a wallet is
    // connected — with none, these move up into its place.
    <div
      className={`${
        address ? "top-[124px]" : "top-[80px]"
      } ml-5 z-30 absolute left-0 flex flex-row flex-wrap gap-2 pr-4 max-w-[100dvw]`}
    >
      <div className="pwBadge">
        <span className="pwBadgeLabel">Lands</span>
        <span className="pwBadgeValue">
          {minted === null ? (loading ? pending : "—") : minted.toLocaleString("en-US")}
          <span className="pwBadgeUnit">/{TOTAL_LANDS.toLocaleString("en-US")}</span>
        </span>
      </div>

      {/* The two deployments look identical otherwise, so say which one. */}
      {deployment === "v4-testnet" && (
        <div className="pwBadge">
          <span className="pwBadgeLabel">Build</span>
          <span className="pwBadgeValue !text-[color:var(--pw-accent)]">v4</span>
        </div>
      )}

      <div className="pwBadge">
        <span className="pwBadgeLabel">Price</span>
        <span className="pwBadgeValue">
          {price === null ? pending : price}
          <span className="pwBadgeUnit">{isSepolia(deployment) ? "SEP" : "POL"}</span>
        </span>
      </div>

      <div className="pwBadge">
        <span className="pwBadgeLabel">Yours</span>
        <span className="pwBadgeValue !text-[color:var(--pw-accent)]">
          {address ? ownedLands?.length ?? 0 : "—"}
        </span>
      </div>

      <div className="pwBadge">
        <span className="pwBadgeLabel">Coord</span>
        <span className="pwBadgeValue !font-normal !text-[13px] !tracking-[0.08em] !font-[family-name:var(--pw-mono)]">
          {/* The same span the centred header shows, so the two agree. This
              printed only the origin, which named the parcel without saying
              it reached nine coordinates further in each direction. */}
          {`${parcelCoordRange(selectedParcel).from} → ${
            parcelCoordRange(selectedParcel).to
          }`}
        </span>
      </div>
    </div>
  );
}
