import type { ReactNode } from "react";

/** A titled block on a settings page, divided like YouTube Settings. */
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-divider py-6 first:pt-0 last:border-b-0">
      <h2 className="text-base font-medium">{title}</h2>
      {description && <p className="mt-1 text-sm text-text-2">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="h-5 w-40 rounded bg-surface" />
      <div className="h-12 w-full max-w-md rounded-lg bg-surface" />
      <div className="h-12 w-full max-w-md rounded-lg bg-surface" />
    </div>
  );
}
