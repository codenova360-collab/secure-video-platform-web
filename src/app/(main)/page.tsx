import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Home. The chip bar and video grid get real data in Phase 3 (catalog);
 * until then the page shows the YouTube-style layout with an empty state.
 */
export default function HomePage() {
  return (
    <>
      <div
        role="toolbar"
        aria-label="Filters"
        className="-mx-4 mb-6 flex gap-3 overflow-x-auto px-4 pb-1 mini:-mx-6 mini:px-6"
      >
        <Chip selected>All</Chip>
        <Chip>Free</Chip>
        <Chip>Recently added</Chip>
      </div>
      <EmptyState icon="video_library" title="Videos are coming soon">
        New videos will appear here as soon as they’re published.
      </EmptyState>
    </>
  );
}
