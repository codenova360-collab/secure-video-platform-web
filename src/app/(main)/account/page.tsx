import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SettingsSkeleton } from "@/components/account/settings-section";
import { getCurrentUser } from "@/lib/api/server";
import { ProfileSettings } from "./profile-settings";

export const metadata = { title: "Account" };

async function Profile() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  return <ProfileSettings user={user} />;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <Profile />
    </Suspense>
  );
}
