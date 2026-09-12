"use client";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useUserDataContext } from "@/context/user-data-context";
import { armyCapacity, warriorsInfo } from "@/lib/data";
import ArmyCapacityIcon from "@/svg/armyCapacityIcon";
import { warriorWeaponIcons } from "@/svg/weaponIcons";
import { useAddress } from "@thirdweb-dev/react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

/**
 * A glance at the garrison standing on the land currently in view.
 *
 * The army was only legible from inside the barracks window, which meant
 * opening a modal to answer "what do I have".
 *
 * One row per type, each led by its weapon rather than its portrait: the
 * painted warriors in public/warriors need ~40px before they are tellable
 * apart, and at that size six of them is a panel, not a glance.
 *
 * Counts come from `inViewLand.army` — Town.getArmy, six numbers in the
 * contract's own order. warriorsInfo and warriorWeaponIcons are both kept in
 * that order, so index i is the same warrior in all three.
 */
export default function ArmyOverview() {
  const { inViewLand, ownedLands } = useUserDataContext();
  const { disbandArmy } = useBlockchainUtilsContext();
  const address = useAddress();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  /**
   * Which types are being disbanded, and how many.
   *
   * Disbanding lives here rather than in the barracks because this is where
   * the capacity bar is: the reason to disband is that the bar is full and
   * something better wants the room. Nothing is refunded, so the panel makes
   * you type the number and confirm rather than offering a one-click button
   * next to each count.
   */
  const [disbanding, setDisbanding] = useState(false);
  const [toDisband, setToDisband] = useState<number[]>(Array(6).fill(0));

  // Only the town screens have a garrison to talk about.
  const onTownScreen =
    pathname.includes("myLand") || pathname.includes("/land/");
  if (!onTownScreen || !address || !inViewLand) return null;

  const counts = warriorsInfo.map((_, index) =>
    Number(inViewLand.army[index] ?? 0)
  );
  // Only the owner can disband, and only what is actually standing there.
  const isMine = !!ownedLands?.some(
    (land) => Number(land.tokenId) === inViewLand.tokenId
  );
  const disbandTotal = toDisband.reduce((sum, n) => sum + n, 0);
  const disbandValid =
    disbandTotal > 0 && toDisband.every((n, i) => n >= 0 && n <= counts[i]);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const capacity = armyCapacity(Number(inViewLand.trainingCampLvl));
  const unlocked = Number(inViewLand.barracksLvl);
  const filled = capacity > 0 ? Math.min((total / capacity) * 100, 100) : 0;

  return (
    <div className="z-30 absolute top-[7.75rem] right-3 sm:right-10 w-[12.5rem] greenBg overflow-hidden">
      <button
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="army-overview-list"
        title={open ? "Hide army" : "Show army"}
        className="w-full select-none flex flex-row items-center gap-2 px-3 py-2 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[color:var(--pw-accent)]"
      >
        <ArmyCapacityIcon />
        <span className="text-[10px] tracking-[0.14em] uppercase text-[color:var(--pw-muted)]">
          Army
        </span>
        <span className="ml-auto text-[12px] tabular-nums">
          <span className="text-[color:var(--pw-accent)]">{total}</span>
          <span className="text-[color:var(--pw-muted)]">/{capacity}</span>
        </span>
        {/* The only thing that said this panel opened was that it happened to
            be open. The chevron turns with it, so the header reads as a
            control whichever state it is in. */}
        <IoIosArrowDown
          aria-hidden
          className={`text-[color:var(--pw-muted)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Capacity, drawn here rather than with CapacityProgressBar — this one
          is a 2px rule sitting flush under the header. */}
      <div className="h-[2px] w-full bg-[color:var(--pw-line)]">
        <div
          className="h-full bg-[color:var(--pw-accent)] transition-all"
          style={{ width: `${filled}%` }}
        />
      </div>

      {/*
        Collapsed by animating grid-template-rows from 0fr to 1fr rather than a
        max-height guess: the list is six rows of text whose height depends on
        the font, and a max-height large enough to be safe makes the open and
        close run at visibly different speeds.
      */}
      <div
        id="army-overview-list"
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul className="overflow-hidden flex flex-col border-t border-[color:var(--pw-line)]">
          {warriorsInfo.map((warrior, index) => {
            const WeaponIcon = warriorWeaponIcons[index];
            const count = counts[index];
            const locked = index >= unlocked;
            return (
              <li
                key={warrior.name}
                title={
                  locked
                    ? `${warrior.name} — unlocks at barracks level ${index + 1}`
                    : `${warrior.name}: ${count}`
                }
                className={`flex flex-row items-center gap-2 px-3 py-[5px] ${
                  index > 0 ? "border-t border-[color:var(--pw-line)]/60" : ""
                } ${locked ? "opacity-30" : count === 0 ? "opacity-55" : ""}`}
              >
                <span className="text-[color:var(--pw-accent)] flex-shrink-0">
                  <WeaponIcon size={17} />
                </span>
                <span className="text-[12px] truncate">{warrior.name}</span>
                {disbanding && !locked && count > 0 ? (
                  <input
                    type="number"
                    min={0}
                    max={count}
                    value={toDisband[index] || ""}
                    placeholder="0"
                    onChange={(event) => {
                      const next = [...toDisband];
                      // Clamped here rather than only on submit, so the number
                      // shown is always one the contract would accept.
                      next[index] = Math.max(
                        0,
                        Math.min(count, Number(event.target.value) || 0)
                      );
                      setToDisband(next);
                    }}
                    className="ml-auto w-[3.25rem] rounded-[3px] bg-black/50 px-1 py-[1px] text-right text-[12px] tabular-nums outline-none focus:ring-1 focus:ring-[color:var(--pw-accent)]"
                  />
                ) : (
                  <span className="ml-auto text-[12px] tabular-nums">
                    {locked ? "—" : count}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Disbanding frees capacity and gives nothing back, so it is folded away
          behind a link rather than sitting next to the counts where it could be
          hit by accident. */}
      {isMine && total > 0 && open && (
        <div className="border-t border-[color:var(--pw-line)] px-3 py-2">
          {!disbanding ? (
            <button
              onClick={() => setDisbanding(true)}
              className="text-[10px] text-[color:var(--pw-muted)] transition-colors hover:text-white/80"
            >
              Disband warriors
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] leading-relaxed text-[color:var(--pw-muted)]">
                Frees capacity. Nothing is refunded — these warriors are gone.
              </p>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => {
                    setDisbanding(false);
                    setToDisband(Array(6).fill(0));
                  }}
                  className="flex-1 rounded-[3px] bg-white/10 py-[5px] text-[11px] transition-colors hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    disbandArmy(toDisband);
                    setDisbanding(false);
                    setToDisband(Array(6).fill(0));
                  }}
                  disabled={!disbandValid}
                  className="flex-1 rounded-[3px] bg-[#E8767C]/80 py-[5px] text-[11px] text-black font-semibold transition-colors hover:bg-[#E8767C] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Disband {disbandTotal > 0 ? disbandTotal : ""}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
