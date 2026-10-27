import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Subscriptions" };

/** Subscriptions arrive in Phase 7. */
export default function SubscriptionsPage() {
  return (
    <EmptyState icon="card_membership" title="No subscriptions">
      Plans you subscribe to will show here, with the next payment date and the
      option to cancel.
    </EmptyState>
  );
}
