import Link from "next/link";

export const APP_NAME = "Vaultline";

/**
 * Placeholder brand mark: a rounded square with a keyhole (fictional;
 * replaced when the client's brand is supplied). Uses the accent token.
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <circle cx="16" cy="13" r="4.5" fill="var(--on-accent)" />
      <path d="M13.5 15.5h5L20 24h-8z" fill="var(--on-accent)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      aria-label={`${APP_NAME} home`}
      className="flex h-10 items-center gap-1.5 rounded-lg px-1"
    >
      <LogoMark />
      <span className="text-xl font-bold tracking-tight text-text">
        {APP_NAME}
      </span>
    </Link>
  );
}
