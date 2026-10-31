"use client";

import { useEffect, useState } from "react";

/** Spots the watermark moves between (percent of the player). */
const SPOTS = [
  { left: 6, top: 8 },
  { left: 58, top: 72 },
  { left: 30, top: 40 },
  { left: 62, top: 12 },
  { left: 8, top: 70 },
  { left: 40, top: 22 },
];
const MOVE_EVERY_MS = 20_000;

/**
 * The viewer's masked email and ID, faint and moving, over the video — a
 * deterrent that makes a recording traceable. It doesn't stop recording.
 */
export function Watermark({ text }: { text: string }) {
  const [spot, setSpot] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setSpot((current) => (current + 1) % SPOTS.length),
      MOVE_EVERY_MS,
    );
    return () => clearInterval(timer);
  }, []);
  const { left, top } = SPOTS[spot]!;
  return (
    <div
      aria-hidden="true"
      data-testid="watermark"
      className="pointer-events-none absolute z-10 text-xs font-medium whitespace-nowrap text-white/40 transition-[left,top] duration-[2000ms] select-none [text-shadow:0_1px_2px_rgb(0_0_0/0.6)] motion-reduce:transition-none sm:text-sm"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      {text}
    </div>
  );
}
