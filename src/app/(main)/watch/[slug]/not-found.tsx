import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function VideoNotFound() {
  return (
    <EmptyState
      icon="video_library"
      title="This video isn’t available"
      action={
        <ButtonLink href="/" variant="tonal">
          Browse videos
        </ButtonLink>
      }
    >
      It may have been removed or isn’t published yet.
    </EmptyState>
  );
}
