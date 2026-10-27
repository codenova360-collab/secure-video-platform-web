"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { messageOf } from "@/lib/api/errors";
import { Icon } from "../icons/icon";
import { Button } from "../ui/button";
import { useSnackbar } from "../ui/snackbar";

/** Shown to signed-in customers who haven't verified their email yet. */
export function VerifyEmailBanner({ email }: { email: string }) {
  const snackbar = useSnackbar();
  const [sending, setSending] = useState(false);

  const resend = async () => {
    setSending(true);
    try {
      await api("/me/verification-email", { method: "POST" });
      snackbar(`Verification email sent to ${email}`);
    } catch (error) {
      snackbar(messageOf(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Email verification"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-divider bg-surface px-4 py-2 mini:px-6"
    >
      <Icon name="mail" className="text-accent" />
      <p className="flex-1 text-sm">
        Verify your email to watch videos and make purchases. We sent a link to{" "}
        <strong>{email}</strong>.
      </p>
      <Button variant="text" onClick={resend} loading={sending}>
        Resend email
      </Button>
    </div>
  );
}
