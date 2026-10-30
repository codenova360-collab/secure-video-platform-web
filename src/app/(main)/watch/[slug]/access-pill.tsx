import { Icon } from "@/components/icons/icon";
import { BuyButton } from "@/components/commerce/buy-button";
import { getVideoAccess } from "@/lib/api/server";
import type { CatalogVideoDetail } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

/** The Buy pill (starts checkout; signed-out visitors go to sign-in). */
export function BuyPill({
  video,
  label = "Buy",
}: {
  video: CatalogVideoDetail;
  label?: string;
}) {
  if (video.accessType !== "PAID" || !video.price) return null;
  return (
    <BuyButton productType="VIDEO" slug={video.slug}>
      {label} {formatMoney(video.price, { compact: true })}
    </BuyButton>
  );
}

/**
 * Primary action pill: "Owned", "Included in your plan", "Renew", or Buy.
 * Per-customer, so it renders inside <Suspense> (BuyPill is the fallback).
 */
export async function AccessPill({ video }: { video: CatalogVideoDetail }) {
  const access = await getVideoAccess(video.slug);
  if (access?.canWatch && access.via !== "FREE") {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface px-4 text-sm font-medium">
        <Icon name="check_circle" size={20} className="text-success" />
        {access.via === "PLAN" ? "Included in your plan" : "Owned"}
      </span>
    );
  }
  if (access?.reason === "EXPIRED")
    return <BuyPill video={video} label="Renew" />;
  return <BuyPill video={video} />;
}
