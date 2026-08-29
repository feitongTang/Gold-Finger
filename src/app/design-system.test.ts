import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("Ice Crystal design system", () => {
  it("defines the approved ambient, surface, text, and motion tokens", () => {
    expect(css).toContain("--bg-base: #f3f7fb");
    expect(css).toContain("--ambient-blue: rgb(174 213 235 / 22%)");
    expect(css).toContain("--ambient-violet: rgb(205 210 242 / 14%)");
    expect(css).toContain("--ambient-mint: rgb(184 223 219 / 10%)");
    expect(css).toContain("--surface-base: rgb(255 255 255 / 36%)");
    expect(css).toContain("--surface-frosted: rgb(255 255 255 / 62%)");
    expect(css).toContain("--surface-liquid: rgb(255 255 255 / 68%)");
    expect(css).toContain("--border-soft: rgb(90 120 140 / 10%)");
    expect(css).toContain("--border-glass: rgb(255 255 255 / 70%)");
    expect(css).toContain("--border-frosted-secondary: rgb(120 150 170 / 10%)");
    expect(css).toContain("--text-primary: #182531");
    expect(css).toContain("--text-secondary: #60717e");
    expect(css).toContain("--text-muted: #82919c");
    expect(css).toContain("--positive: #477a69");
    expect(css).toContain("--negative: #9a625e");
    expect(css).toContain("--shadow-card: 0 10px 35px rgb(60 90 115 / 5%)");
    expect(css).toContain("--shadow-floating: 0 6px 20px rgb(60 90 115 / 7%)");
    expect(css).toContain("--blur-frosted: 24px");
    expect(css).toContain("--blur-liquid: 30px");
  });

  it("applies the three ambient gradients before the base background", () => {
    const bodyRule = css.match(/body\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const blue = bodyRule.indexOf("var(--ambient-blue)");
    const violet = bodyRule.indexOf("var(--ambient-violet)");
    const mint = bodyRule.indexOf("var(--ambient-mint)");
    const base = bodyRule.indexOf("var(--bg-base)");

    expect(blue).toBeGreaterThanOrEqual(0);
    expect(violet).toBeGreaterThan(blue);
    expect(mint).toBeGreaterThan(violet);
    expect(base).toBeGreaterThan(mint);
  });

  it("keeps blur on frosted and liquid utilities with opaque fallbacks", () => {
    const baseRule = css.match(/\.surface-base\s*\{([^}]*)\}/)?.[1] ?? "";
    const frostedRule = css.match(/\.surface-frosted\s*\{([^}]*)\}/)?.[1] ?? "";
    const liquidRule = css.match(/\.surface-liquid\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(baseRule).toContain("background: var(--surface-base)");
    expect(frostedRule).toContain(
      "background: var(--surface-frosted-fallback)",
    );
    expect(frostedRule).toContain("border: 1px solid var(--border-glass)");
    expect(frostedRule).toContain("box-shadow: var(--shadow-card)");
    expect(liquidRule).toContain("background: var(--surface-liquid-fallback)");
    expect(liquidRule).toContain("border: 1px solid var(--border-glass)");
    expect(liquidRule).toContain("var(--shadow-floating)");
    expect(css).toMatch(
      /@supports not\s*\(\s*\(backdrop-filter:\s*blur\(1px\)\)/,
    );
    expect(css).toMatch(
      /@supports[\s\S]*?\.surface-frosted\s*\{[^}]*backdrop-filter:\s*blur\(var\(--blur-frosted\)\) saturate\(115%\)[^}]*-webkit-backdrop-filter:\s*blur\(var\(--blur-frosted\)\) saturate\(115%\)/,
    );
    expect(css).toMatch(
      /@supports[\s\S]*?\.surface-liquid\s*\{[^}]*backdrop-filter:\s*blur\(var\(--blur-liquid\)\) saturate\(120%\)[^}]*-webkit-backdrop-filter:\s*blur\(var\(--blur-liquid\)\) saturate\(120%\)/,
    );
    expect(baseRule).not.toContain("backdrop-filter");
  });

  it("sets numeric typography and reduced-motion boundaries", () => {
    expect(css).toMatch(
      /\.financial-number,\s*\.metric-card dd,\s*\.asset-summary-card dd,\s*\.history-table td\s*\{[^}]*font-variant-numeric:\s*tabular-nums[^}]*font-feature-settings:\s*"tnum"/,
    );
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(
      /\.app-shell \*,\s*\.app-shell \*::before,\s*\.app-shell \*::after\s*\{[^}]*scroll-behavior:\s*auto[^}]*transition-duration:\s*0\.01ms/,
    );
    expect(css).not.toMatch(/filter:\s*drop-shadow\([^)]*#[0-9a-f]{6}/i);
  });

  it("keeps focus, fallbacks, and data surfaces readable", () => {
    expect(css).toMatch(
      /:focus-visible\s*\{[^}]*outline:\s*2px solid[^}]*outline-offset:\s*2px/,
    );
    expect(css).toMatch(/@supports not\s*\(\s*\(backdrop-filter:/);
    expect(css).not.toMatch(/\.allocation-row\s*\{[^}]*backdrop-filter/);
    expect(css).not.toMatch(/\.trend-chart-canvas\s*\{[^}]*backdrop-filter/);
    expect(css).not.toMatch(/box-shadow:\s*0 20px 60px/);
  });

  it("keeps interactive controls large and removes transforms for reduced motion", () => {
    expect(css).toMatch(
      /button,\s*input,\s*select\s*\{[^}]*min-height:\s*40px/,
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?:hover[^}]*\{[^}]*transform:\s*none !important/,
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?:active[^}]*\{[^}]*transform:\s*none !important/,
    );
  });
});
