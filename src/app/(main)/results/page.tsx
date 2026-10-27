import { Suspense } from "react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Search" };

async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/results">["searchParams"];
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  return query ? (
    <EmptyState icon="search" title="No results found">
      Nothing matches “{query}” yet. Try different keywords.
    </EmptyState>
  ) : (
    <EmptyState icon="explore" title="Explore">
      Search for videos, bundles, and plans.
    </EmptyState>
  );
}

/** Search results (YouTube list layout arrives with the catalog in Phase 3). */
export default function ResultsPage(props: PageProps<"/results">) {
  return (
    <Suspense fallback={null}>
      <Results searchParams={props.searchParams} />
    </Suspense>
  );
}
