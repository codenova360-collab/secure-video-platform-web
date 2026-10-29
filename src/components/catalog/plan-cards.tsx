import Link from "next/link";
import type { CatalogPlan } from "@/lib/api/types";
import { planPrice, planTerm } from "@/lib/format";
import { Icon } from "../icons/icon";
import { Button } from "../ui/button";

/** Which videos a plan covers, in words. */
export function planScope(plan: CatalogPlan): string {
  const count = `${plan.videoCount} ${plan.videoCount === 1 ? "video" : "videos"}`;
  if (plan.scope === "ALL_PAID_VIDEOS") return `All paid videos · ${count}`;
  return `${plan.categories.map((c) => c.name).join(", ")} · ${count}`;
}

/** Plan card (YouTube Premium-style offer card). */
export function PlanCard({ plan }: { plan: CatalogPlan }) {
  const recurring = plan.billingType === "RECURRING";
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-divider bg-bg p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <Icon name={recurring ? "autorenew" : "workspace_premium"} size={20} />
        {recurring ? "Subscription" : "One-time pass"}
      </div>
      <div>
        <h3 className="text-xl font-medium">{plan.name}</h3>
        <p className="mt-2 text-2xl font-bold">{planPrice(plan)}</p>
        <p className="mt-1 text-sm text-text-2">{planTerm(plan)}</p>
      </div>
      <p className="flex items-start gap-2 text-sm">
        <Icon name="all_inclusive" size={20} className="shrink-0 text-text-2" />
        <span>
          {planScope(plan)}
          <span className="block text-text-2">
            New videos are included automatically.
          </span>
        </span>
      </p>
      {plan.scope === "CATEGORIES" && (
        <p className="flex flex-wrap gap-2">
          {plan.categories.map((c) => (
            <Link
              key={c.slug}
              href={`/?category=${c.slug}`}
              className="rounded-lg bg-surface px-3 py-1 text-xs font-medium hover:bg-surface-hover"
            >
              {c.name}
            </Link>
          ))}
        </p>
      )}
      {plan.description && (
        <p className="line-clamp-3 text-sm text-text-2">{plan.description}</p>
      )}
      <div className="mt-auto">
        <Button
          variant="primary"
          disabled
          title="Purchases open soon"
          className="w-full"
        >
          {recurring ? "Subscribe" : "Get pass"} · opens soon
        </Button>
      </div>
    </article>
  );
}

export function PlanGrid({ plans }: { plans: CatalogPlan[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 min-[1200px]:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.slug} plan={plan} />
      ))}
    </div>
  );
}
