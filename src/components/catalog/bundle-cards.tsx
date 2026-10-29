import Image from "next/image";
import Link from "next/link";
import type { CatalogBundle } from "@/lib/api/types";
import { bundleSavings, formatMoney } from "@/lib/format";
import { Icon } from "../icons/icon";
import { cn } from "../ui/cn";

export const bundleHref = (bundle: Pick<CatalogBundle, "slug">) =>
  `/bundles/${bundle.slug}`;

function lifetimeLabel(days: number | null): string {
  return days === null ? "Lifetime access" : `${days}-day access`;
}

/**
 * YouTube playlist-style thumbnail: two stacked layers above the image and
 * a "N videos" badge. Uses the cover, else the first video's thumbnail.
 */
export function BundleThumbnail({
  bundle,
  sizes,
  className,
}: {
  bundle: CatalogBundle;
  sizes: string;
  className?: string;
}) {
  const image = bundle.cover ?? bundle.previewThumbnails[0] ?? null;
  return (
    <div className={cn("relative pt-2", className)}>
      <div
        aria-hidden
        className="absolute inset-x-4 top-0 h-2 rounded-t-lg bg-text/15"
      />
      <div
        aria-hidden
        className="absolute inset-x-2 top-1 h-2 rounded-t-lg bg-text/30"
      />
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
        {image ? (
          <Image
            src={image.url}
            alt=""
            fill
            sizes={sizes}
            unoptimized
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent to-text">
            <Icon name="playlist_play" size={48} className="text-white/80" />
          </div>
        )}
        <span className="absolute right-1.5 bottom-1.5 inline-flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
          <Icon name="playlist_play" size={14} />
          {bundle.videoCount} {bundle.videoCount === 1 ? "video" : "videos"}
        </span>
      </div>
    </div>
  );
}

/** Grid or shelf card for a bundle. */
export function BundleCard({ bundle }: { bundle: CatalogBundle }) {
  const savings = bundleSavings(bundle);
  return (
    <article className="group flex flex-col gap-3">
      <Link
        href={bundleHref(bundle)}
        aria-label={bundle.title}
        className="rounded-xl"
      >
        <BundleThumbnail
          bundle={bundle}
          sizes="(min-width: 1312px) 25vw, (min-width: 792px) 33vw, 100vw"
        />
      </Link>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-base leading-[22px] font-medium">
          <Link href={bundleHref(bundle)}>{bundle.title}</Link>
        </h3>
        <p className="text-sm text-text-2">
          <span className="font-medium text-text">
            {formatMoney(bundle.price, { compact: true })}
          </span>
          {savings && <> · Save {savings}</>}
        </p>
        <p className="text-sm text-text-2">
          {lifetimeLabel(bundle.accessDurationDays)} · Bundle
        </p>
      </div>
    </article>
  );
}

export function BundleGrid({ bundles }: { bundles: CatalogBundle[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 min-[1100px]:grid-cols-3 min-[1600px]:grid-cols-4">
      {bundles.map((bundle) => (
        <BundleCard key={bundle.slug} bundle={bundle} />
      ))}
    </div>
  );
}
