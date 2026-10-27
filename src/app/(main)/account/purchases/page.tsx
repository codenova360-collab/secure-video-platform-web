import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Purchases" };

/** Purchase history arrives with payments in Phase 6. */
export default function PurchasesPage() {
  return (
    <EmptyState icon="receipt_long" title="No purchases yet">
      Videos, bundles, and passes you buy will be listed here with receipts.
    </EmptyState>
  );
}
