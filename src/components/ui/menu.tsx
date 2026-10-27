"use client";

import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Icon, type IconName } from "../icons/icon";
import { cn } from "./cn";

interface MenuProps {
  /** Renders the trigger; spread `props` onto the trigger button. */
  trigger: (props: {
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  }) => ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

/**
 * Dropdown menu (YouTube style: rounded 12px, shadow, icon + label rows).
 * Closes on outside click, Escape, or choosing an item.
 */
export function Menu({
  trigger,
  children,
  align = "end",
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    rootRef.current
      ?.querySelector<HTMLElement>("[role=menuitem],[role=menuitemradio]")
      ?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="relative">
      {trigger({
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": id,
        onClick: () => setOpen((value) => !value),
      })}
      {open && (
        <div
          id={id}
          role="menu"
          onClick={(event) => {
            const item = (event.target as HTMLElement).closest(
              "[role=menuitem],[role=menuitemradio]",
            );
            if (item && !item.hasAttribute("data-keep-open")) close();
          }}
          className={cn(
            "absolute top-full z-50 mt-1 min-w-56 overflow-hidden rounded-xl bg-menu py-2 shadow-[0_4px_32px_rgba(0,0,0,0.1)] ring-1 ring-black/5",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const ITEM =
  "flex h-10 w-full items-center gap-4 px-4 text-left text-sm text-text hover:bg-surface-hover focus:bg-surface-hover focus:outline-none";

export function MenuItem({
  icon,
  children,
  onSelect,
  href,
  trailing,
  keepOpen = false,
  selected,
}: {
  icon?: IconName;
  children: ReactNode;
  onSelect?: () => void;
  href?: string;
  trailing?: ReactNode;
  /** Don't close the menu (e.g. opening a sub-panel). */
  keepOpen?: boolean;
  /** For single-choice lists (renders a check, sets aria-checked). */
  selected?: boolean;
}) {
  const content = (
    <>
      {selected !== undefined ? (
        <span className="inline-flex size-6 items-center justify-center">
          {selected && <Icon name="check" />}
        </span>
      ) : (
        icon && <Icon name={icon} />
      )}
      <span className="flex-1">{children}</span>
      {trailing}
    </>
  );
  return href ? (
    <Link href={href} role="menuitem" className={ITEM}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      role={selected !== undefined ? "menuitemradio" : "menuitem"}
      aria-checked={selected}
      data-keep-open={keepOpen || undefined}
      className={ITEM}
      onClick={onSelect}
    >
      {content}
    </button>
  );
}

export function MenuDivider() {
  return <div role="separator" className="my-2 h-px bg-divider" />;
}
