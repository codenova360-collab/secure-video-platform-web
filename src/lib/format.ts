/** Price formatting from integer minor units — no floating point. */
export function formatMoney(
  money: { amountMinor: string; currency: string },
  options: { compact?: boolean } = {},
): string {
  const minor = BigInt(money.amountMinor);
  const major = minor / 100n;
  const cents = (minor % 100n).toString().padStart(2, "0");
  const whole = major.toLocaleString("en-GB");
  const symbol = money.currency === "GHS" ? "GH₵" : money.currency;
  if (options.compact && cents === "00") return `${symbol} ${whole}`;
  return `${symbol} ${whole}.${cents}`;
}

/** "Lifetime access", "30-day access", or "Free". */
export function accessLabel(video: {
  accessType: "FREE" | "PAID";
  accessDurationDays: number | null;
}): string {
  if (video.accessType === "FREE") return "Free";
  return video.accessDurationDays === null
    ? "Lifetime access"
    : `${video.accessDurationDays}-day access`;
}

/** YouTube duration badge: "35:10", "1:12:05". */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

/** "3 days ago" style relative time, like YouTube meta lines. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [31_536_000, "year"],
    [2_592_000, "month"],
    [604_800, "week"],
    [86_400, "day"],
    [3_600, "hour"],
    [60, "minute"],
  ];
  for (const [size, name] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${name}${value === 1 ? "" : "s"} ago`;
  }
  return "just now";
}
