import React from "react";

/**
 * Where a dispatched army is in the four steps an attack actually takes.
 *
 * The log used to show a countdown and nothing else, which does not say what
 * the countdown is *for* — the same number means "still marching" before the
 * battle and "still walking home" after it. Naming the steps makes the two
 * halves of the trip distinguishable, and makes it obvious that arriving and
 * attacking are separate actions: the army waits at the gates until you tell it
 * to fight.
 */

export type AttackPhase = "marching" | "arrived" | "returning" | "home";

export const PHASES: { id: AttackPhase; label: string; hint: string }[] = [
  { id: "marching", label: "Marching", hint: "On the way to the target" },
  { id: "arrived", label: "At the gates", hint: "Arrived — attack when ready" },
  { id: "returning", label: "Returning", hint: "Marching home after the battle" },
  { id: "home", label: "Home", hint: "Back — collect the survivors and loot" },
];

/**
 * Works the phase out from the same three fields the contract uses: whether the
 * army has turned around, and whether its clock has run out.
 */
export function phaseOf(isReturning: boolean, minutesLeft: number): AttackPhase {
  if (!isReturning) return minutesLeft > 0 ? "marching" : "arrived";
  return minutesLeft > 0 ? "returning" : "home";
}

function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export default function AttackProgress({
  isReturning,
  minutesLeft,
}: {
  isReturning: boolean;
  minutesLeft: number;
}) {
  const current = phaseOf(isReturning, minutesLeft);
  const currentIndex = PHASES.findIndex((p) => p.id === current);
  const waiting = minutesLeft > 0;

  return (
    <div className="w-full px-3 py-2">
      <div className="flex flex-row items-center">
        {PHASES.map((phase, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <React.Fragment key={phase.id}>
              <div
                className="flex flex-col items-center gap-1 min-w-0"
                title={phase.hint}
              >
                <span
                  aria-current={active ? "step" : undefined}
                  className={`h-[10px] w-[10px] rounded-full shrink-0 ${
                    active
                      ? "bg-[color:var(--pw-accent)]"
                      : done
                      ? "bg-[color:var(--pw-accent)]/45"
                      : "bg-white/20"
                  }`}
                />
                <span
                  className={`text-[9px] sm:text-[10px] whitespace-nowrap ${
                    active
                      ? "text-[color:var(--pw-accent)]"
                      : done
                      ? "text-white/50"
                      : "text-white/30"
                  }`}
                >
                  {phase.label}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <span
                  aria-hidden
                  className={`h-[2px] flex-1 mx-1 mb-4 ${
                    i < currentIndex
                      ? "bg-[color:var(--pw-accent)]/45"
                      : "bg-white/15"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <p className="mt-1 text-center text-[10px] sm:text-[11px] text-white/60">
        {PHASES[currentIndex].hint}
        {waiting && ` · ${formatMinutes(minutesLeft)} left`}
      </p>
    </div>
  );
}
