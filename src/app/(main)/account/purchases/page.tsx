import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { apiGet } from "@/lib/api/server";
import type { Order, OrderList } from "@/lib/api/types";
import { formatDate, formatMoney } from "@/lib/format";
import { PRODUCT_LABEL, productHref } from "@/lib/products";

export const metadata: Metadata = { title: "Purchases" };

const STATUS: Record<Order["status"], { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-success/15 text-success" },
  PENDING: { label: "Not paid yet", className: "bg-surface text-text-2" },
  ABANDONED: { label: "Not completed", className: "bg-surface text-text-2" },
  FAILED: { label: "Failed", className: "bg-danger/15 text-danger" },
  REFUNDED: { label: "Refunded", className: "bg-surface text-text-2" },
};

async function Orders() {
  const { orders } = await apiGet<OrderList>("/orders?limit=50");
  if (orders.length === 0) {
    return (
      <EmptyState
        icon="receipt_long"
        title="No purchases yet"
        action={
          <ButtonLink href="/" variant="tonal">
            Browse videos
          </ButtonLink>
        }
      >
        Videos, bundles, and passes you buy will be listed here.
      </EmptyState>
    );
  }
  return (
    <ul className="divide-y divide-divider rounded-xl border border-divider">
      {orders.map((order) => {
        const item = order.items[0];
        const status = STATUS[order.status];
        return (
          <li
            key={order.id}
            className="flex flex-wrap items-center gap-4 px-4 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-2">
                {item ? PRODUCT_LABEL[item.productType] : "Order"} ·{" "}
                {formatDate(order.paidAt ?? order.createdAt)}
              </p>
              <p className="truncate font-medium">
                {item ? (
                  <Link
                    href={productHref(item.product)}
                    className="hover:underline"
                  >
                    {item.title}
                  </Link>
                ) : (
                  order.reference
                )}
              </p>
              <p className="text-xs text-text-2">Order {order.reference}</p>
            </div>
            <p className="font-medium">{formatMoney(order.total)}</p>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                status.className,
              )}
            >
              {status.label}
            </span>
            {order.canPay && (
              <ButtonLink href={`/checkout/${order.id}`} variant="primary">
                Complete payment
              </ButtonLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Purchase history: every order with its status and order number. */
export default function PurchasesPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Purchases</h1>
      <p className="mb-6 text-sm text-text-2">
        Receipts are emailed to you when a payment is confirmed.
      </p>
      <Suspense
        fallback={<div aria-hidden className="h-40 rounded-xl bg-surface" />}
      >
        <Orders />
      </Suspense>
    </>
  );
}
