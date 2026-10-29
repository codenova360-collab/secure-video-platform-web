import { Suspense } from "react";
import { BundleCard } from "@/components/catalog/bundle-cards";
import { ChipLinks } from "@/components/catalog/chip-links";
import { PlanCard } from "@/components/catalog/plan-cards";
import { Shelf } from "@/components/catalog/shelf";
import { VideoGrid, VideoGridSkeleton } from "@/components/catalog/video-cards";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getCatalogBundles,
  getCatalogCategories,
  getCatalogPlans,
  getCatalogVideos,
} from "@/lib/api/catalog";

const PAGE_SIZE = 24;
/** Videos shown above the shelves on the unfiltered home page. */
const FIRST_ROWS = 8;

function one(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function HomeFeed({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const params = await searchParams;
  const category = one(params.category);
  const access =
    one(params.access) === "free" || one(params.access) === "paid"
      ? (one(params.access) as "free" | "paid")
      : undefined;
  const page = Math.max(1, Number(one(params.page)) || 1);

  const showShelves = !category && !access && page === 1;
  const [categories, result, bundles, plans] = await Promise.all([
    getCatalogCategories(),
    getCatalogVideos({ category, access, page, limit: PAGE_SIZE }),
    showShelves ? getCatalogBundles() : [],
    showShelves ? getCatalogPlans() : [],
  ]);

  const chips = [
    { label: "All", href: "/", selected: !category && !access },
    {
      label: "Free",
      href: "/?access=free",
      selected: access === "free" && !category,
    },
    {
      label: "Paid",
      href: "/?access=paid",
      selected: access === "paid" && !category,
    },
    ...categories.map((c) => ({
      label: c.name,
      href: `/?category=${c.slug}`,
      selected: category === c.slug,
    })),
    { label: "Bundles", href: "/bundles", selected: false },
  ];

  const nextHref = (() => {
    const next = new URLSearchParams();
    if (category) next.set("category", category);
    if (access) next.set("access", access);
    next.set("page", String(page + 1));
    return `/?${next.toString()}`;
  })();

  return (
    <>
      <div className="mb-6">
        <ChipLinks label="Filter videos" chips={chips} />
      </div>
      {result.videos.length === 0 ? (
        <EmptyState
          icon="video_library"
          title={
            category || access ? "No videos here yet" : "Videos are coming soon"
          }
          action={
            category || access ? (
              <ButtonLink href="/" variant="tonal">
                See all videos
              </ButtonLink>
            ) : undefined
          }
        >
          {category || access
            ? "Try another filter."
            : "New videos will appear here as soon as they’re published."}
        </EmptyState>
      ) : (
        <>
          {showShelves ? (
            <>
              <VideoGrid videos={result.videos.slice(0, FIRST_ROWS)} />
              {bundles.length > 0 && (
                <Shelf title="Bundles" href="/bundles">
                  {bundles.map((bundle) => (
                    <BundleCard key={bundle.slug} bundle={bundle} />
                  ))}
                </Shelf>
              )}
              {plans.length > 0 && (
                <Shelf title="Plans" href="/plans">
                  {plans.map((plan) => (
                    <PlanCard key={plan.slug} plan={plan} />
                  ))}
                </Shelf>
              )}
              {result.videos.length > FIRST_ROWS && (
                <VideoGrid videos={result.videos.slice(FIRST_ROWS)} />
              )}
            </>
          ) : (
            <VideoGrid videos={result.videos} />
          )}
          {page * PAGE_SIZE < result.total && (
            <div className="mt-10 flex justify-center">
              <ButtonLink href={nextHref} variant="outline">
                More videos
              </ButtonLink>
            </div>
          )}
        </>
      )}
    </>
  );
}

/** Home: chip bar + YouTube-style video grid. Filters live in the URL. */
export default function HomePage(props: PageProps<"/">) {
  return (
    <Suspense
      fallback={
        <>
          <div className="mb-6 h-8" />
          <VideoGridSkeleton />
        </>
      }
    >
      <HomeFeed searchParams={props.searchParams} />
    </Suspense>
  );
}
