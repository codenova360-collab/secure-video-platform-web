"use client";

import { IconButton } from "../ui/button";
import { Menu, MenuItem } from "../ui/menu";
import { useSnackbar } from "../ui/snackbar";
import { Button } from "../ui/button";

async function copyLink(slug: string): Promise<boolean> {
  const url = new URL(`/watch/${slug}`, window.location.origin).toString();
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/** The ⋮ menu on video cards. */
export function ShareMenu({ slug, title }: { slug: string; title: string }) {
  const snackbar = useSnackbar();
  return (
    <Menu
      trigger={(props) => (
        <IconButton
          icon="more_vert"
          label={`More actions for ${title}`}
          size={36}
          {...props}
        />
      )}
    >
      <MenuItem
        icon="share"
        onSelect={() =>
          void copyLink(slug).then((ok) =>
            snackbar(ok ? "Link copied" : "Couldn’t copy the link"),
          )
        }
      >
        Share
      </MenuItem>
    </Menu>
  );
}

/** "Share" pill on the watch page. */
export function ShareButton({ slug }: { slug: string }) {
  const snackbar = useSnackbar();
  return (
    <Button
      icon="share"
      onClick={() =>
        void copyLink(slug).then((ok) =>
          snackbar(ok ? "Link copied" : "Couldn’t copy the link"),
        )
      }
    >
      Share
    </Button>
  );
}
