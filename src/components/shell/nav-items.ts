import type { IconName } from "../icons/icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Shorter label for the 72px mini guide and bottom tabs. */
  shortLabel?: string;
}

/** Guide sidebar sections (docs/PROTOTYPE_BRIEF.md §2a). */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/results", label: "Explore", icon: "explore" },
  { href: "/bundles", label: "Bundles", icon: "playlist_play" },
  { href: "/plans", label: "Plans", icon: "workspace_premium" },
];

export const YOU_NAV: NavItem[] = [
  { href: "/library", label: "Library", icon: "video_library" },
  { href: "/account/purchases", label: "Purchases", icon: "receipt_long" },
  {
    href: "/account/subscriptions",
    label: "Subscriptions & plans",
    icon: "card_membership",
    shortLabel: "Plans",
  },
  { href: "/library#continue", label: "Continue watching", icon: "history" },
];

export const FOOTER_NAV: NavItem[] = [
  { href: "/account", label: "Settings", icon: "settings" },
  { href: "/help", label: "Help", icon: "help" },
];

/** Mobile bottom tab bar: Home · Explore · Library · You. */
export const BOTTOM_TABS: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/results", label: "Explore", icon: "explore" },
  { href: "/library", label: "Library", icon: "video_library" },
  { href: "/account", label: "You", icon: "account_circle" },
];

export function isActive(pathname: string, href: string): boolean {
  const path = href.split("#")[0]!;
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}
