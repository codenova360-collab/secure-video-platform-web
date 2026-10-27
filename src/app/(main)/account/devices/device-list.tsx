"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SettingsSection } from "@/components/account/settings-section";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api/client";
import { messageOf } from "@/lib/api/errors";
import type { Session } from "@/lib/api/types";

/** Rough, human-friendly device name from a user-agent string. */
export function describeDevice(userAgent: string | null): {
  name: string;
  mobile: boolean;
} {
  const ua = userAgent ?? "";
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : null;
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  if (!browser && !os) return { name: "Unknown device", mobile };
  return { name: [browser, os].filter(Boolean).join(" on "), mobile };
}

const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function DeviceList({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const snackbar = useSnackbar();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const others = sessions.filter((session) => !session.current);

  const signOut = async (id: string) => {
    setBusy(id);
    try {
      await api(`/me/sessions/${id}`, { method: "DELETE" });
      snackbar("Device signed out");
      router.refresh();
    } catch (error) {
      snackbar(messageOf(error));
    } finally {
      setBusy(null);
    }
  };

  const signOutOthers = async () => {
    setBusy("all");
    try {
      await api("/me/sessions/revoke-others", { method: "POST" });
      setConfirmAll(false);
      snackbar("Signed out of all other devices");
      router.refresh();
    } catch (error) {
      snackbar(messageOf(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <SettingsSection
      title="Devices"
      description="Where you’re signed in. Sign out of any device you don’t recognize, then change your password."
    >
      <ul className="flex flex-col divide-y divide-divider">
        {sessions.map((session) => {
          const device = describeDevice(session.userAgent);
          return (
            <li key={session.id} className="flex items-center gap-4 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface">
                <Icon name={device.mobile ? "mobile" : "computer"} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {device.name}
                  {session.current && (
                    <span className="ml-2 text-xs font-normal text-accent">
                      This device
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-2">
                  Last active {formatter.format(new Date(session.lastUsedAt))}
                  {session.ip ? ` · ${session.ip}` : ""}
                </p>
              </div>
              {!session.current && (
                <Button
                  variant="text"
                  loading={busy === session.id}
                  onClick={() => signOut(session.id)}
                >
                  Sign out
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {others.length > 0 && (
        <Button
          variant="tonal"
          className="mt-4"
          icon="logout"
          onClick={() => setConfirmAll(true)}
        >
          Sign out of all other devices
        </Button>
      )}
      <Dialog
        open={confirmAll}
        onClose={() => setConfirmAll(false)}
        title="Sign out of other devices?"
        actions={
          <>
            <Button variant="text" onClick={() => setConfirmAll(false)}>
              Cancel
            </Button>
            <Button
              variant="text"
              loading={busy === "all"}
              onClick={signOutOthers}
            >
              Sign out
            </Button>
          </>
        }
      >
        You’ll stay signed in on this device. {others.length} other{" "}
        {others.length === 1 ? "device" : "devices"} will be signed out.
      </Dialog>
    </SettingsSection>
  );
}
