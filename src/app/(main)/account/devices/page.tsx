import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SettingsSkeleton } from "@/components/account/settings-section";
import { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";
import type { SessionList } from "@/lib/api/types";
import { DeviceList } from "./device-list";

export const metadata = { title: "Devices" };

async function Devices() {
  let sessions: SessionList["sessions"];
  try {
    ({ sessions } = await apiGet<SessionList>("/me/sessions"));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?next=/account/devices");
    }
    throw error;
  }
  return <DeviceList sessions={sessions} />;
}

export default function DevicesPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <Devices />
    </Suspense>
  );
}
