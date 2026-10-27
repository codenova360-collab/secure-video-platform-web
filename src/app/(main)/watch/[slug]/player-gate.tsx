import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/api/server";
import type { CatalogVideoDetail } from "@/lib/api/types";
import { accessLabel, formatMoney } from "@/lib/format";

/**
 * The message over the player. Reads the session, so it renders inside
 * <Suspense>. The API decides real access (purchases arrive in Phase 6 and
 * playback in Phase 8); this only explains the next step to the viewer.
 */
export async function PlayerGate({ video }: { video: CatalogVideoDetail }) {
  const user = await getCurrentUser();
  const next = encodeURIComponent(`/watch/${video.slug}`);

  let title: string;
  let detail: string;
  let action: React.ReactNode = null;

  if (!user) {
    title = "Sign in to watch";
    detail =
      video.accessType === "FREE"
        ? "This video is free with a Vaultline account."
        : `${accessLabel(video)} after purchase.`;
    action = (
      <ButtonLink
        href={`/login?next=${next}`}
        variant="primary"
        icon="account_circle"
      >
        Sign in
      </ButtonLink>
    );
  } else if (!user.emailVerified) {
    title = "Verify your email to watch";
    detail = `We sent a link to ${user.email}. Use the banner above to send it again.`;
  } else if (video.accessType === "PAID" && video.price) {
    title = `Buy for ${formatMoney(video.price)} · ${accessLabel(video)}`;
    detail = "Purchases open soon.";
  } else {
    title = "Video playback is coming soon";
    detail = "This free video will be available to watch shortly.";
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 px-6 text-center text-white">
      <Icon name="lock" size={40} />
      <p className="text-lg font-medium">{title}</p>
      <p className="max-w-md text-sm text-white/80">{detail}</p>
      {action}
    </div>
  );
}
