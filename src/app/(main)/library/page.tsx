import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Library" };

/** "You"-style library shelves arrive with purchases in Phase 6. */
export default function LibraryPage() {
  return (
    <EmptyState
      icon="video_library"
      title="Your library is empty"
      action={
        <ButtonLink href="/" variant="tonal">
          Browse videos
        </ButtonLink>
      }
    >
      Videos you buy or unlock with a plan will appear here.
    </EmptyState>
  );
}
