import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("Glacier Scale design system", () => {
  it("defines the approved Glacier Scale token roles", () => {
    expect(css).toContain("--background: #e8f4fa");
    expect(css).toContain("--ambient-ice: rgb(92 190 239 / 38%)");
    expect(css).toContain("--ambient-air: rgb(142 218 239 / 30%)");
    expect(css).toContain("--ambient-mint: rgb(121 218 190 / 25%)");
    expect(css).toContain("--ambient-lilac: rgb(178 154 226 / 24%)");
    expect(css).toContain("--surface-solid: rgb(255 255 255 / 76%)");
    expect(css).toContain("--surface-frosted: rgb(255 255 255 / 36%)");
    expect(css).toContain("--surface-interactive: rgb(238 248 255 / 48%)");
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
    expect(css).toContain("--border-glass: rgb(255 255 255 / 88%)");
    expect(css).toContain("--blur-frosted: 22px");
    expect(css).toContain("--blur-interactive: 26px");
    expect(css).not.toContain("--ambient-violet");
  });

  it("blends cool ambient hues before the clean mist-white base", () => {
    const bodyRule = css.match(/body\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const ice = bodyRule.indexOf("var(--ambient-ice)");
    const air = bodyRule.indexOf("var(--ambient-air)");
    const mint = bodyRule.indexOf("var(--ambient-mint)");
    const lilac = bodyRule.indexOf("var(--ambient-lilac)");
    const base = bodyRule.indexOf("var(--background)");

    expect(ice).toBeGreaterThanOrEqual(0);
    expect(air).toBeGreaterThan(ice);
    expect(mint).toBeGreaterThan(air);
    expect(lilac).toBeGreaterThan(mint);
    expect(base).toBeGreaterThan(lilac);
    expect(bodyRule).toMatch(/linear-gradient\(\s*145deg/);
    expect(bodyRule).not.toMatch(/url\(|repeating-/);
  });

  it("uses frosted glass for every shared module surface", () => {
    const baseRule = css.match(/\.surface-base\s*\{([^}]*)\}/)?.[1] ?? "";
    const frostedRule = css.match(/\.surface-frosted\s*\{([^}]*)\}/)?.[1] ?? "";
    const liquidRule = css.match(/\.surface-liquid\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(baseRule).toContain("background: var(--surface-frosted-fallback)");
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
      /\.surface-base\s*\{[^}]*backdrop-filter:\s*blur\(var\(--blur-frosted\)\)/,
    );
    expect(css).toMatch(
      /\.surface-liquid\s*\{[^}]*backdrop-filter:\s*blur\(var\(--blur-interactive\)\)/,
    );
    expect(css).not.toContain("saturate(108%)");
    expect(css).not.toContain("saturate(112%)");
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

  it("keeps shared interactive glass pale without moving controls on hover", () => {
    expect(css).toMatch(
      /\.primary-button,[\s\S]*?\.retry-button\s*\{[^}]*background:\s*var\(--surface-interactive-fallback\)[^}]*box-shadow:\s*var\(--shadow-interactive\)/,
    );
    expect(css).toMatch(
      /\.primary-button:hover:not\(:disabled\)[^}]*background:\s*color-mix\(\s*in srgb,\s*var\(--ice-blue\) 12%,\s*var\(--surface-interactive-fallback\)\s*\)/,
    );
    expect(css).not.toContain("translateY(-1px)");
    expect(css).not.toContain("translateX(2px)");
    expect(css).not.toMatch(/scale\(0\.98\)/);
  });

  it("keeps review tooltips more readable than full-history tooltips", () => {
    expect(css).toMatch(
      /\.trend-chart-preview\s*\{[^}]*--trend-tooltip-label-size:\s*20px[^}]*--trend-tooltip-value-size:\s*24px/,
    );
    expect(css).toMatch(
      /\.trend-chart-full\s*\{[^}]*--trend-tooltip-label-size:\s*10px[^}]*--trend-tooltip-value-size:\s*12px/,
    );
    expect(css).toMatch(
      /\.trend-chart-tooltip-label\s*\{[^}]*font-size:\s*var\(--trend-tooltip-label-size\)/,
    );
    expect(css).toMatch(
      /\.trend-chart-tooltip-value\s*\{[^}]*font-size:\s*var\(--trend-tooltip-value-size\)/,
    );
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

  it("uses equal-height frosted summary modules with a flat allocation preview", () => {
    expect(css).toMatch(
      /\.review-status-card\s*\{[^}]*background:\s*var\(--surface-frosted-fallback\)[^}]*box-shadow:[^}]*var\(--shadow-frosted\)/,
    );
    expect(css).toMatch(
      /\.review-analysis-panel\s*\{[^}]*background:\s*var\(--surface-frosted-fallback\)/,
    );
    expect(css).toMatch(
      /\.review-analysis-grid\s*\{[^}]*align-items:\s*stretch/,
    );
    expect(css).toMatch(
      /\.review-analysis-panel\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/,
    );
    expect(css).toMatch(
      /\.review-analysis-grid \.asset-allocation\s*\{[^}]*display:\s*grid[^}]*flex:\s*1[^}]*align-items:\s*center[^}]*border:\s*0/,
    );
    expect(css).not.toMatch(/\.allocation-row\s*\{[^}]*backdrop-filter/);
    expect(css).toMatch(
      /\.allocation-row-button:hover[^}]*background:\s*color-mix\(in srgb, var\(--ice-blue\) 6%, transparent\)/,
    );
    expect(css).toMatch(
      /\.portfolio-holdings-table\s*\{[^}]*background:\s*transparent/,
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

  it("keeps data safety modules on the shared frosted surface", () => {
    expect(css).toMatch(
      /\.data-safety-panel\s*\{[^}]*background:\s*var\(--surface-frosted-fallback\)/,
    );
    expect(css).not.toMatch(
      /\.safety-card\s*\{[^}]*background:\s*var\(--surface-solid\)/,
    );
  });

  it("uses static loading and complete reduced-motion boundaries", () => {
    expect(css).not.toContain("@keyframes skeleton-shimmer");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transition-duration:\s*0\.01ms !important/,
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transform:\s*none !important/,
    );
  });

  it("keeps every dense data surface unblurred", () => {
    for (const selector of [
      ".allocation-row",
      ".trend-chart-canvas",
      ".fund-row",
      ".safety-card",
      ".portfolio-holdings-table",
      ".history-table",
    ]) {
      const escaped = selector.replace(".", "\\.");
      const rule =
        css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
      expect(rule).not.toContain("backdrop-filter");
    }
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
