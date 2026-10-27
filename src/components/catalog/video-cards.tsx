import Link from "next/link";
import type { CatalogVideo } from "@/lib/api/types";
import { accessLabel, timeAgo } from "@/lib/format";
import { ShareMenu } from "./share-menu";
import { CategoryAvatar, VideoThumbnail } from "./video-thumbnail";

const watchHref = (video: Pick<CatalogVideo, "slug">) => `/watch/${video.slug}`;

/** Grid card (YouTube home): thumbnail, category avatar, 2-line title, meta. */
export function VideoCard({ video }: { video: CatalogVideo }) {
  const category = video.categories[0];
  return (
    <article className="group relative flex flex-col gap-3">
      <Link
        href={watchHref(video)}
        className="rounded-xl"
        aria-label={video.title}
      >
        <VideoThumbnail
          video={video}
          sizes="(min-width: 1312px) 25vw, (min-width: 792px) 33vw, 100vw"
        />
      </Link>
      <div className="flex gap-3 pr-6">
        {category ? (
          <CategoryAvatar name={category.name} />
        ) : (
          <span className="size-9 shrink-0" />
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base leading-[22px] font-medium">
            <Link href={watchHref(video)}>{video.title}</Link>
          </h3>
          {category && (
            <Link
              href={`/?category=${category.slug}`}
              className="block truncate text-sm text-text-2 hover:text-text"
            >
              {category.name}
            </Link>
          )}
          <p className="truncate text-sm text-text-2">
            {accessLabel(video)} · {timeAgo(video.publishedAt)}
          </p>
        </div>
      </div>
      <div className="absolute right-0 bottom-6 opacity-100 transition-opacity group-hover:opacity-100 mini:opacity-0 mini:group-focus-within:opacity-100">
        <ShareMenu slug={video.slug} title={video.title} />
      </div>
    </article>
  );
}

/** Search result row (YouTube /results): large thumbnail left, details right. */
export function VideoResultRow({ video }: { video: CatalogVideo }) {
  const category = video.categories[0];
  return (
    <article className="group flex flex-col gap-3 min-[600px]:flex-row min-[600px]:gap-4">
      <Link
        href={watchHref(video)}
        className="shrink-0 rounded-xl min-[600px]:w-[360px]"
        aria-label={video.title}
      >
        <VideoThumbnail video={video} sizes="(min-width: 600px) 360px, 100vw" />
      </Link>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-lg leading-[26px] font-normal">
          <Link href={watchHref(video)}>{video.title}</Link>
        </h3>
        <p className="mt-1 text-xs text-text-2">
          {accessLabel(video)} · {timeAgo(video.publishedAt)}
        </p>
        {category && (
          <Link
            href={`/?category=${category.slug}`}
            className="mt-3 flex items-center gap-2 text-xs text-text-2 hover:text-text"
          >
            <CategoryAvatar name={category.name} size={24} />
            {category.name}
          </Link>
        )}
        {video.summary && (
          <p className="mt-3 line-clamp-2 text-xs text-text-2">
            {video.summary}
          </p>
        )}
      </div>
    </article>
  );
}

/** "Up next" compact card (YouTube watch sidebar): 168px thumbnail + text. */
export function CompactVideoCard({ video }: { video: CatalogVideo }) {
  return (
    <article className="group flex gap-2">
      <Link
        href={watchHref(video)}
        className="w-[168px] shrink-0 rounded-lg"
        aria-label={video.title}
      >
        <VideoThumbnail video={video} sizes="168px" className="rounded-lg" />
      </Link>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm leading-5 font-medium">
          <Link href={watchHref(video)}>{video.title}</Link>
        </h3>
        {video.categories[0] && (
          <p className="mt-1 truncate text-xs text-text-2">
            {video.categories[0].name}
          </p>
        )}
        <p className="truncate text-xs text-text-2">{accessLabel(video)}</p>
      </div>
    </article>
  );
}

export function VideoGrid({ videos }: { videos: CatalogVideo[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-10 min-[560px]:grid-cols-2 min-[1000px]:grid-cols-3 min-[1500px]:grid-cols-4 min-[2100px]:grid-cols-5">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-x-4 gap-y-10 min-[560px]:grid-cols-2 min-[1000px]:grid-cols-3 min-[1500px]:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="aspect-video rounded-xl bg-surface" />
          <div className="flex gap-3">
            <div className="size-9 shrink-0 rounded-full bg-surface" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-11/12 rounded bg-surface" />
              <div className="h-3 w-2/3 rounded bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
