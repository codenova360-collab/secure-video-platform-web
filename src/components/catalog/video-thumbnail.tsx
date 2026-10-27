import Image from "next/image";
import type { CatalogVideo } from "@/lib/api/types";
import { formatDuration, formatMoney } from "@/lib/format";
import { Icon } from "../icons/icon";
import { cn } from "../ui/cn";

/** Deterministic hue for the no-thumbnail placeholder. */
function hueOf(seed: string): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 360;
}

/**
 * 16:9 thumbnail with YouTube-style badges: duration bottom-right, price (or
 * FREE) bottom-left, a lock on paid videos. Ownership/progress badges arrive
 * with purchases and playback.
 */
export function VideoThumbnail({
  video,
  sizes,
  className,
  badges = true,
}: {
  video: Pick<
    CatalogVideo,
    "title" | "thumbnail" | "durationSeconds" | "accessType" | "price" | "slug"
  >;
  sizes: string;
  className?: string;
  badges?: boolean;
}) {
  const hue = hueOf(video.slug);
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl bg-surface",
        className,
      )}
    >
      {video.thumbnail ? (
        <Image
          src={video.thumbnail.url}
          alt=""
          fill
          sizes={sizes}
          // Served from Cloudflare's CDN (R2), so Next's optimizer isn't needed.
          unoptimized
          className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex size-full items-center justify-center transition-transform duration-200 group-hover:scale-[1.03]"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 45% 32%), hsl(${(hue + 40) % 360} 55% 18%))`,
          }}
        >
          <Icon name="play_arrow" size={48} className="text-white/70" />
        </div>
      )}
      {badges && (
        <>
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 rounded bg-black/75 px-1 py-0.5 text-xs font-medium text-white">
            {video.accessType === "PAID" && video.price ? (
              <>
                <Icon name="lock" size={12} />
                {formatMoney(video.price, { compact: true })}
              </>
            ) : (
              "FREE"
            )}
          </span>
          {video.durationSeconds !== null && (
            <span className="absolute right-1.5 bottom-1.5 rounded bg-black/75 px-1 py-0.5 text-xs font-medium text-white">
              {formatDuration(video.durationSeconds)}
            </span>
          )}
        </>
      )}
    </div>
  );
}

/** Circular category avatar (YouTube's channel avatar). */
export function CategoryAvatar({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  const hue = hueOf(name);
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        backgroundColor: `hsl(${hue} 40% 38%)`,
      }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
