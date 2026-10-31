import { Icon } from "@/components/icons/icon";
import { ProtectedPlayer } from "@/components/player/protected-player";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser, getVideoAccess } from "@/lib/api/server";
import type { CatalogVideoDetail } from "@/lib/api/types";
import { accessLabel, formatDate, formatMoney } from "@/lib/format";

/**
 * The player, or why there isn't one. Reads the session, so it renders
 * inside <Suspense>. The API's access check decides here, and again when
 * playback starts and on every heartbeat.
 */
export async function PlayerGate({ video }: { video: CatalogVideoDetail }) {
  const user = await getCurrentUser();
  const next = encodeURIComponent(`/watch/${video.slug}`);

  let title: string;
  let detail: string;
  let action: React.ReactNode = null;
  const icon = "lock";

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
  } else {
    const access = await getVideoAccess(video.slug);
    if (access?.canWatch) {
      return (
        <ProtectedPlayer
          slug={video.slug}
          title={video.title}
          renewHref={`/watch/${video.slug}`}
        />
      );
    }
    if (access?.reason === "NOT_READY") {
      title = "This video isn’t ready to play yet";
      detail = "Check back soon.";
    } else if (access?.reason === "EXPIRED") {
      title = "Your access has ended";
      detail = access.expiredAt
        ? `It ended on ${formatDate(access.expiredAt)}. Renew below to keep watching.`
        : "Renew below to keep watching.";
    } else if (video.accessType === "PAID" && video.price) {
      title = `Buy for ${formatMoney(video.price)} · ${accessLabel(video)}`;
      detail = "Buy it below, or get it in a bundle or with a pass.";
    } else {
      title = "Video playback is coming soon";
      detail = "This video will be available to watch shortly.";
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 px-6 text-center text-white">
      <Icon name={icon} size={40} />
      <p className="text-lg font-medium">{title}</p>
      <p className="max-w-md text-sm text-white/80">{detail}</p>
      {action}
    </div>
  );
}
