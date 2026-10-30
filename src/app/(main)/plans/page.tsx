import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanGrid } from "@/components/catalog/plan-cards";
import { EmptyState } from "@/components/ui/empty-state";
import { getCatalogPlans } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Plans",
  description: "Passes and subscriptions that unlock many videos at once.",
};

async function Plans() {
  const plans = await getCatalogPlans();
  if (plans.length === 0) {
    return (
      <EmptyState icon="workspace_premium" title="No plans yet">
        Passes and subscriptions will appear here.
      </EmptyState>
    );
  }
  const passes = plans.filter((p) => p.billingType === "ONE_TIME");
  const subscriptions = plans.filter((p) => p.billingType === "RECURRING");
  return (
    <div className="flex flex-col gap-10">
      {subscriptions.length > 0 && (
        <section aria-labelledby="subscriptions">
          <h2 id="subscriptions" className="mb-4 text-xl font-bold">
            Subscriptions
          </h2>
          <PlanGrid plans={subscriptions} />
        </section>
      )}
      {passes.length > 0 && (
        <section aria-labelledby="passes">
          <h2 id="passes" className="mb-4 text-xl font-bold">
            One-time passes
          </h2>
          <PlanGrid plans={passes} />
        </section>
      )}
    </div>
  );
}

/** Access plans: one-time passes and subscriptions. */
export default function PlansPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Plans</h1>
        <p className="mt-1 text-sm text-text-2">
          Unlock many videos at once — including new ones as they’re added.
        </p>
      </header>
      <Suspense
        fallback={
          <div aria-hidden className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-surface" />
            ))}
          </div>
        }
      >
        <Plans />
      </Suspense>
    </>
  );
}
