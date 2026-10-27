import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "../icons/icon";
import { cn } from "./cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "tonal" | "outline" | "text";

const VARIANTS: Record<ButtonVariant, string> = {
  // Filled accent pill (YouTube's primary "Subscribe"-style button, in teal).
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  // Gray pill (YouTube's secondary action buttons).
  tonal:
    "bg-surface text-text hover:bg-surface-hover active:bg-surface-pressed",
  // Outlined pill (YouTube's "Sign in" button).
  outline:
    "border border-divider text-accent hover:bg-accent/10 active:bg-accent/20",
  // Text button (dialog actions).
  text: "text-accent hover:bg-accent/10 active:bg-accent/20",
};

const BASE =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-40";

interface CommonProps {
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "tonal",
  icon,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], icon && "pl-3", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size={18} /> : icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "tonal",
  icon,
  className,
  children,
  ...props
}: Omit<CommonProps, "loading"> & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], icon && "pl-3", className)}
      {...props}
    >
      {icon && <Icon name={icon} size={20} />}
      {children}
    </Link>
  );
}

/** Circular icon-only button (YouTube masthead and menu buttons). */
export function IconButton({
  icon,
  label,
  size = 40,
  className,
  type = "button",
  ...props
}: {
  icon: IconName;
  label: string;
  size?: number;
} & ComponentProps<"button">) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-hover active:bg-surface-pressed disabled:opacity-40",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <Icon name={icon} size={24} />
    </button>
  );
}
