"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_THEME,
  isThemeId,
  THEME_GROUPS,
  THEMES,
  THEME_STORAGE_KEY,
  type ThemeId,
} from "@/features/theme/theme";

const themeListeners = new Set<() => void>();

function getThemeSnapshot(): ThemeId {
  const theme = document.documentElement.dataset.theme;
  return isThemeId(theme) ? theme : DEFAULT_THEME;
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function applyTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still applies for this session when storage is unavailable.
  }
  themeListeners.forEach((listener) => listener());
}

export function ThemeSettings() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => DEFAULT_THEME,
  );

  function selectTheme(nextTheme: ThemeId) {
    applyTheme(nextTheme);
  }

  return (
    <div aria-label="外观设置" className="theme-settings" role="group">
      {THEME_GROUPS.map((group) => (
        <div
          aria-label={group.label}
          className="theme-group"
          key={group.id}
          role="group"
        >
          <div className="theme-options">
            {THEMES.filter((option) => option.group === group.id).map(
              (option) => {
                const selected = theme === option.id;

                return (
                  <button
                    aria-label={`使用${option.label}主题`}
                    aria-pressed={selected}
                    className="theme-option"
                    key={option.id}
                    onClick={() => selectTheme(option.id)}
                    title={option.label}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className="theme-swatch"
                      style={{
                        background: `linear-gradient(90deg, ${option.colors[0]} 0 50%, ${option.colors[1]} 50% 100%)`,
                      }}
                    >
                      <svg
                        className="theme-check"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path d="m3.25 8 3 3 6.5-6.5" />
                      </svg>
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
