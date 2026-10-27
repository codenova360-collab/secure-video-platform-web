"use client";

import { useState } from "react";
import {
  AuthActions,
  AuthHeading,
  FormError,
  SuccessNotice,
} from "@/components/auth/auth-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { api } from "@/lib/api/client";
import { ApiError, messageOf } from "@/lib/api/errors";
import { useHashToken } from "@/lib/use-hash-token";

export function ResetPasswordForm() {
  const token = useHashToken();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMismatch(password !== confirm);
    if (password !== confirm || !token) return;
    setSubmitting(true);
    setError(null);
    try {
      await api("/auth/reset-password", { body: { token, password } });
      setDone(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught
          : new ApiError(0, "UNKNOWN", messageOf(caught)),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <SuccessNotice title="Password changed">
          Your password has been reset and you’ve been signed out of every
          device. Sign in with your new password.
        </SuccessNotice>
        <AuthActions>
          <span />
          <ButtonLink href="/login" variant="primary">
            Sign in
          </ButtonLink>
        </AuthActions>
      </>
    );
  }

  if (token === null) {
    return (
      <>
        <AuthHeading
          title="This link is incomplete"
          subtitle="Open the link from your email again, or request a new one."
        />
        <AuthActions>
          <span />
          <ButtonLink href="/forgot-password" variant="primary">
            Request a new link
          </ButtonLink>
        </AuthActions>
      </>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <AuthHeading title="Choose a new password" />
      <div className="flex flex-col gap-5">
        <FormError
          message={error && !error.details.length ? error.message : null}
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          hint="Use at least 10 characters. A short phrase works well."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errors={error?.fieldErrors("password")}
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          errors={mismatch ? ["The passwords don’t match."] : undefined}
        />
      </div>
      <AuthActions>
        <ButtonLink href="/forgot-password" variant="text" className="-ml-4">
          Request a new link
        </ButtonLink>
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={token === undefined}
        >
          Change password
        </Button>
      </AuthActions>
    </form>
  );
}
