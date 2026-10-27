"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "../icons/icon";
import { IconButton } from "../ui/button";
import { cn } from "../ui/cn";

/**
 * Pill search bar (YouTube masthead). Below 656px it collapses to a search
 * icon that expands the bar over the masthead.
 */
export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [expanded, setExpanded] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setExpanded(false);
    router.push(`/results?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <IconButton
        icon="search"
        label="Search"
        className="min-[656px]:hidden"
        onClick={() => setExpanded(true)}
      />
      <form
        role="search"
        onSubmit={submit}
        className={cn(
          "items-center",
          expanded
            ? "absolute inset-x-0 top-0 z-10 flex h-14 gap-2 bg-bg px-2"
            : "hidden flex-1 justify-center min-[656px]:flex",
        )}
      >
        {expanded && (
          <IconButton
            icon="arrow_back"
            label="Close search"
            onClick={() => setExpanded(false)}
          />
        )}
        <div className="flex h-10 w-full max-w-[640px]">
          <label htmlFor="masthead-search" className="sr-only">
            Search
          </label>
          <input
            id="masthead-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            autoComplete="off"
            maxLength={200}
            autoFocus={expanded}
            className="h-full min-w-0 flex-1 rounded-l-full border border-divider bg-bg pr-2 pl-4 text-base text-text outline-none placeholder:text-text-2 focus:border-accent"
          />
          <button
            type="submit"
            aria-label="Search"
            title="Search"
            className="flex h-full w-16 items-center justify-center rounded-r-full border border-l-0 border-divider bg-surface text-text hover:bg-surface-hover"
          >
            <Icon name="search" />
          </button>
        </div>
      </form>
    </>
  );
}
