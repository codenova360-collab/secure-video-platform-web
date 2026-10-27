"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/account", label: "Account", icon: "account_circle" },
  { href: "/account/password", label: "Password", icon: "key" },
  { href: "/account/devices", label: "Devices", icon: "devices" },
  { href: "/account/appearance", label: "Appearance", icon: "palette" },
  { href: "/account/purchases", label: "Purchases", icon: "receipt_long" },
  {
    href: "/account/subscriptions",
    label: "Subscriptions",
    icon: "card_membership",
  },
];

/** Left list of the settings layout (YouTube Settings). */
export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Settings"
      className="flex gap-1 overflow-x-auto mini:flex-col"
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 shrink-0 items-center gap-4 rounded-lg px-3 text-sm whitespace-nowrap",
              active ? "bg-surface font-medium" : "hover:bg-surface",
            )}
          >
            <Icon name={item.icon} filled={active} size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
