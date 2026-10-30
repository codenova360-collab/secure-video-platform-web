"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { ApiError, messageOf } from "@/lib/api/errors";
import type { OrderResponse } from "@/lib/api/types";
import { Button } from "../ui/button";
import { useSnackbar } from "../ui/snackbar";

/**
 * Starts a purchase: the API creates (or reuses) an order with the price
 * from the database, then the order summary page takes over. Signed-out
 * visitors are sent to sign in first.
 */
export function BuyButton({
  productType,
  slug,
  children,
  className,
}: {
  productType: "VIDEO" | "BUNDLE" | "PLAN";
  slug: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const snackbar = useSnackbar();
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    setBusy(true);
    try {
      const { order } = await api<OrderResponse>("/orders", {
        body: { productType, slug },
      });
      router.push(`/checkout/${order.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      snackbar(messageOf(error));
      setBusy(false);
    }
  };

  return (
    <Button
      variant="primary"
      icon="sell"
      loading={busy}
      onClick={() => void buy()}
      className={className}
    >
      {children}
    </Button>
  );
}
