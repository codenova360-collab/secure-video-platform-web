"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api/client";
import { ApiError, messageOf } from "@/lib/api/errors";
import type { PaymentVerifyResponse } from "@/lib/api/types";
import { productHref } from "@/lib/products";

const POLL_MS = 3000;
/** Mobile money can take a while; after this we stop and explain. */
const GIVE_UP_MS = 3 * 60_000;

type View =
  | { kind: "checking" }
  | { kind: "result"; data: PaymentVerifyResponse }
  | { kind: "slow"; data: PaymentVerifyResponse }
  | { kind: "error"; message: string };

/**
 * After Paystack: asks the API to verify the payment (the redirect alone
 * proves nothing) and keeps checking while it's pending.
 */
export function PaymentStatus() {
  const reference = useSearchParams().get("reference") ?? "";
  const [view, setView] = useState<View>({ kind: "checking" });

  useEffect(() => {
    if (!/^PAY-[0-9A-Z]{26}$/.test(reference)) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();
    const poll = async () => {
      try {
        const data = await api<PaymentVerifyResponse>(
          `/payments/verify/${reference}`,
        );
        if (stopped) return;
        if (data.outcome !== "PENDING")
          return setView({ kind: "result", data });
        if (Date.now() - started > GIVE_UP_MS)
          return setView({ kind: "slow", data });
        setView({ kind: "result", data });
      } catch (error) {
        if (stopped) return;
        if (error instanceof ApiError && error.status === 404) {
          return setView({
            kind: "error",
            message: "We couldn’t find this payment.",
          });
        }
        if (Date.now() - started > GIVE_UP_MS)
          return setView({ kind: "error", message: messageOf(error) });
      }
      timer = setTimeout(() => void poll(), POLL_MS);
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reference]);

  if (!/^PAY-[0-9A-Z]{26}$/.test(reference)) {
    return (
      <Panel
        icon="error"
        title="This link isn’t complete"
        detail="Open your purchases to check an order."
        action={
          <ButtonLink href="/account/purchases" variant="tonal">
            Your purchases
          </ButtonLink>
        }
      />
    );
  }
  if (view.kind === "checking") {
    return (
      <Panel
        spinner
        title="Checking your payment…"
        detail="This takes a moment."
      />
    );
  }
  if (view.kind === "error") {
    return (
      <Panel
        icon="error"
        title="Something went wrong"
        detail={view.message}
        action={
          <ButtonLink href="/account/purchases" variant="tonal">
            Your purchases
          </ButtonLink>
        }
      />
    );
  }

  const { data } = view;
  const item = data.order.items[0];
  if (data.outcome === "PAID") {
    const subscription = data.order.kind === "SUBSCRIPTION_START";
    return (
      <Panel
        icon="check_circle"
        tone="success"
        title={subscription ? "You’re subscribed" : "Payment received"}
        detail={
          subscription
            ? `${item?.title ?? "Your subscription"} is active and renews automatically. A receipt is on its way to your email.`
            : `${item?.title ?? "Your purchase"} is ready. A receipt is on its way to your email.`
        }
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {subscription && (
              <ButtonLink href="/account/subscriptions" variant="tonal">
                Manage subscription
              </ButtonLink>
            )}
            {item?.productType === "VIDEO" && item.product.slug && (
              <ButtonLink
                href={productHref(item.product)}
                variant="primary"
                icon="play_arrow"
              >
                Watch now
              </ButtonLink>
            )}
            <ButtonLink
              href="/library"
              variant={item?.productType === "VIDEO" ? "tonal" : "primary"}
            >
              Go to your library
            </ButtonLink>
          </div>
        }
      />
    );
  }
  if (data.outcome === "FAILED" || data.outcome === "REFUNDED") {
    return (
      <Panel
        icon="error"
        tone="danger"
        title={
          data.outcome === "REFUNDED"
            ? "Payment refunded"
            : "Payment not completed"
        }
        detail={data.message}
        action={
          data.order.canPay ? (
            <ButtonLink
              href={`/checkout/${data.order.id}`}
              variant="primary"
              icon="refresh"
            >
              Try again
            </ButtonLink>
          ) : undefined
        }
      />
    );
  }
  return (
    <Panel
      spinner={view.kind !== "slow"}
      icon="hourglass_empty"
      title={
        view.kind === "slow"
          ? "Still waiting for confirmation"
          : "Waiting for confirmation"
      }
      detail={
        view.kind === "slow"
          ? "Your payment provider hasn’t confirmed yet. We’ll keep checking — your purchase will appear in your library as soon as it’s confirmed, and you’ll get a receipt by email."
          : `${data.message} If you paid with mobile money, approve the prompt on your phone.`
      }
      action={
        view.kind === "slow" ? (
          <ButtonLink href="/account/purchases" variant="tonal">
            Your purchases
          </ButtonLink>
        ) : undefined
      }
    />
  );
}

function Panel({
  icon,
  spinner = false,
  tone = "neutral",
  title,
  detail,
  action,
}: {
  icon?: "check_circle" | "error" | "hourglass_empty";
  spinner?: boolean;
  tone?: "neutral" | "success" | "danger";
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center"
    >
      {spinner ? (
        <Spinner size={40} />
      ) : (
        icon && (
          <Icon
            name={icon}
            size={56}
            className={
              tone === "success"
                ? "text-success"
                : tone === "danger"
                  ? "text-danger"
                  : "text-text-2"
            }
          />
        )
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-text-2">{detail}</p>
      {action}
    </div>
  );
}
