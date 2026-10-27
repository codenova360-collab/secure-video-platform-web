/**
 * Backend-for-frontend proxy (docs/ARCHITECTURE.md §4). Relays browser
 * requests from this site's `/api/*` to the API's `/v1/*`:
 * - only an allowlist of request headers is forwarded (incl. the browser's
 *   Origin, which the API's CSRF check needs, and the session cookie);
 * - the shared proxy secret and the real client IP are added server-side;
 * - only an allowlist of response headers comes back (incl. Set-Cookie, so
 *   session cookies are first-party on this domain).
 *
 * Kept free of Next.js imports so it can be unit-tested.
 */

export interface ForwardConfig {
  apiUrl: string;
  proxySecret: string;
  /**
   * First path segments this proxy may reach. Web: everything except
   * `admin` (blockedPrefixes); admin: only `admin` (allowedPrefixes).
   */
  allowedPrefixes?: readonly string[];
  blockedPrefixes?: readonly string[];
  /**
   * Use `x-forwarded-for` when Netlify's header is absent. Development only:
   * browsers can set that header themselves, so trusting it in production
   * would let anyone pick their own rate-limit bucket.
   */
  trustForwardedFor: boolean;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "cookie",
  "origin",
  "referer",
  "user-agent",
];

const RETURNED_RESPONSE_HEADERS = [
  "content-type",
  "cache-control",
  "retry-after",
  "x-request-id",
];

/** Bodies above this are refused before reaching the API (API limit: 100 kB). */
export const MAX_BODY_BYTES = 1024 * 1024;

const SEGMENT = /^[A-Za-z0-9._~-]+$/;

function jsonError(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

/**
 * The browser's IP. Netlify sets `x-nf-client-connection-ip` itself (clients
 * can't spoof it). Without it, nothing is forwarded unless explicitly
 * allowed — the API then falls back to the proxy's own address.
 */
export function clientIpOf(
  headers: Headers,
  trustForwardedFor: boolean,
): string | null {
  const netlify = headers.get("x-nf-client-connection-ip");
  if (netlify) return netlify.trim();
  if (!trustForwardedFor) return null;
  const forwarded = headers.get("x-forwarded-for");
  return forwarded ? (forwarded.split(",")[0]?.trim() ?? null) : null;
}

export async function forwardToApi(
  request: Request,
  pathSegments: string[],
  config: ForwardConfig,
): Promise<Response> {
  // Reject traversal and odd characters; never let the client pick the host.
  if (
    pathSegments.length === 0 ||
    pathSegments.some(
      (segment) =>
        !SEGMENT.test(segment) || segment === "." || segment === "..",
    )
  ) {
    return jsonError(404, "NOT_FOUND", "The requested resource was not found.");
  }
  const first = pathSegments[0]!;
  if (
    config.blockedPrefixes?.includes(first) ||
    (config.allowedPrefixes && !config.allowedPrefixes.includes(first))
  ) {
    return jsonError(404, "NOT_FOUND", "The requested resource was not found.");
  }

  const incoming = new URL(request.url);
  const target = new URL(`/v1/${pathSegments.join("/")}`, config.apiUrl);
  target.search = incoming.search;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("x-proxy-secret", config.proxySecret);
  const clientIp = clientIpOf(request.headers, config.trustForwardedFor);
  if (clientIp) headers.set("x-client-ip", clientIp);
  headers.set("x-request-id", crypto.randomUUID());

  let body: ArrayBuffer | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) {
      return jsonError(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request body is too large.",
      );
    }
    body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) {
      return jsonError(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request body is too large.",
      );
    }
  }

  let upstream: Response;
  try {
    upstream = await (config.fetchImpl ?? fetch)(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(config.timeoutMs ?? 30_000),
    });
  } catch {
    return jsonError(
      502,
      "BAD_GATEWAY",
      "The service is temporarily unavailable. Please try again.",
    );
  }

  const responseHeaders = new Headers();
  for (const name of RETURNED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }
  if (!responseHeaders.has("cache-control")) {
    responseHeaders.set("cache-control", "no-store");
  }

  const hasBody = upstream.status !== 204 && upstream.status !== 304;
  return new Response(hasBody ? upstream.body : null, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
