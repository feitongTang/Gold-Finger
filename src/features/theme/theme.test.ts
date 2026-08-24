import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME,
  isThemeId,
  THEME_GROUPS,
  THEMES,
} from "@/features/theme/theme";

describe("theme presets", () => {
  it("offers five pastel and two business presets", () => {
    expect(THEME_GROUPS.map((group) => group.id)).toEqual([
      "pastel",
      "business",
    ]);
    expect(
      THEME_GROUPS.map(
        (group) => THEMES.filter((theme) => theme.group === group.id).length,
      ),
    ).toEqual([5, 2]);
  });

  it("orders pastel presets by hue without a pastel blue", () => {
    expect(
      THEMES.filter((theme) => theme.group === "pastel").map(
        (theme) => theme.id,
      ),
    ).toEqual([
      "pastel-red",
      "pastel-pink",
      "pastel-yellow",
      "pastel-green",
      "pastel-purple",
    ]);
    expect(THEMES.map((theme) => String(theme.id))).not.toContain(
      "pastel-blue",
    );
  });

  it("uses a valid pastel preset by default", () => {
    expect(isThemeId(DEFAULT_THEME)).toBe(true);
    expect(THEMES.find((theme) => theme.id === DEFAULT_THEME)?.group).toBe(
      "pastel",
    );
  });

  it("rejects unknown persisted values", () => {
    expect(isThemeId("pastel-red")).toBe(true);
    expect(isThemeId("pastel-blue")).toBe(false);
    expect(isThemeId("neon-rainbow")).toBe(false);
    expect(isThemeId(null)).toBe(false);
  });
});
