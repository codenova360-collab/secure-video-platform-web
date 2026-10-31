"use client";

import { createContext, use, useSyncExternalStore } from "react";
import { Icon } from "../icons/icon";
import { cn } from "../ui/cn";

const KEY = "watch-theater";
const listeners = new Set<() => void>();
let current: boolean | null = null;

function readTheater(): boolean {
  if (current !== null) return current;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false; // storage blocked: default view
  }
}

function setTheater(on: boolean) {
  current = on;
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    // Not remembered, but still switches for this visit.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const TheaterContext = createContext(false);

/**
 * YouTube's watch layout: player and details on the left, Up next on the
 * right; theater mode makes the player full width with both columns below.
 * One grid, so the player is never remounted when switching. On phones the
 * player sticks to the top while the page scrolls.
 */
export function WatchLayout({
  player,
  details,
  upNext,
}: {
  player: React.ReactNode;
  details: React.ReactNode;
  upNext: React.ReactNode;
}) {
  const theater = useSyncExternalStore(subscribe, readTheater, () => false);
  return (
    <TheaterContext value={theater}>
      <div
        data-theater={theater || undefined}
        className="mx-auto grid max-w-[1754px] grid-cols-1 gap-x-6 min-[1016px]:grid-cols-[minmax(0,1fr)_402px] min-[1016px]:grid-rows-[auto_1fr]"
      >
        <div
          className={cn(
            "sticky top-14 z-20 -mx-4 bg-black sm:mx-0 min-[1016px]:static",
            theater
              ? "min-[1016px]:col-span-2 min-[1016px]:-mx-6 min-[1016px]:-mt-6"
              : "sm:overflow-hidden sm:rounded-xl",
          )}
        >
          <div
            className={cn(
              "relative mx-auto aspect-video w-full",
              // Theater: as wide as fits, without running past the screen.
              theater && "min-[1016px]:max-w-[calc((100vh-169px)*16/9)]",
            )}
          >
            {player}
          </div>
        </div>
        <div
          className={cn(
            "min-w-0 min-[1016px]:col-start-1",
            theater && "min-[1016px]:pt-3",
          )}
        >
          {details}
        </div>
        <aside
          aria-label="Up next"
          className={cn(
            "mt-6 flex flex-col gap-3 min-[1016px]:col-start-2 min-[1016px]:mt-0",
            theater
              ? "min-[1016px]:row-start-2 min-[1016px]:pt-6"
              : "min-[1016px]:row-span-2 min-[1016px]:row-start-1",
          )}
        >
          {upNext}
        </aside>
      </div>
    </TheaterContext>
  );
}

/** Theater mode on/off (desktop only, like YouTube's theater button). */
export function TheaterToggle() {
  const theater = use(TheaterContext);
  return (
    <button
      type="button"
      onClick={() => setTheater(!theater)}
      aria-pressed={theater}
      className="hidden h-9 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium hover:bg-surface-hover min-[1016px]:inline-flex"
    >
      <Icon name="tune" size={20} />
      {theater ? "Default view" : "Theater mode"}
    </button>
  );
}
