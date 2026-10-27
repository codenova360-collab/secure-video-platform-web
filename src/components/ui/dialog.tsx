"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { cn } from "./cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Text buttons, right-aligned (YouTube dialog style). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Modal dialog on the native <dialog> element: focus trapping, Escape to
 * close, and inert background come from the browser.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-32px)] max-w-md rounded-xl bg-menu p-0 text-text shadow-xl backdrop:bg-scrim",
        className,
      )}
    >
      {open && (
        <div className="flex flex-col gap-4 p-6">
          <h2 id={titleId} className="text-xl font-medium">
            {title}
          </h2>
          <div className="text-sm text-text-2">{children}</div>
          {actions && (
            <div className="flex justify-end gap-2 pt-2">{actions}</div>
          )}
        </div>
      )}
    </dialog>
  );
}
