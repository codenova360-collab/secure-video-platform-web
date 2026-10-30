import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { PaymentStatus } from "./payment-status";

export const metadata: Metadata = {
  title: "Payment status",
  robots: { index: false },
};

/** Paystack returns customers here with `?reference=…`. */
export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Spinner size={40} />
        </div>
      }
    >
      <PaymentStatus />
    </Suspense>
  );
}
