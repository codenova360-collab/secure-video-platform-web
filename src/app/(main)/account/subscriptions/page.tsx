import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";
import type { SubscriptionList as SubscriptionListResponse } from "@/lib/api/types";
import { SubscriptionList } from "./subscription-list";

export const metadata: Metadata = { title: "Subscriptions" };

async function Subscriptions() {
  let subscriptions: SubscriptionListResponse["subscriptions"];
  try {
    ({ subscriptions } =
      await apiGet<SubscriptionListResponse>("/subscriptions"));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?next=/account/subscriptions");
    }
    throw error;
  }
  return <SubscriptionList subscriptions={subscriptions} />;
}

/** Subscriptions: status, next payment, update card, cancel. */
export default function SubscriptionsPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Subscriptions</h1>
      <p className="mb-6 text-sm text-text-2">
        Subscriptions renew automatically by card. Cancel any time — you keep
        access until the end of the period you’ve paid for.
      </p>
      <Suspense
        fallback={<div aria-hidden className="h-40 rounded-xl bg-surface" />}
      >
        <Subscriptions />
      </Suspense>
    </>
  );
}
