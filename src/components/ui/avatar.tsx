import { cn } from "./cn";

/** Deterministic hue so each person keeps the same avatar color. */
function hueOf(seed: string): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 360;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Circular initial avatar (YouTube shows a colored letter when no photo). */
export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        backgroundColor: `hsl(${hueOf(name)} 45% 40%)`,
      }}
    >
      {initialsOf(name).slice(0, 1)}
    </span>
  );
}
