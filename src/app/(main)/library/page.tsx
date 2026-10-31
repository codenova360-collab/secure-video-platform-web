import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BundleThumbnail } from "@/components/catalog/bundle-cards";
import { VideoThumbnail } from "@/components/catalog/video-thumbnail";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { apiGet } from "@/lib/api/server";
import type { Library, LibraryItem } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Library" };

/** "Lifetime access", "Expires in 9 days", "Starts 3 Nov 2026", "Ended 12 Sep 2026". */
function accessNote(item: LibraryItem): string {
  if (item.state === "UPCOMING") return `Starts ${formatDate(item.startsAt)}`;
  if (item.state === "EXPIRED") return `Ended ${formatDate(item.expiresAt!)}`;
  // Renewals keep moving the end date; the subscriptions page has the details.
  if (item.viaSubscription) return "Subscription active";
  if (item.daysLeft === null) return "Lifetime access";
  return item.daysLeft <= 1
    ? "Expires today"
    : `Expires in ${item.daysLeft} days`;
}

function href(item: LibraryItem): string {
  if (item.video) return `/watch/${item.video.slug}`;
  if (item.bundle) return `/bundles/${item.bundle.slug}`;
  return "/plans";
}

function title(item: LibraryItem): string {
  return item.video?.title ?? item.bundle?.title ?? item.plan?.name ?? "";
}

function Card({ item }: { item: LibraryItem }) {
  const expired = item.state === "EXPIRED";
  const soon =
    !item.viaSubscription && item.daysLeft !== null && item.daysLeft <= 14;
  return (
    <article
      className={cn("group flex flex-col gap-2", expired && "opacity-60")}
    >
      <Link href={href(item)} aria-label={title(item)} className="rounded-xl">
        {item.video ? (
          <VideoThumbnail video={item.video} badges={false} sizes="320px" />
        ) : item.bundle ? (
          <BundleThumbnail
            bundle={{
              slug: item.bundle.slug,
              title: item.bundle.title,
              cover: item.bundle.cover,
              previewThumbnails: [],
              videoCount: item.bundle.videoCount,
              summary: "",
              price: { amountMinor: "0", currency: "GHS" },
              value: { amountMinor: "0", currency: "GHS" },
              accessDurationDays: null,
              publishedAt: item.startsAt,
            }}
            sizes="320px"
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-accent to-text p-4 text-center text-white">
            <Icon
              name={item.viaSubscription ? "autorenew" : "workspace_premium"}
              size={40}
            />
            <span className="text-sm font-medium">
              {item.plan?.scope === "ALL_PAID_VIDEOS"
                ? "All paid videos"
                : item.plan?.categories.map((c) => c.name).join(", ")}
            </span>
          </div>
        )}
      </Link>
      <h3 className="line-clamp-2 text-sm font-medium">
        <Link href={href(item)}>{title(item)}</Link>
      </h3>
      <p
        className={cn(
          "flex items-center gap-1 text-xs",
          soon ? "font-medium text-danger" : "text-text-2",
        )}
      >
        <Icon name="schedule" size={14} />
        {accessNote(item)}
      </p>
      {item.viaSubscription && !expired ? (
        <Link
          href="/account/subscriptions"
          className="self-start text-xs font-medium text-accent hover:underline"
        >
          Manage subscription
        </Link>
      ) : expired ? (
        <ButtonLink href={href(item)} variant="tonal" className="self-start">
          {item.viaSubscription ? "Subscribe again" : "Renew"}
        </ButtonLink>
      ) : null}
    </article>
  );
}

function Shelf({
  title: heading,
  items,
}: {
  title: string;
  items: LibraryItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={heading} className="mb-10">
      <h2 className="mb-4 text-xl font-bold">{heading}</h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 min-[1100px]:grid-cols-4">
        {items.map((item) => (
          <Card
            key={`${item.kind}:${href(item)}:${item.startsAt}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

async function Shelves() {
  const { items } = await apiGet<Library>("/me/library");
  if (items.length === 0) {
    return (
      <EmptyState
        icon="video_library"
        title="Your library is empty"
        action={
          <ButtonLink href="/" variant="tonal">
            Browse videos
          </ButtonLink>
        }
      >
        Videos you buy or unlock with a bundle or plan will appear here.
      </EmptyState>
    );
  }
  const live = items.filter((i) => i.state !== "EXPIRED");
  return (
    <>
      <Shelf
        title="Your videos"
        items={live.filter((i) => i.kind === "VIDEO")}
      />
      <Shelf
        title="Your bundles"
        items={live.filter((i) => i.kind === "BUNDLE")}
      />
      <Shelf title="Your plans" items={live.filter((i) => i.kind === "PLAN")} />
      <Shelf
        title="Expired"
        items={items.filter((i) => i.state === "EXPIRED")}
      />
    </>
  );
}

/** "You"-style library: shelves of what the customer owns, with access status. */
export default function LibraryPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Library</h1>
      <Suspense
        fallback={<div aria-hidden className="h-64 rounded-xl bg-surface" />}
      >
        <Shelves />
      </Suspense>
    </>
  );
}
