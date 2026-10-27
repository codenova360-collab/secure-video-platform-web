"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";
import type { Customer } from "@/lib/api/types";
import type { ThemePreference } from "@/lib/theme";
import { useThemePreference } from "@/lib/use-theme";
import { Icon } from "../icons/icon";
import { Avatar } from "../ui/avatar";
import { Menu, MenuDivider, MenuItem } from "../ui/menu";
import { useSnackbar } from "../ui/snackbar";

const THEME_LABELS: Record<ThemePreference, string> = {
  system: "Use device theme",
  dark: "Dark theme",
  light: "Light theme",
};

/** Avatar menu (YouTube account menu), with an Appearance sub-panel. */
export function AccountMenu({ user }: { user: Customer }) {
  const router = useRouter();
  const snackbar = useSnackbar();
  const [panel, setPanel] = useState<"main" | "appearance">("main");
  const [theme, setTheme] = useThemePreference();

  const signOut = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
      snackbar("Signed out");
    }
  };

  return (
    <Menu
      className="w-72"
      trigger={(props) => (
        <button
          type="button"
          aria-label="Account menu"
          className="rounded-full"
          {...props}
          onClick={() => {
            setPanel("main");
            props.onClick();
          }}
        >
          <Avatar name={user.fullName} />
        </button>
      )}
    >
      {panel === "main" ? (
        <>
          <div className="flex gap-4 px-4 pt-2 pb-3">
            <Avatar name={user.fullName} size={40} />
            <div className="min-w-0">
              <p className="truncate text-base font-medium">{user.fullName}</p>
              <p className="truncate text-sm text-text-2">{user.email}</p>
            </div>
          </div>
          <MenuDivider />
          <MenuItem icon="account_circle" href="/account">
            Your account
          </MenuItem>
          <MenuItem icon="video_library" href="/library">
            Library
          </MenuItem>
          <MenuItem icon="devices" href="/account/devices">
            Devices
          </MenuItem>
          <MenuItem
            icon="contrast"
            keepOpen
            onSelect={() => setPanel("appearance")}
            trailing={<Icon name="chevron_right" />}
          >
            Appearance: {THEME_LABELS[theme].replace(" theme", "")}
          </MenuItem>
          <MenuDivider />
          <MenuItem icon="logout" onSelect={signOut}>
            Sign out
          </MenuItem>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 px-2 pb-2">
            <button
              type="button"
              aria-label="Back"
              data-keep-open
              role="menuitem"
              onClick={() => setPanel("main")}
              className="flex size-10 items-center justify-center rounded-full hover:bg-surface-hover"
            >
              <Icon name="arrow_back" />
            </button>
            <span className="text-base">Appearance</span>
          </div>
          <MenuDivider />
          <p className="px-4 pb-2 text-xs text-text-2">
            Setting applies to this browser only
          </p>
          {(Object.keys(THEME_LABELS) as ThemePreference[]).map((option) => (
            <MenuItem
              key={option}
              selected={theme === option}
              keepOpen
              onSelect={() => setTheme(option)}
            >
              {THEME_LABELS[option]}
            </MenuItem>
          ))}
        </>
      )}
    </Menu>
  );
}
