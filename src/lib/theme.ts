export const THEME_COOKIE = "svp_theme";
export const THEME_PREFERENCES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === "string" &&
    (THEME_PREFERENCES as readonly string[]).includes(value)
  );
}

/**
 * Runs in <head> before first paint: reads the theme cookie (or the system
 * setting) and sets <html data-theme>, so pages never flash the wrong theme.
 * Static string — contains no user input.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark|system)/);var p=m?m[1]:"system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;

/** Applies and remembers a preference (client only). */
export function applyThemePreference(preference: ThemePreference): void {
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.cookie = `${THEME_COOKIE}=${preference}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function readThemePreference(): ThemePreference {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]+)`),
  );
  return isThemePreference(match?.[1]) ? match[1] : "system";
}

// ── React binding ─────────────────────────────────────────────────────────
// The preference lives in a cookie (browser state), so components read it
// with useSyncExternalStore rather than copying it into state in an effect.

const listeners = new Set<() => void>();

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Applies a preference and notifies subscribed components. */
export function setThemePreference(preference: ThemePreference): void {
  applyThemePreference(preference);
  listeners.forEach((listener) => listener());
}

/** Server snapshot: unknown until hydrated, render the default. */
export function serverThemePreference(): ThemePreference {
  return "system";
}
