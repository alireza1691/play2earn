"use client";
import { useSelectedWindowContext } from "@/context/selected-window-context";
import { useUserDataContext } from "@/context/user-data-context";
import { routeFor, useDeployment } from "@/lib/deployments";
import { MintedLand } from "@/lib/types";
import CloseIcon from "@/svg/closeIcon";
import { useRouter } from "next/navigation";
import React from "react";
import LandCard from "./landCard";

/**
 * "Which of your lands?" — the step between the My land link and the town.
 *
 * A wallet with several lands used to be dropped on whichever one came first
 * out of the event log, and the only way to reach the others was the toggle at
 * the foot of the town screen, which is easy to miss and only exists once you
 * are already somewhere. Asking up front makes the choice the first thing that
 * happens, and one land still goes straight through — see `useOpenMyLand`.
 *
 * Picking writes `?town=`, which is what `lib/urlState.ts#townFromLocation`
 * reads back, so a refresh comes back to the land the player chose rather than
 * to the default. `setChosenLand` alongside it is what makes the switch
 * immediate: the navbar's loader keys on the selection, not on the URL.
 */
/**
 * What the My land links do.
 *
 * One land needs no question asked, so it goes straight to the town; several
 * open the picker. Shared by the desktop navbar and the mobile bottom bar so
 * the two cannot answer that question differently.
 */
export function useOpenMyLand() {
  const { ownedLands } = useUserDataContext();
  const { setSelectedWindowComponent } = useSelectedWindowContext();
  const deployment = useDeployment();
  const router = useRouter();

  return () => {
    if (!ownedLands || ownedLands.length === 0) return;
    if (ownedLands.length > 1) {
      setSelectedWindowComponent("landPicker");
      return;
    }
    router.push(routeFor(deployment, "myLand"));
  };
}

export default function LandPicker() {
  const { selectedWindowComponent, setSelectedWindowComponent } =
    useSelectedWindowContext();
  const { ownedLands, chosenLand, setChosenLand, setIsUserDataLoading } =
    useUserDataContext();
  const deployment = useDeployment();
  const router = useRouter();

  if (selectedWindowComponent !== "landPicker") return null;

  const open = (land: MintedLand) => {
    setChosenLand(land);
    setIsUserDataLoading(true);
    setSelectedWindowComponent(null);
    router.push(`${routeFor(deployment, "myLand")}?town=${land.tokenId}`);
  };

  return (
    <>
      {/*
        A backdrop rather than a bare panel: this one opens over the map, which
        is draggable, and a click that lands on the world behind an open modal
        reads as a mis-click every time.
      */}
      <div
        onClick={() => setSelectedWindowComponent(null)}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
      />
      <section className="tokenActionBg fixed left-1/2 top-1/2 z-[61] flex max-h-[80dvh] w-[92dvw] -translate-x-1/2 -translate-y-1/2 flex-col lg:w-[34rem]">
        <div className="flex h-[2rem] flex-row items-center justify-between rounded-[4px] bg-[#0D0F12]/85 px-3 py-1 blueText">
          <h3>Choose a land</h3>
          <button
            onClick={() => setSelectedWindowComponent(null)}
            className="rounded-[4px] p-1 transition-all hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="px-4 pt-3 text-[13px] text-white/60">
          You hold {ownedLands?.length ?? 0} lands. Pick the one to open.
        </p>

        <div className="custom-scrollbar flex flex-wrap justify-center gap-3 overflow-y-auto p-4">
          {ownedLands?.map((land) => {
            const isCurrent = chosenLand?.tokenId === land.tokenId;
            return (
              <button
                key={land.tokenId}
                onClick={() => open(land)}
                data-current={isCurrent}
                className="rounded-[4px] p-[2px] transition-all hover:brightness-125 data-[current=true]:ring-1 data-[current=true]:ring-[color:var(--pw-accent)]"
              >
                <LandCard
                  tokenId={Number(land.tokenId)}
                  imageClassName="w-[6.5rem] h-auto"
                  className="p-1"
                  idClassName="text-[9px] right-[17%] top-[6%]"
                />
                {isCurrent && (
                  <span className="lightGreen block pt-1 text-[10px]">
                    open now
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
