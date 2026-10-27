import { Suspense } from "react";
import { ChipLinks } from "@/components/catalog/chip-links";
import { VideoResultRow } from "@/components/catalog/video-cards";
import { EmptyState } from "@/components/ui/empty-state";
import { type CatalogQuery, getCatalogVideos } from "@/lib/api/catalog";

export const metadata = { title: "Search" };

const SORTS: Record<string, { label: string; value: CatalogQuery["sort"] }> = {
  newest: { label: "Newest", value: "newest" },
  price_low: { label: "Price: low to high", value: "price_low" },
  price_high: { label: "Price: high to low", value: "price_high" },
  title: { label: "Title A–Z", value: "title" },
};

function one(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/results">["searchParams"];
}) {
  const params = await searchParams;
  const q = (one(params.q) ?? "").trim().slice(0, 100);
  const accessParam = one(params.access);
  const access =
    accessParam === "free" || accessParam === "paid" ? accessParam : undefined;
  const sortKey = one(params.sort) ?? "newest";
  const sort = SORTS[sortKey]?.value ?? "newest";

  const result = await getCatalogVideos({
    q: q || undefined,
    access,
    sort,
    limit: 30,
  });

  const href = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = {
      q: q || undefined,
      access,
      sort: sortKey === "newest" ? undefined : sortKey,
      ...changes,
    };
    for (const [key, value] of Object.entries(merged))
      if (value) next.set(key, value);
    return `/results?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-[1096px]">
      <div className="mb-6 flex flex-col gap-3">
        {q && (
          <h1 className="text-sm text-text-2">
            {result.total} {result.total === 1 ? "result" : "results"} for{" "}
            <span className="font-medium text-text">“{q}”</span>
          </h1>
        )}
        <ChipLinks
          label="Filters"
          chips={[
            {
              label: "All",
              href: href({ access: undefined }),
              selected: !access,
            },
            {
              label: "Free",
              href: href({ access: "free" }),
              selected: access === "free",
            },
            {
              label: "Paid",
              href: href({ access: "paid" }),
              selected: access === "paid",
            },
            ...Object.entries(SORTS).map(([key, sortOption]) => ({
              label: sortOption.label,
              href: href({ sort: key === "newest" ? undefined : key }),
              selected: sortKey === key,
            })),
          ]}
        />
      </div>
      {result.videos.length === 0 ? (
        <EmptyState icon="search" title={q ? "No results found" : "Explore"}>
          {q
            ? "Try different keywords or remove filters."
            : "Search for videos with the search bar above."}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {result.videos.map((video) => (
            <VideoResultRow key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Search results — YouTube list layout. */
export default function ResultsPage(props: PageProps<"/results">) {
  return (
    <Suspense fallback={null}>
      <Results searchParams={props.searchParams} />
    </Suspense>
  );
}
