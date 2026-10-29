import Link from "next/link";
import type { ReactNode } from "react";

/** YouTube home shelf: title row with "View all", then a horizontal row. */
export function Shelf({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="my-10 border-t border-divider pt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link
          href={href}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10"
        >
          View all
        </Link>
      </div>
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 [&>*]:w-[min(320px,80vw)] [&>*]:shrink-0 [&>*]:snap-start">
        {children}
      </div>
    </section>
  );
}
