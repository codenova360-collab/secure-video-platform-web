"use client";

import { useSyncExternalStore } from "react";
import {
  readThemePreference,
  serverThemePreference,
  setThemePreference,
  subscribeTheme,
  type ThemePreference,
} from "./theme";

export function useThemePreference(): [
  ThemePreference,
  (value: ThemePreference) => void,
] {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readThemePreference,
    serverThemePreference,
  );
  return [theme, setThemePreference];
}
