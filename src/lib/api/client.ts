import { ApiError } from "./errors";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/**
 * Browser-side API calls. Always goes to this site's own `/api` proxy, so the
 * session cookie stays first-party and no API URL or secret reaches the
 * browser. `path` is the API path without the `/v1` prefix.
 */
export async function api<T = void>(
  path: string,
  options: { method?: Method; body?: unknown } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? (options.body === undefined ? "GET" : "POST"),
      headers:
        options.body === undefined
          ? { accept: "application/json" }
          : { accept: "application/json", "content-type": "application/json" },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw ApiError.network();
  }
  if (!response.ok) throw await ApiError.fromResponse(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
