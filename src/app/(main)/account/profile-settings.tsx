"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SettingsSection } from "@/components/account/settings-section";
import { FormError } from "@/components/auth/auth-form";
import { Icon } from "@/components/icons/icon";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api/client";
import { ApiError, messageOf } from "@/lib/api/errors";
import type { Customer, CustomerResponse } from "@/lib/api/types";

function asApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError(0, "UNKNOWN", messageOf(error));
}

export function ProfileSettings({ user }: { user: Customer }) {
  const router = useRouter();
  const snackbar = useSnackbar();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<ApiError | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dirty = fullName !== user.fullName || phone !== (user.phone ?? "");

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api<CustomerResponse>("/me", {
        method: "PATCH",
        body: { fullName, phone: phone.trim() || null },
      });
      snackbar("Profile saved");
      router.refresh();
    } catch (caught) {
      setError(asApiError(caught));
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api("/me/delete", { body: { password: deletePassword } });
      router.push("/");
      router.refresh();
      snackbar("Your account has been deleted");
    } catch (caught) {
      setDeleteError(asApiError(caught));
      setDeleting(false);
    }
  };

  return (
    <>
      <SettingsSection
        title="Your account"
        description="Choose how you appear and how we can reach you."
      >
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={user.fullName} size={56} />
          <div>
            <p className="text-base font-medium">{user.fullName}</p>
            <p className="flex items-center gap-1 text-sm text-text-2">
              {user.email}
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-0.5 text-success">
                  <Icon name="check_circle" size={16} /> Verified
                </span>
              ) : (
                <span className="text-danger">· Not verified</span>
              )}
            </p>
          </div>
        </div>
        <form
          onSubmit={save}
          className="flex max-w-md flex-col gap-5"
          noValidate
        >
          <FormError
            message={error && !error.details.length ? error.message : null}
          />
          <TextField
            label="Full name"
            autoComplete="name"
            maxLength={100}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            errors={error?.fieldErrors("fullName")}
          />
          <TextField
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="+233 24 123 4567"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            errors={error?.fieldErrors("phone")}
          />
          <div>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={!dirty}
            >
              Save
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Delete account"
        description="Permanently delete your account and personal details. Purchase records are kept, anonymized, for accounting."
      >
        <Button
          variant="outline"
          className="text-danger"
          icon="delete"
          onClick={() => setDeleteOpen(true)}
        >
          Delete account
        </Button>
      </SettingsSection>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        actions={
          <>
            <Button variant="text" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="text"
              className="text-danger"
              loading={deleting}
              disabled={!deletePassword}
              onClick={deleteAccount}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="mb-4">
          You’ll lose access to everything you’ve bought. This can’t be undone.
          Enter your password to confirm.
        </p>
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={deletePassword}
          onChange={(event) => setDeletePassword(event.target.value)}
          errors={
            deleteError
              ? (deleteError.fieldErrors("password") ?? [deleteError.message])
              : undefined
          }
        />
      </Dialog>
    </>
  );
}
