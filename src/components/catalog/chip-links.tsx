import Link from "next/link";
import { cn } from "../ui/cn";

export interface ChipLink {
  label: string;
  href: string;
  selected: boolean;
}

/**
 * Horizontally scrollable chip bar (YouTube home). Chips are links, so
 * filters live in the URL and work without JavaScript.
 */
export function ChipLinks({
  chips,
  label,
}: {
  chips: ChipLink[];
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] mini:-mx-6 mini:px-6"
    >
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          aria-current={chip.selected ? "page" : undefined}
          className={cn(
            "inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
            chip.selected
              ? "bg-text text-bg"
              : "bg-surface text-text hover:bg-surface-hover",
          )}
        >
          {chip.label}
        </Link>
      ))}
    </nav>
  );
}
