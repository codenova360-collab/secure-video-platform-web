import { Suspense } from "react";
import { ChipLinks } from "@/components/catalog/chip-links";
import { VideoGrid, VideoGridSkeleton } from "@/components/catalog/video-cards";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCatalogCategories, getCatalogVideos } from "@/lib/api/catalog";

const PAGE_SIZE = 24;

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

  const [categories, result] = await Promise.all([
    getCatalogCategories(),
    getCatalogVideos({ category, access, page, limit: PAGE_SIZE }),
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
          <VideoGrid videos={result.videos} />
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
