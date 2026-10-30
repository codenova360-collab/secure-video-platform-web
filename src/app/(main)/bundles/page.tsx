import type { Metadata } from "next";
import { Suspense } from "react";
import { BundleGrid } from "@/components/catalog/bundle-cards";
import { VideoGridSkeleton } from "@/components/catalog/video-cards";
import { EmptyState } from "@/components/ui/empty-state";
import { getCatalogBundles } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Bundles",
  description:
    "Video bundles: buy a collection for less than its videos on their own.",
};

async function Bundles() {
  const bundles = await getCatalogBundles();
  return bundles.length === 0 ? (
    <EmptyState icon="playlist_play" title="No bundles yet">
      Bundles of videos will appear here.
    </EmptyState>
  ) : (
    <BundleGrid bundles={bundles} />
  );
}

/** All published bundles, as a playlist-card grid. */
export default function BundlesPage() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Bundles</h1>
        <p className="mt-1 text-sm text-text-2">
          Collections of videos at one price. New videos added to a bundle are
          yours automatically.
        </p>
      </header>
      <Suspense fallback={<VideoGridSkeleton />}>
        <Bundles />
      </Suspense>
    </>
  );
}
