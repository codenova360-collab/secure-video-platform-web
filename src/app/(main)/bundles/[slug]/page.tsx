import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BundleThumbnail } from "@/components/catalog/bundle-cards";
import { ShareButton } from "@/components/catalog/share-menu";
import { VideoResultRow } from "@/components/catalog/video-cards";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { getCatalogBundle } from "@/lib/api/catalog";
import { bundleSavings, formatMoney } from "@/lib/format";

export async function generateMetadata(
  props: PageProps<"/bundles/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const bundle = await getCatalogBundle(slug);
  return bundle
    ? { title: bundle.title, description: bundle.summary }
    : { title: "Bundle not found" };
}

async function Bundle({
  params,
}: {
  params: PageProps<"/bundles/[slug]">["params"];
}) {
  const { slug } = await params;
  const bundle = await getCatalogBundle(slug);
  if (!bundle) notFound();
  const savings = bundleSavings(bundle);

  return (
    <div className="mx-auto flex max-w-[1284px] flex-col gap-6 min-[1016px]:flex-row min-[1016px]:items-start">
      {/* Playlist header panel (YouTube playlist page). */}
      <aside className="rounded-2xl bg-gradient-to-b from-accent/25 to-surface p-6 min-[1016px]:sticky min-[1016px]:top-20 min-[1016px]:w-[360px] min-[1016px]:shrink-0">
        <BundleThumbnail bundle={bundle} sizes="360px" />
        <h1 className="mt-4 text-2xl leading-8 font-bold">{bundle.title}</h1>
        <p className="mt-2 text-sm text-text-2">
          Bundle · {bundle.videoCount}{" "}
          {bundle.videoCount === 1 ? "video" : "videos"} ·{" "}
          {bundle.accessDurationDays === null
            ? "Lifetime access"
            : `${bundle.accessDurationDays}-day access`}
        </p>
        <p className="mt-4 text-3xl font-bold">
          {formatMoney(bundle.price, { compact: true })}
        </p>
        {savings && (
          <p className="text-sm text-text-2">
            Worth {formatMoney(bundle.value, { compact: true })} on their own ·
            save {savings}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon="sell"
            disabled
            title="Purchases open soon"
          >
            Buy bundle · opens soon
          </Button>
          <ShareButton slug={bundle.slug} path="bundles" />
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm">
          <Icon
            name="all_inclusive"
            size={20}
            className="shrink-0 text-text-2"
          />
          New videos added to this bundle are included automatically.
        </p>
        {bundle.description && (
          <p className="mt-4 text-sm whitespace-pre-line">
            {bundle.description}
          </p>
        )}
      </aside>

      <section aria-label="Videos in this bundle" className="min-w-0 flex-1">
        <ol className="flex flex-col gap-4">
          {bundle.videos.map((video, index) => (
            <li key={video.id} className="flex items-start gap-3">
              <span className="w-6 shrink-0 pt-2 text-center text-sm text-text-2">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <VideoResultRow video={video} />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function BundlePage(props: PageProps<"/bundles/[slug]">) {
  return (
    <Suspense
      fallback={
        <div aria-hidden className="flex flex-col gap-6 min-[1016px]:flex-row">
          <div className="h-[520px] rounded-2xl bg-surface min-[1016px]:w-[360px]" />
          <div className="flex-1 space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-28 rounded-xl bg-surface" />
            ))}
          </div>
        </div>
      }
    >
      <Bundle params={props.params} />
    </Suspense>
  );
}
