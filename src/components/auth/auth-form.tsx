"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons/icon";

export function AuthHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-[28px] leading-9 font-normal">{title}</h1>
      {subtitle && <p className="mt-2 text-base text-text-2">{subtitle}</p>}
    </div>
  );
}

/** Form-level error (not tied to a field). */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
    >
      <Icon name="error" size={20} className="shrink-0" />
      {message}
    </p>
  );
}

/** Footer row: secondary text button on the left, primary on the right. */
export function AuthActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {children}
    </div>
  );
}

export function SuccessNotice({
  icon = "check_circle",
  title,
  children,
}: {
  icon?: "check_circle" | "mail";
  title: string;
  children: ReactNode;
}) {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Icon name={icon} size={28} />
      </span>
      <h1 className="text-[28px] leading-9 font-normal">{title}</h1>
      <div className="text-base text-text-2">{children}</div>
    </div>
  );
}
