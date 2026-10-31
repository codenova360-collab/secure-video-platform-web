"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api/client";
import { messageOf } from "@/lib/api/errors";
import type {
  CardUpdateLink,
  CustomerSubscription,
  SubscriptionResponse,
} from "@/lib/api/types";
import { formatDate, formatMoney, INTERVALS } from "@/lib/format";

const STATUS: Record<
  CustomerSubscription["status"],
  { label: string; className: string }
> = {
  ACTIVE: { label: "Active", className: "bg-success/15 text-success" },
  PAST_DUE: { label: "Payment failed", className: "bg-danger/15 text-danger" },
  NON_RENEWING: { label: "Cancelled", className: "bg-surface text-text-2" },
  CANCELLED: { label: "Ended", className: "bg-surface text-text-2" },
  EXPIRED: { label: "Ended", className: "bg-surface text-text-2" },
};

/** What happens next, in one line. */
export function subscriptionNote(sub: CustomerSubscription): string {
  switch (sub.status) {
    case "ACTIVE":
      return sub.nextPaymentAt
        ? `Renews ${formatDate(sub.nextPaymentAt)}`
        : `Paid until ${formatDate(sub.currentPeriodEnd)}`;
    case "PAST_DUE":
      return `We couldn’t charge your card. Update it before ${formatDate(sub.accessUntil ?? sub.currentPeriodEnd)} to keep watching.`;
    case "NON_RENEWING":
      return `Won’t renew · access until ${formatDate(sub.accessUntil ?? sub.currentPeriodEnd)}`;
    default:
      return `Ended ${formatDate(sub.accessUntil ?? sub.currentPeriodEnd)}`;
  }
}

export function SubscriptionList({
  subscriptions,
}: {
  subscriptions: CustomerSubscription[];
}) {
  const router = useRouter();
  const snackbar = useSnackbar();
  const [confirm, setConfirm] = useState<CustomerSubscription | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon="card_membership"
        title="No subscriptions"
        action={
          <ButtonLink href="/plans" variant="tonal">
            See plans
          </ButtonLink>
        }
      >
        Plans you subscribe to will show here, with the next payment date and
        the option to cancel.
      </EmptyState>
    );
  }

  const cancel = async (sub: CustomerSubscription) => {
    setBusy(`cancel:${sub.id}`);
    try {
      await api<SubscriptionResponse>(`/subscriptions/${sub.id}/cancel`, {
        method: "POST",
      });
      setConfirm(null);
      snackbar("Subscription cancelled — it won’t renew");
      router.refresh();
    } catch (error) {
      snackbar(messageOf(error));
    } finally {
      setBusy(null);
    }
  };

  const updateCard = async (sub: CustomerSubscription) => {
    setBusy(`card:${sub.id}`);
    try {
      const { url } = await api<CardUpdateLink>(
        `/subscriptions/${sub.id}/card-update-link`,
        { method: "POST" },
      );
      window.location.assign(url);
    } catch (error) {
      snackbar(messageOf(error));
      setBusy(null);
    }
  };

  return (
    <>
      <ul className="divide-y divide-divider rounded-xl border border-divider">
        {subscriptions.map((sub) => {
          const status = STATUS[sub.status];
          const ended = sub.status === "CANCELLED" || sub.status === "EXPIRED";
          return (
            <li
              key={sub.id}
              className={cn(
                "flex flex-wrap items-center gap-4 px-4 py-4",
                ended && "opacity-70",
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface">
                <Icon name="autorenew" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {sub.plan.slug ? (
                    <Link href="/plans" className="hover:underline">
                      {sub.plan.name}
                    </Link>
                  ) : (
                    sub.plan.name
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </p>
                <p className="text-sm">
                  {formatMoney(sub.price)} /{" "}
                  {INTERVALS[sub.billingInterval].per}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    sub.status === "PAST_DUE" ? "text-danger" : "text-text-2",
                  )}
                >
                  {subscriptionNote(sub)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sub.canUpdateCard && (
                  <Button
                    variant={sub.status === "PAST_DUE" ? "primary" : "text"}
                    icon="credit_card"
                    loading={busy === `card:${sub.id}`}
                    onClick={() => void updateCard(sub)}
                  >
                    Update card
                  </Button>
                )}
                {sub.canCancel && (
                  <Button variant="text" onClick={() => setConfirm(sub)}>
                    Cancel
                  </Button>
                )}
                {ended && sub.plan.slug && (
                  <ButtonLink href="/plans" variant="tonal">
                    Subscribe again
                  </ButtonLink>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Dialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title="Cancel subscription?"
        actions={
          <>
            <Button variant="text" onClick={() => setConfirm(null)}>
              Keep it
            </Button>
            <Button
              variant="text"
              loading={confirm !== null && busy === `cancel:${confirm.id}`}
              onClick={() => confirm && void cancel(confirm)}
            >
              Cancel subscription
            </Button>
          </>
        }
      >
        {confirm &&
          `${confirm.plan.name} won’t renew and your card won’t be charged again. You keep access until ${formatDate(confirm.currentPeriodEnd)}.`}
      </Dialog>
    </>
  );
}
