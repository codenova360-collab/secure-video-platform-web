import type { ComponentProps } from "react";
import { cn } from "./cn";

/**
 * Filter chip (YouTube chip bar): gray pill; the selected chip is inverted.
 */
export function Chip({
  selected = false,
  className,
  children,
  type = "button",
  ...props
}: { selected?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
        selected
          ? "bg-text text-bg"
          : "bg-surface text-text hover:bg-surface-hover",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
