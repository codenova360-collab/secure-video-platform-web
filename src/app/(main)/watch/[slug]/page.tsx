import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DescriptionBox } from "@/components/catalog/description-box";
import { ShareButton } from "@/components/catalog/share-menu";
import { CompactVideoCard } from "@/components/catalog/video-cards";
import {
  CategoryAvatar,
  VideoThumbnail,
} from "@/components/catalog/video-thumbnail";
import { Button } from "@/components/ui/button";
import { getCatalogCategories, getCatalogVideo } from "@/lib/api/catalog";
import { accessLabel, formatDate, formatMoney } from "@/lib/format";
import { PlayerGate } from "./player-gate";

export async function generateMetadata(
  props: PageProps<"/watch/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getCatalogVideo(slug);
  return data
    ? { title: data.video.title, description: data.video.summary }
    : { title: "Video not found" };
}

async function Watch({
  params,
}: {
  params: PageProps<"/watch/[slug]">["params"];
}) {
  const { slug } = await params;
  const [data, categories] = await Promise.all([
    getCatalogVideo(slug),
    getCatalogCategories(),
  ]);
  if (!data) notFound();
  const { video, related } = data;
  const category = video.categories[0];
  const categoryCount = categories.find(
    (c) => c.slug === category?.slug,
  )?.videoCount;

  return (
    <div className="mx-auto flex max-w-[1754px] flex-col gap-6 min-[1016px]:flex-row">
      <div className="min-w-0 flex-1">
        {/* Player area: poster + access message until playback arrives (Phase 8). */}
        <div className="relative overflow-hidden rounded-xl bg-black">
          <VideoThumbnail
            video={video}
            sizes="(min-width: 1016px) 70vw, 100vw"
            badges={false}
            className="rounded-none"
          />
          <Suspense fallback={<div className="absolute inset-0 bg-black/65" />}>
            <PlayerGate video={video} />
          </Suspense>
        </div>

        <h1 className="mt-3 text-xl leading-7 font-bold">{video.title}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {category ? (
            <Link
              href={`/?category=${category.slug}`}
              className="flex items-center gap-3"
            >
              <CategoryAvatar name={category.name} size={40} />
              <span>
                <span className="block text-base font-medium">
                  {category.name}
                </span>
                {categoryCount !== undefined && (
                  <span className="block text-xs text-text-2">
                    {categoryCount} {categoryCount === 1 ? "video" : "videos"}
                  </span>
                )}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
            {video.accessType === "PAID" && video.price && (
              <Button
                variant="primary"
                icon="sell"
                disabled
                title="Purchases open soon"
              >
                Buy {formatMoney(video.price, { compact: true })}
              </Button>
            )}
            <ShareButton slug={video.slug} />
          </div>
        </div>

        <div className="mt-4">
          <DescriptionBox
            meta={`${accessLabel(video)} · Added ${formatDate(video.publishedAt)}`}
            description={video.description}
            extra={
              video.categories.length > 1 ? (
                <p className="mt-3 text-sm">
                  Categories:{" "}
                  {video.categories.map((c, index) => (
                    <span key={c.slug}>
                      {index > 0 && ", "}
                      <Link
                        href={`/?category=${c.slug}`}
                        className="text-accent hover:underline"
                      >
                        {c.name}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : undefined
            }
          />
        </div>
      </div>

      <aside
        aria-label="Up next"
        className="flex flex-col gap-3 min-[1016px]:w-[402px] min-[1016px]:shrink-0"
      >
        <h2 className="text-base font-medium">Up next</h2>
        {related.length === 0 ? (
          <p className="text-sm text-text-2">More videos are on the way.</p>
        ) : (
          related.map((item) => <CompactVideoCard key={item.id} video={item} />)
        )}
      </aside>
    </div>
  );
}

function WatchSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex max-w-[1754px] flex-col gap-6 min-[1016px]:flex-row"
    >
      <div className="flex-1">
        <div className="aspect-video rounded-xl bg-surface" />
        <div className="mt-3 h-6 w-2/3 rounded bg-surface" />
      </div>
      <div className="flex flex-col gap-3 min-[1016px]:w-[402px]">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-2">
            <div className="aspect-video w-[168px] rounded-lg bg-surface" />
            <div className="h-4 flex-1 rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** YouTube-style watch page: player + details left, "Up next" right. */
export default function WatchPage(props: PageProps<"/watch/[slug]">) {
  return (
    <Suspense fallback={<WatchSkeleton />}>
      <Watch params={props.params} />
    </Suspense>
  );
}
