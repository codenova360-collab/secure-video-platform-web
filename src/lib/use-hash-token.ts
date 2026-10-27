"use client";

import { useSyncExternalStore } from "react";

let taken: { path: string; token: string | null } | null = null;

const subscribe = () => () => {};

/**
 * The `#token=…` from an email link. Read once per page, then removed from
 * the address bar (so it isn't kept in history or shared by copy-paste).
 * Fragments are never sent to servers, so tokens stay out of logs.
 */
function snapshot(): string | null {
  const path = window.location.pathname;
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get(
    "token",
  );
  if (fromHash) {
    taken = { path, token: fromHash };
    window.history.replaceState(null, "", path + window.location.search);
  } else if (taken?.path !== path) {
    taken = { path, token: null };
  }
  return taken.token;
}

/** `undefined` during server render and hydration, then the token or null. */
export function useHashToken(): string | null | undefined {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}
