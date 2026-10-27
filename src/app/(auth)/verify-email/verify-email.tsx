"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthActions, SuccessNotice } from "@/components/auth/auth-form";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSnackbar } from "@/components/ui/snackbar";
import { api } from "@/lib/api/client";
import { messageOf } from "@/lib/api/errors";
import type { CustomerResponse } from "@/lib/api/types";
import { useHashToken } from "@/lib/use-hash-token";

type State =
  | { kind: "working" }
  | { kind: "done"; name: string }
  | { kind: "failed"; message: string };

/**
 * Reads the token from the URL fragment (never sent to servers), strips it
 * from the address bar, and verifies it. Success also signs the user in.
 */
export function VerifyEmail() {
  const router = useRouter();
  const snackbar = useSnackbar();
  const token = useHashToken();
  const [result, setResult] = useState<State>({ kind: "working" });
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    api<CustomerResponse>("/auth/verify-email", { body: { token } })
      .then(({ user }) => {
        setResult({ kind: "done", name: user.fullName });
        snackbar("Email verified");
        router.refresh();
      })
      .catch((error: unknown) =>
        setResult({ kind: "failed", message: messageOf(error) }),
      );
  }, [token, router, snackbar]);

  const state: State =
    token === null
      ? {
          kind: "failed",
          message:
            "This link is incomplete. Open the link from your email again.",
        }
      : result;

  if (state.kind === "working") {
    return (
      <div className="flex items-center gap-3 text-text-2" role="status">
        <Spinner size={20} /> Verifying your email…
      </div>
    );
  }

  if (state.kind === "failed") {
    return (
      <>
        <div className="flex flex-col gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <Icon name="error" size={28} />
          </span>
          <h1 className="text-[28px] leading-9 font-normal">
            We couldn’t verify your email
          </h1>
          <p className="text-base text-text-2" role="alert">
            {state.message}
          </p>
          <p className="text-sm text-text-2">
            Sign in to send a new verification link from the banner at the top
            of the page.
          </p>
        </div>
        <AuthActions>
          <span />
          <ButtonLink href="/login" variant="primary">
            Sign in
          </ButtonLink>
        </AuthActions>
      </>
    );
  }

  return (
    <>
      <SuccessNotice title="Email verified">
        Welcome to Vaultline, {state.name}. You’re signed in and ready to watch.
      </SuccessNotice>
      <AuthActions>
        <span />
        <ButtonLink href="/" variant="primary">
          Start watching
        </ButtonLink>
      </AuthActions>
    </>
  );
}
