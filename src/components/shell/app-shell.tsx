"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { IconButton } from "../ui/button";
import { cn } from "../ui/cn";
import { BottomTabs, GuideContent, MiniGuide } from "./guide";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";

const FULL_GUIDE_QUERY = "(min-width: 1312px)";

/**
 * youtube.com-style shell (docs/PROTOTYPE_BRIEF.md §2a):
 * - ≥ 1312px: persistent 240px guide; the hamburger toggles it to the mini guide;
 * - 792–1311px: 72px mini guide; the hamburger opens the guide as a drawer;
 * - < 792px: no side guide; bottom tab bar; the hamburger opens the drawer.
 *
 * `userArea` and `banner` are server-rendered slots (they read the session
 * and stream in behind <Suspense>).
 */
export function AppShell({
  userArea,
  banner,
  children,
}: {
  userArea: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [fullGuideCollapsed, setFullGuideCollapsed] = useState(false);
  // The drawer belongs to the page it was opened on, so it closes by itself
  // when the route changes (no effect needed).
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawerOpen = drawerPath === pathname;
  const setDrawerOpen = (open: boolean) =>
    setDrawerPath(open ? pathname : null);

  const toggleGuide = () => {
    if (window.matchMedia(FULL_GUIDE_QUERY).matches) {
      setFullGuideCollapsed((value) => !value);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-lg focus:bg-bg focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-4 bg-bg px-4">
        <div className="flex shrink-0 items-center gap-2">
          <IconButton
            icon="menu"
            label="Guide"
            aria-expanded={drawerOpen || !fullGuideCollapsed}
            onClick={toggleGuide}
          />
          <Logo />
        </div>
        <SearchBox />
        <div className="flex shrink-0 items-center gap-2">{userArea}</div>
      </header>

      {/* Persistent guide (wide screens) */}
      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-20 hidden w-60 overflow-y-auto bg-bg",
          !fullGuideCollapsed && "guide:block",
        )}
      >
        <GuideContent />
      </aside>
      {/* Mini guide (medium screens, or wide screens with the guide collapsed) */}
      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 z-20 hidden w-[72px] bg-bg mini:block",
          !fullGuideCollapsed && "guide:hidden",
        )}
      >
        <MiniGuide />
      </aside>

      {/* Drawer guide (medium and small screens) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 guide:hidden">
          <button
            type="button"
            aria-label="Close guide"
            className="absolute inset-0 bg-scrim"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Guide"
            className="absolute inset-y-0 left-0 w-60 overflow-y-auto bg-bg"
          >
            <div className="flex h-14 items-center gap-2 px-4">
              <IconButton
                icon="menu"
                label="Close guide"
                onClick={() => setDrawerOpen(false)}
              />
              <Logo />
            </div>
            <GuideContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div
        className={cn(
          "pt-14 pb-12 mini:pb-0 mini:pl-[72px]",
          !fullGuideCollapsed && "guide:pl-60",
        )}
      >
        {banner}
        <main id="content" className="px-4 py-6 mini:px-6">
          {children}
        </main>
      </div>

      <BottomTabs />
    </div>
  );
}
