"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { messageOf } from "@/lib/api/errors";
import type { PayOrderResponse } from "@/lib/api/types";
import { Button } from "../ui/button";

/** Sends the customer to the payment provider's hosted checkout. */
export function PayButton({
  orderId,
  label,
}: {
  orderId: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const { authorizationUrl } = await api<PayOrderResponse>(
        `/orders/${orderId}/pay`,
        {
          method: "POST",
        },
      );
      window.location.assign(authorizationUrl);
    } catch (err) {
      setError(messageOf(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="primary"
        icon="payments"
        loading={busy}
        onClick={() => void pay()}
        className="w-full"
      >
        {label}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
