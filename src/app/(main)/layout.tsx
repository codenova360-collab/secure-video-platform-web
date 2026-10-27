import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import {
  EmailBanner,
  UserArea,
  UserAreaSkeleton,
} from "@/components/shell/user-area";

/**
 * Pages inside the YouTube-style shell. The shell itself is static; the
 * session-dependent parts stream in behind <Suspense> (Cache Components).
 */
export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      userArea={
        <Suspense fallback={<UserAreaSkeleton />}>
          <UserArea />
        </Suspense>
      }
      banner={
        <Suspense fallback={null}>
          <EmailBanner />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
