/**
 * Post-login redirect target: only same-site relative paths are allowed
 * (docs/SECURITY.md §9 "Open redirects"). Anything else goes home.
 */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }
  try {
    const url = new URL(value, "http://local.invalid");
    if (url.origin !== "http://local.invalid") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
