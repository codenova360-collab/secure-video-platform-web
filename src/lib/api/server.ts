import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { serverEnv } from "../env.server";
import { clientIpOf } from "../bff/forward";
import { ApiError } from "./errors";
import type { Customer, CustomerResponse } from "./types";

/**
 * Server-side reads from the API (Server Components). Sends the visitor's
 * cookies and IP the same way the BFF proxy does. GET only: mutations go
 * through the browser → `/api` proxy so the CSRF Origin check applies.
 *
 * Reads request data, so callers must render inside <Suspense>.
 */
export async function apiGet<T>(path: string): Promise<T> {
  // Request data first: during prerendering this defers the read to request
  // time, so builds don't need the API's environment.
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const env = serverEnv();
  const requestHeaders = new Headers({
    accept: "application/json",
    "x-proxy-secret": env.API_PROXY_SECRET,
  });
  const cookie = cookieStore.toString();
  if (cookie) requestHeaders.set("cookie", cookie);
  const clientIp = clientIpOf(
    headerStore,
    process.env.NODE_ENV !== "production",
  );
  if (clientIp) requestHeaders.set("x-client-ip", clientIp);
  const userAgent = headerStore.get("user-agent");
  if (userAgent) requestHeaders.set("user-agent", userAgent);

  let response: Response;
  try {
    response = await fetch(new URL(`/v1${path}`, env.API_INTERNAL_URL), {
      headers: requestHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw ApiError.network();
  }
  if (!response.ok) throw await ApiError.fromResponse(response);
  return (await response.json()) as T;
}

/**
 * The signed-in customer, or null. A data-access-layer read: the API is the
 * authority, the cookie's presence alone means nothing. Deduplicated per
 * request with React `cache`, so the masthead and banner share one call.
 */
export const getCurrentUser = cache(async (): Promise<Customer | null> => {
  const cookieStore = await cookies();
  if (!cookieStore.has("svp_session")) return null;
  try {
    return (await apiGet<CustomerResponse>("/me")).user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
