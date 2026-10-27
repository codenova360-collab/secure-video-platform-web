import type { NextRequest } from "next/server";
import { forwardToApi } from "@/lib/bff/forward";
import { serverEnv } from "@/lib/env.server";

/**
 * `/api/*` → API `/v1/*` (customer routes only; `admin/*` is blocked here and
 * also refused by the API for this proxy's secret).
 */
async function handler(
  request: NextRequest,
  context: RouteContext<"/api/[...path]">,
): Promise<Response> {
  const { path } = await context.params;
  const env = serverEnv();
  return forwardToApi(request, path, {
    apiUrl: env.API_INTERNAL_URL,
    proxySecret: env.API_PROXY_SECRET,
    blockedPrefixes: ["admin"],
    trustForwardedFor: process.env.NODE_ENV !== "production",
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
