import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("Glacier Scale design system", () => {
  it("defines the approved Glacier Scale token roles", () => {
    expect(css).toContain("--background: #f4f8fb");
    expect(css).toContain("--ambient-ice: rgb(168 221 248 / 14%)");
    expect(css).toContain("--ambient-air: rgb(211 235 249 / 12%)");
    expect(css).toContain("--surface-solid: rgb(255 255 255 / 82%)");
    expect(css).toContain("--surface-frosted: rgb(255 255 255 / 48%)");
    expect(css).toContain("--surface-interactive: rgb(238 248 255 / 60%)");
    expect(css).toContain("--surface-frosted-fallback: rgb(249 252 254 / 94%)");
    expect(css).toContain(
      "--surface-interactive-fallback: rgb(242 249 253 / 96%)",
    );
    expect(css).toContain("--text-primary: #22313a");
    expect(css).toContain("--text-secondary: #657784");
    expect(css).toContain("--text-muted: #8294a0");
    expect(css).toContain("--ice-blue: #82bde2");
    expect(css).toContain("--ice-blue-strong: #3f7fa8");
    expect(css).toContain("--positive: #487f9b");
    expect(css).toContain("--negative: #a36f75");
    expect(css).toContain("--blur-frosted: 16px");
    expect(css).toContain("--blur-interactive: 22px");
    expect(css).not.toContain("--ambient-violet");
    expect(css).not.toContain("--ambient-mint");
  });

  it("keeps ambient ice light outside a clean mist-white base", () => {
    const bodyRule = css.match(/body\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const ice = bodyRule.indexOf("var(--ambient-ice)");
    const air = bodyRule.indexOf("var(--ambient-air)");
    const base = bodyRule.indexOf("var(--background)");

    expect(ice).toBeGreaterThanOrEqual(0);
    expect(air).toBeGreaterThan(ice);
    expect(base).toBeGreaterThan(air);
  });

  it("limits blur to persistent and interactive glass with near-solid fallbacks", () => {
    const baseRule = css.match(/\.surface-base\s*\{([^}]*)\}/)?.[1] ?? "";
    const frostedRule = css.match(/\.surface-frosted\s*\{([^}]*)\}/)?.[1] ?? "";
    const liquidRule = css.match(/\.surface-liquid\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(baseRule).toContain("background: var(--surface-solid)");
    expect(baseRule).not.toContain("backdrop-filter");
    expect(frostedRule).toContain(
      "background: var(--surface-frosted-fallback)",
    );
    expect(frostedRule).toContain("var(--shadow-frosted)");
    expect(liquidRule).toContain(
      "background: var(--surface-interactive-fallback)",
    );
    expect(liquidRule).toContain("var(--shadow-interactive)");
    expect(css).toMatch(
      /\.surface-frosted\s*\{[^}]*backdrop-filter:\s*blur\(var\(--blur-frosted\)\)/,
    );
    expect(css).toMatch(
      /\.surface-liquid\s*\{[^}]*backdrop-filter:\s*blur\(var\(--blur-interactive\)\)/,
    );
    expect(css).toMatch(/@supports not\s*\(\s*\(backdrop-filter:/);
  });

  it("keeps the sidebar frosted while current navigation uses a small ice-blue scale", () => {
    expect(css).toMatch(
      /\.app-sidebar\s*\{[^}]*background:\s*var\(--surface-frosted\)[^}]*backdrop-filter:\s*blur\(var\(--blur-frosted\)\)/,
    );
    expect(css).toMatch(
      /\.app-sidebar a\[aria-current="page"\]\s*\{[^}]*background:\s*var\(--ice-blue-soft\)[^}]*box-shadow:\s*none/,
    );
    expect(css).toMatch(
      /\.app-sidebar a\[aria-current="page"\]::before\s*\{[^}]*background:\s*var\(--ice-blue\)/,
    );
  });

  it("keeps shared interactive glass pale and only slightly elevated", () => {
    expect(css).toMatch(
      /\.primary-button,[\s\S]*?\.retry-button\s*\{[^}]*background:\s*var\(--surface-interactive-fallback\)[^}]*box-shadow:\s*var\(--shadow-interactive\)/,
    );
    expect(css).toMatch(
      /\.primary-button:hover:not\(:disabled\)[^}]*background:\s*color-mix\(\s*in srgb,\s*var\(--ice-blue\) 12%,\s*var\(--surface-interactive-fallback\)\s*\)/,
    );
    expect(css).not.toMatch(/translateY\(-1px\)/);
    expect(css).not.toMatch(/scale\(0\.98\)/);
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

  it("keeps dashboard financial amounts on one readable line", () => {
    expect(css).toMatch(
      /\.review-asset-summary dd,\s*\.monthly-flow-metric dd\s*\{[^}]*white-space:\s*nowrap/,
    );
  });

  it("reflows dashboard panels for high browser zoom", () => {
    expect(css).toMatch(
      /@media \(max-width:\s*56rem\)[\s\S]*?\.review-status-card\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    expect(css).toMatch(
      /@media \(max-width:\s*56rem\)[\s\S]*?\.review-asset-summary\s*>\s*div\s*\{[^}]*padding-inline:\s*var\(--space-4\)/,
    );
    expect(css).toMatch(
      /@media \(max-width:\s*56rem\)[\s\S]*?\.monthly-flow-strip\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
    );
    expect(css).toMatch(
      /@media \(max-width:\s*56rem\)[\s\S]*?\.review-analysis-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
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

  it("keeps chart canvases flat and uses ice-blue interactive details", () => {
    expect(css).toMatch(
      /\.trend-chart-canvas\s*\{[^}]*background:\s*transparent/,
    );
    expect(css).not.toMatch(/\.trend-chart-canvas\s*\{[^}]*backdrop-filter/);
    expect(css).toMatch(
      /\.trend-series-net-worth\s*\{[^}]*color:\s*var\(--chart-net-worth\)/,
    );
    expect(css).toMatch(
      /\.trend-chart-tooltip rect\s*\{[^}]*fill:\s*var\(--surface-interactive-fallback\)[^}]*stroke:\s*var\(--border-glass\)/,
    );
  });

  it("uses one light shell and flat data interiors on review and portfolio", () => {
    expect(css).toMatch(
      /\.review-status-card\s*\{[^}]*background:\s*var\(--surface-frosted-fallback\)[^}]*box-shadow:[^}]*var\(--shadow-frosted\)/,
    );
    expect(css).toMatch(
      /\.review-analysis-panel\s*\{[^}]*background:\s*var\(--surface-solid\)/,
    );
    expect(css).not.toMatch(/\.allocation-row\s*\{[^}]*backdrop-filter/);
    expect(css).toMatch(
      /\.allocation-row-button:hover[^}]*background:\s*color-mix\(in srgb, var\(--ice-blue\) 6%, transparent\)/,
    );
    expect(css).toMatch(
      /\.portfolio-holdings-table\s*\{[^}]*background:\s*var\(--surface-solid\)/,
    );
  });

  it("keeps monthly records in one light shell with solid data fields", () => {
    expect(css).toMatch(
      /\.snapshot-form\s*\{[^}]*background:\s*var\(--surface-frosted-fallback\)[^}]*box-shadow:[^}]*var\(--shadow-frosted\)/,
    );
    expect(css).toMatch(
      /input,[\s\S]*?select\s*\{[^}]*background:\s*var\(--surface-solid\)/,
    );
    expect(css).toMatch(
      /\.fund-row\s*\{[^}]*background:\s*var\(--surface-solid\)[^}]*box-shadow:\s*none/,
    );
    expect(css).not.toMatch(/\.fund-row\s*\{[^}]*backdrop-filter/);
    expect(css).toMatch(
      /\.section-marker\s*\{[^}]*color:\s*var\(--ice-blue-strong\)[^}]*background:\s*var\(--ice-blue-soft\)/,
    );
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
