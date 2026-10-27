import { ICON_PATHS, type IconName } from "./paths";

export type { IconName };

interface IconProps {
  name: IconName;
  /** Filled variant — used for the active navigation item, as on YouTube. */
  filled?: boolean;
  size?: number;
  className?: string;
  /** Accessible label; omit for decorative icons next to visible text. */
  label?: string;
}

export function Icon({
  name,
  filled = false,
  size = 24,
  className,
  label,
}: IconProps) {
  const [outlined, fill] = ICON_PATHS[name];
  return (
    <svg
      viewBox="0 -960 960 960"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={filled ? fill : outlined} />
    </svg>
  );
}
