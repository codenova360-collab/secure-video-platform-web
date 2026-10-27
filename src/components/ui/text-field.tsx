"use client";

import { type ComponentProps, useId, useState } from "react";
import { Icon } from "../icons/icon";
import { cn } from "./cn";

interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  hint?: string;
  /** Error messages for this field (from API `details`). */
  errors?: string[];
}

/**
 * Outlined text field with a visible label above it (Google/YouTube sign-in
 * style). Errors are announced and linked with aria-describedby.
 */
export function TextField({
  label,
  hint,
  errors,
  type = "text",
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const hasError = !!errors && errors.length > 0;
  const describedBy = [hint && `${id}-hint`, hasError && `${id}-error`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            "h-12 w-full rounded-lg border bg-bg px-3 text-base text-text outline-none transition-colors placeholder:text-text-2 focus:border-accent focus:ring-1 focus:ring-accent",
            hasError ? "border-danger" : "border-divider",
            isPassword && "pr-12",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-text-2 hover:bg-surface-hover"
          >
            <Icon name={revealed ? "visibility_off" : "visibility"} size={20} />
          </button>
        )}
      </div>
      {hint && !hasError && (
        <p id={`${id}-hint`} className="text-xs text-text-2">
          {hint}
        </p>
      )}
      {hasError && (
        <div id={`${id}-error`} className="flex flex-col gap-0.5" role="alert">
          {errors.map((message) => (
            <p
              key={message}
              className="flex items-center gap-1 text-xs text-danger"
            >
              <Icon name="error" size={16} />
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
