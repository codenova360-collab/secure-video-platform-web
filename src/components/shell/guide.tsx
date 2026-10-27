"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../icons/icon";
import { cn } from "../ui/cn";
import {
  BOTTOM_TABS,
  FOOTER_NAV,
  isActive,
  type NavItem,
  PRIMARY_NAV,
  YOU_NAV,
} from "./nav-items";

/** Full-width guide entry (240px sidebar / drawer). */
function GuideEntry({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const active = isActive(usePathname(), item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-6 rounded-lg px-3 text-sm",
        active
          ? "bg-surface font-medium hover:bg-surface-hover"
          : "hover:bg-surface",
      )}
    >
      <Icon name={item.icon} filled={active} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-divider px-3 py-3 last:border-b-0">
      {title && (
        <h2 className="px-3 pt-1 pb-1 text-base font-medium">{title}</h2>
      )}
      {children}
    </div>
  );
}

/** Expanded guide content, shared by the persistent sidebar and the drawer. */
export function GuideContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main">
      <Section>
        {PRIMARY_NAV.map((item) => (
          <GuideEntry key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </Section>
      <Section title="You">
        {YOU_NAV.map((item) => (
          <GuideEntry key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </Section>
      <Section>
        {FOOTER_NAV.map((item) => (
          <GuideEntry key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </Section>
      <p className="px-6 py-4 text-xs text-text-2">© 2026 Vaultline</p>
    </nav>
  );
}

/** 72px mini guide: icon with a tiny label underneath. */
export function MiniGuide() {
  const pathname = usePathname();
  const items = [...PRIMARY_NAV, YOU_NAV[0]!, BOTTOM_TABS[3]!];
  return (
    <nav aria-label="Main" className="flex flex-col gap-1 px-1 pt-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center gap-1.5 rounded-lg pt-4 pb-3.5 text-[10px] leading-3 hover:bg-surface"
          >
            <Icon name={item.icon} filled={active} />
            <span className="max-w-16 truncate">
              {item.shortLabel ?? item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile bottom tab bar (< 792px): Home · Explore · Library · You. */
export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex h-12 border-t border-divider bg-bg mini:hidden"
    >
      {BOTTOM_TABS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] leading-3"
          >
            <Icon name={item.icon} filled={active} size={22} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
