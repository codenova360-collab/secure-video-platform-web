"use client";

import { useState } from "react";
import { SettingsSection } from "@/components/account/settings-section";
import { FormError } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api/client";
import { ApiError, messageOf } from "@/lib/api/errors";

export function PasswordForm() {
  const snackbar = useSnackbar();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMismatch(newPassword !== confirm);
    if (newPassword !== confirm) return;
    setSaving(true);
    setError(null);
    try {
      await api("/me/password", { body: { currentPassword, newPassword } });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      snackbar("Password changed. Other devices have been signed out.");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught
          : new ApiError(0, "UNKNOWN", messageOf(caught)),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Password"
      description="Changing your password signs you out on every other device."
    >
      <form
        onSubmit={submit}
        className="flex max-w-md flex-col gap-5"
        noValidate
      >
        <FormError
          message={error && !error.details.length ? error.message : null}
        />
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          errors={
            error?.code === "INCORRECT_PASSWORD"
              ? error.fieldErrors("password")
              : undefined
          }
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="Use at least 10 characters. A short phrase works well."
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          errors={
            error?.code === "PASSWORD_TOO_WEAK"
              ? error.fieldErrors("password")
              : undefined
          }
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          errors={mismatch ? ["The passwords don’t match."] : undefined}
        />
        <div>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={!currentPassword || !newPassword}
          >
            Change password
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
