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

const INTERVALS = {
  MONTHLY: { per: "month", every: "Billed monthly" },
  QUARTERLY: { per: "3 months", every: "Billed every 3 months" },
  BIANNUALLY: { per: "6 months", every: "Billed every 6 months" },
  ANNUALLY: { per: "year", every: "Billed yearly" },
} as const;

/** "GH₵ 59 / month" or "GH₵ 99". */
export function planPrice(plan: {
  price: { amountMinor: string; currency: string };
  billingType: "ONE_TIME" | "RECURRING";
  billingInterval: keyof typeof INTERVALS | null;
}): string {
  const price = formatMoney(plan.price, { compact: true });
  return plan.billingType === "RECURRING" && plan.billingInterval
    ? `${price} / ${INTERVALS[plan.billingInterval].per}`
    : price;
}

/** "Billed monthly · cancel anytime", "30 days of access", "Lifetime access". */
export function planTerm(plan: {
  billingType: "ONE_TIME" | "RECURRING";
  billingInterval: keyof typeof INTERVALS | null;
  durationDays: number | null;
}): string {
  if (plan.billingType === "RECURRING" && plan.billingInterval)
    return `${INTERVALS[plan.billingInterval].every} · cancel anytime`;
  return plan.durationDays === null
    ? "Lifetime access · pay once"
    : `${plan.durationDays} days of access · pay once`;
}

/** Savings of a bundle against buying its videos one by one, or null. */
export function bundleSavings(bundle: {
  price: { amountMinor: string; currency: string };
  value: { amountMinor: string; currency: string };
}): string | null {
  const saved =
    BigInt(bundle.value.amountMinor) - BigInt(bundle.price.amountMinor);
  return saved > 0n
    ? formatMoney(
        { amountMinor: saved.toString(), currency: bundle.price.currency },
        { compact: true },
      )
    : null;
}
