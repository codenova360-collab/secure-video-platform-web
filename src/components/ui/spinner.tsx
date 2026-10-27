import { cn } from "./cn";

export function Spinner({
  size = 24,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
