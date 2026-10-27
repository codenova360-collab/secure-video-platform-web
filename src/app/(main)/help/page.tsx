import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Help" };

export default function HelpPage() {
  return (
    <EmptyState icon="help" title="Help center">
      Help articles are on the way. For account problems, use “Forgot password?”
      on the sign-in page or contact support.
    </EmptyState>
  );
}
