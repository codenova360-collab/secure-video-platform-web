"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";
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

/**
 * With Cache Components, `usePathname()` suspends on routes whose dynamic
 * params aren't known at build time (e.g. /watch/[slug]). Each nav list
 * therefore renders without an active item as its Suspense fallback, so the
 * shell stays prerendered and only the highlight resolves at request time.
 */
function WithPathname({
  render,
}: {
  render: (pathname: string | null) => ReactNode;
}) {
  return (
    <Suspense fallback={render(null)}>
      <PathnameReader render={render} />
    </Suspense>
  );
}

function PathnameReader({
  render,
}: {
  render: (pathname: string | null) => ReactNode;
}) {
  return render(usePathname());
}

const activeFor = (pathname: string | null, href: string) =>
  pathname !== null && isActive(pathname, href);

/** Full-width guide entry (240px sidebar / drawer). */
function GuideEntry({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string | null;
  onNavigate?: () => void;
}) {
  const active = activeFor(pathname, item.href);
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

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="border-b border-divider px-3 py-3 last:border-b-0">
      {title && (
        <h2 className="px-3 pt-1 pb-1 text-base font-medium">{title}</h2>
      )}
      {children}
    </div>
  );
}

function Entries({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <WithPathname
      render={(pathname) =>
        items.map((item) => (
          <GuideEntry
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))
      }
    />
  );
}

/** Expanded guide content, shared by the persistent sidebar and the drawer. */
export function GuideContent({
  onNavigate,
  categories,
}: {
  onNavigate?: () => void;
  /** Server-rendered categories section (streams in). */
  categories?: ReactNode;
}) {
  return (
    <nav aria-label="Main">
      <Section>
        <Entries items={PRIMARY_NAV} onNavigate={onNavigate} />
      </Section>
      <Section title="You">
        <Entries items={YOU_NAV} onNavigate={onNavigate} />
      </Section>
      {categories}
      <Section>
        <Entries items={FOOTER_NAV} onNavigate={onNavigate} />
      </Section>
      <p className="px-6 py-4 text-xs text-text-2">© 2026 Vaultline</p>
    </nav>
  );
}

/** 72px mini guide: icon with a tiny label underneath. */
export function MiniGuide() {
  const items = [...PRIMARY_NAV, YOU_NAV[0]!, BOTTOM_TABS[3]!];
  return (
    <nav aria-label="Main" className="flex flex-col gap-1 px-1 pt-1">
      <WithPathname
        render={(pathname) =>
          items.map((item) => {
            const active = activeFor(pathname, item.href);
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
          })
        }
      />
    </nav>
  );
}

/** Mobile bottom tab bar (< 792px): Home · Explore · Library · You. */
export function BottomTabs() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex h-12 border-t border-divider bg-bg mini:hidden"
    >
      <WithPathname
        render={(pathname) =>
          BOTTOM_TABS.map((item) => {
            const active = activeFor(pathname, item.href);
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
          })
        }
      />
    </nav>
  );
}
