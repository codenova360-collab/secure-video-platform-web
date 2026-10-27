"use client";

import { type ReactNode, useState } from "react";

/**
 * YouTube's description box: gray rounded panel with a bold meta line and a
 * truncated description that expands with "...more". Rendered as plain text
 * (never HTML) — descriptions are staff-entered content.
 */
export function DescriptionBox({
  meta,
  description,
  extra,
}: {
  meta: string;
  description: string;
  extra?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const long = description.length > 220 || description.split("\n").length > 3;

  return (
    <div className="rounded-xl bg-surface p-3 text-sm">
      <p className="font-medium">{meta}</p>
      <p
        className={
          expanded || !long
            ? "mt-1 whitespace-pre-line"
            : "mt-1 line-clamp-3 whitespace-pre-line"
        }
      >
        {description || "No description yet."}
      </p>
      {expanded && extra}
      {(long || extra) && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-1 font-medium hover:underline"
        >
          {expanded ? "Show less" : "...more"}
        </button>
      )}
    </div>
  );
}
