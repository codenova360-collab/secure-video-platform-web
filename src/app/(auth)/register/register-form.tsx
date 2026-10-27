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
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api/client";
import { ApiError, messageOf } from "@/lib/api/errors";

export function RegisterForm() {
  const snackbar = useSnackbar();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api("/auth/register", { body: { fullName, email, password } });
      setSentTo(email.trim());
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

  const resend = async () => {
    try {
      await api("/auth/resend-verification", { body: { email: sentTo } });
      snackbar("If an account needs verifying, we’ve sent a new link");
    } catch (caught) {
      snackbar(messageOf(caught));
    }
  };

  if (sentTo) {
    // Same screen whether or not the address already had an account.
    return (
      <>
        <SuccessNotice icon="mail" title="Check your email">
          <p>
            We sent a link to <strong className="text-text">{sentTo}</strong>.
            Open it to verify your email and finish setting up your account.
          </p>
          <p className="mt-3 text-sm">
            The link expires in 24 hours. Check your spam folder if you don’t
            see it.
          </p>
        </SuccessNotice>
        <AuthActions>
          <Button variant="text" className="-ml-4" onClick={resend}>
            Resend email
          </Button>
          <ButtonLink href="/login" variant="primary">
            Sign in
          </ButtonLink>
        </AuthActions>
      </>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <AuthHeading
        title="Create your account"
        subtitle="to start watching on Vaultline"
      />
      <div className="flex flex-col gap-5">
        <FormError
          message={error && !error.details.length ? error.message : null}
        />
        <TextField
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          maxLength={100}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          errors={error?.fieldErrors("fullName")}
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
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          hint="Use at least 10 characters. A short phrase works well."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errors={error?.fieldErrors("password")}
        />
      </div>
      <AuthActions>
        <ButtonLink href="/login" variant="text" className="-ml-4">
          Sign in instead
        </ButtonLink>
        <Button type="submit" variant="primary" loading={submitting}>
          Create account
        </Button>
      </AuthActions>
    </form>
  );
}
