import { getCurrentUser } from "@/lib/api/server";
import { ButtonLink, IconButton } from "../ui/button";
import { AccountMenu } from "./account-menu";
import { VerifyEmailBanner } from "./verify-email-banner";

/** Masthead right side: "Sign in" or notifications + avatar menu. */
export async function UserArea() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <ButtonLink href="/login" variant="outline" icon="account_circle">
        Sign in
      </ButtonLink>
    );
  }
  return (
    <>
      <IconButton icon="notifications" label="Notifications" disabled />
      <AccountMenu user={user} />
    </>
  );
}

export function UserAreaSkeleton() {
  return <span className="size-8 rounded-full bg-surface" aria-hidden="true" />;
}

export async function EmailBanner() {
  const user = await getCurrentUser();
  return user && !user.emailVerified ? (
    <VerifyEmailBanner email={user.email} />
  ) : null;
}
