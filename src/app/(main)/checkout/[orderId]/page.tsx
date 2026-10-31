import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PayButton } from "@/components/commerce/pay-button";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";
import type { OrderResponse } from "@/lib/api/types";
import { formatDate, formatMoney, INTERVALS } from "@/lib/format";
import { PRODUCT_LABEL, productHref } from "@/lib/products";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Summary({
  params,
}: {
  params: PageProps<"/checkout/[orderId]">["params"];
}) {
  const { orderId } = await params;
  if (!UUID.test(orderId)) notFound();
  let order: OrderResponse["order"];
  try {
    order = (await apiGet<OrderResponse>(`/orders/${orderId}`)).order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const item = order.items[0];
  const interval = item?.billingInterval
    ? INTERVALS[item.billingInterval]
    : null;
  const subscription = order.kind === "SUBSCRIPTION_START" && interval;
  const perPeriod = interval ? ` / ${interval.per}` : "";

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="mt-1 text-sm text-text-2">Order {order.reference}</p>

      <section
        aria-label="Order summary"
        className="mt-6 rounded-2xl border border-divider p-6"
      >
        {order.items.map((line) => (
          <div
            key={line.title}
            className="flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-2 uppercase">
                {line.billingInterval
                  ? "Subscription"
                  : PRODUCT_LABEL[line.productType]}
              </p>
              <p className="font-medium">
                <Link
                  href={productHref(line.product)}
                  className="hover:underline"
                >
                  {line.title}
                </Link>
              </p>
              <p className="text-sm text-text-2">
                {line.billingInterval
                  ? `${INTERVALS[line.billingInterval].every} · renews automatically`
                  : line.accessDurationDays === null
                    ? "Lifetime access"
                    : `${line.accessDurationDays} days of access`}
              </p>
            </div>
            <p className="font-medium whitespace-nowrap">
              {formatMoney(line.unitPrice)}
              {line.billingInterval
                ? ` / ${INTERVALS[line.billingInterval].per}`
                : ""}
            </p>
          </div>
        ))}
        <div className="mt-6 flex items-center justify-between border-t border-divider pt-4 text-lg font-bold">
          <span>{subscription ? "Today" : "Total"}</span>
          <span>{formatMoney(order.total)}</span>
        </div>

        {order.canPay && order.accessStartsAt && (
          <div
            role="note"
            className="mt-4 flex gap-2 rounded-lg bg-surface p-3 text-sm"
          >
            <Icon name="schedule" size={20} className="shrink-0 text-text-2" />
            <span>
              Your current pass runs until {formatDate(order.accessStartsAt)}.
              {subscription
                ? " Your first subscription period starts then, so you don’t lose any paid time."
                : " This pass starts then, so you don’t lose any paid time."}
            </span>
          </div>
        )}
        {order.canPay &&
          !order.accessStartsAt &&
          order.coveredByCurrentPlan && (
            <div
              role="note"
              className="mt-4 flex gap-2 rounded-lg bg-surface p-3 text-sm"
            >
              <Icon name="error" size={20} className="shrink-0 text-text-2" />
              <span>
                A plan you already have covers everything in this one. To
                switch, cancel your current subscription — you keep it until its
                paid period ends.
              </span>
            </div>
          )}

        {order.alreadyOwned.length > 0 && order.canPay && (
          <div
            role="note"
            className="mt-4 flex gap-2 rounded-lg bg-surface p-3 text-sm"
          >
            <Icon name="error" size={20} className="shrink-0 text-text-2" />
            <span>
              You already have access to {order.alreadyOwned.join(", ")}. The
              bundle is still the full price; new videos added later are
              included.
            </span>
          </div>
        )}

        <div className="mt-6">
          {order.canPay ? (
            <>
              <PayButton
                orderId={order.id}
                label={
                  subscription
                    ? `Subscribe · ${formatMoney(order.total)}${perPeriod}`
                    : `Pay ${formatMoney(order.total)}`
                }
              />
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-text-2">
                <Icon name="lock" size={14} className="shrink-0" />
                {subscription
                  ? "Secure payment by Paystack · card only (mobile money can’t renew automatically) · cancel anytime"
                  : "Secure payment by Paystack · card or mobile money"}
              </p>
            </>
          ) : order.status === "PAID" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="flex items-center gap-2 font-medium text-success">
                <Icon name="check_circle" /> Paid — you’re all set
              </p>
              <ButtonLink
                href={subscription ? "/account/subscriptions" : "/library"}
                variant="primary"
              >
                {subscription ? "Manage subscription" : "Go to your library"}
              </ButtonLink>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-text-2">
                This order is no longer open for payment.
              </p>
              {item && (
                <ButtonLink href={productHref(item.product)} variant="tonal">
                  Start again
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/** Order summary before Paystack's hosted checkout (our design, their payment page). */
export default function CheckoutPage(props: PageProps<"/checkout/[orderId]">) {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden
          className="mx-auto h-96 max-w-lg rounded-2xl bg-surface"
        />
      }
    >
      <Summary params={props.params} />
    </Suspense>
  );
}
