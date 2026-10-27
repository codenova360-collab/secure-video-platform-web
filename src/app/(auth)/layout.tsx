import { LogoMark } from "@/components/shell/logo";

/**
 * Sign-in style pages: a centered card on a plain background, the one place
 * the site departs from the YouTube shell (docs/PROTOTYPE_BRIEF.md §2a).
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 mini:bg-surface">
      <main className="w-full max-w-[448px] rounded-3xl bg-bg px-6 py-9 mini:px-10">
        <div className="mb-6">
          <LogoMark size={40} />
        </div>
        {children}
      </main>
    </div>
  );
}
