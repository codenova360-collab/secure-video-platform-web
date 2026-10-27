import type { ReactNode } from "react";
import { Icon, type IconName } from "../icons/icon";

/** Centered empty/placeholder state (YouTube "nothing here yet" pattern). */
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-28 items-center justify-center rounded-full bg-surface text-text-2">
        <Icon name={icon} size={56} />
      </span>
      <h1 className="text-2xl font-normal">{title}</h1>
      {children && <div className="text-sm text-text-2">{children}</div>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
