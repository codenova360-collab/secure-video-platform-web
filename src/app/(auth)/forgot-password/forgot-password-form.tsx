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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api("/auth/forgot-password", { body: { email } });
      setSent(true);
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

  if (sent) {
    // Deliberately the same message whether or not the account exists.
    return (
      <>
        <SuccessNotice icon="mail" title="Check your email">
          If an account exists for{" "}
          <strong className="text-text">{email.trim()}</strong>, we’ve sent a
          link to reset your password. It expires in 30 minutes.
        </SuccessNotice>
        <AuthActions>
          <span />
          <ButtonLink href="/login" variant="primary">
            Back to sign in
          </ButtonLink>
        </AuthActions>
      </>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <AuthHeading
        title="Forgot your password?"
        subtitle="Enter your email and we’ll send you a link to reset it."
      />
      <div className="flex flex-col gap-5">
        <FormError
          message={error && !error.details.length ? error.message : null}
        />
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          errors={error?.fieldErrors("email")}
        />
      </div>
      <AuthActions>
        <ButtonLink href="/login" variant="text" className="-ml-4">
          Back to sign in
        </ButtonLink>
        <Button type="submit" variant="primary" loading={submitting}>
          Send link
        </Button>
      </AuthActions>
    </form>
  );
}
