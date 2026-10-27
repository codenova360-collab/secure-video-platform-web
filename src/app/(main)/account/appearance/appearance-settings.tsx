"use client";

import { SettingsSection } from "@/components/account/settings-section";
import type { ThemePreference } from "@/lib/theme";
import { useThemePreference } from "@/lib/use-theme";

const OPTIONS: {
  value: ThemePreference;
  label: string;
  description: string;
}[] = [
  {
    value: "system",
    label: "Use device theme",
    description: "Match your device’s light or dark setting.",
  },
  {
    value: "light",
    label: "Light theme",
    description: "Always use the light theme.",
  },
  {
    value: "dark",
    label: "Dark theme",
    description: "Always use the dark theme.",
  },
];

export function AppearanceSettings() {
  const [theme, setTheme] = useThemePreference();

  return (
    <SettingsSection
      title="Appearance"
      description="Setting applies to this browser only."
    >
      <fieldset className="flex flex-col gap-1">
        <legend className="sr-only">Theme</legend>
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 hover:bg-surface"
          >
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={theme === option.value}
              onChange={() => setTheme(option.value)}
              className="mt-0.5 size-5 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="block text-xs text-text-2">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
    </SettingsSection>
  );
}
