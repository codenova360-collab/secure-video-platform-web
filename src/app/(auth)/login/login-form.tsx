"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  AuthActions,
  AuthHeading,
  FormError,
} from "@/components/auth/auth-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { api } from "@/lib/api/client";
import { ApiError, messageOf } from "@/lib/api/errors";
import type { CustomerResponse } from "@/lib/api/types";
import { safeNextPath } from "@/lib/safe-redirect";

export function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api<CustomerResponse>("/auth/login", { body: { email, password } });
      router.push(next);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught
          : new ApiError(0, "UNKNOWN", messageOf(caught)),
      );
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <AuthHeading title="Sign in" subtitle="to continue to Vaultline" />
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
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errors={error?.fieldErrors("password")}
        />
        <Link
          href="/forgot-password"
          className="self-start text-sm font-medium text-accent hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <AuthActions>
        <ButtonLink
          href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          variant="text"
          className="-ml-4"
        >
          Create account
        </ButtonLink>
        <Button type="submit" variant="primary" loading={submitting}>
          Sign in
        </Button>
      </AuthActions>
    </form>
  );
}
