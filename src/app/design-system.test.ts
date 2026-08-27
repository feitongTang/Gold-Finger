import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("fixed design system", () => {
  it("defines the approved Prussian blue and fog gray semantic palette", () => {
    expect(css).toContain("--fog-gray: #e5ddd7");
    expect(css).toContain("--background-primary: #f6f8f8");
    expect(css).toContain("--background-secondary: var(--fog-gray)");
    expect(css).toContain("--surface-primary: #ffffff");
    expect(css).toContain("--surface-subtle: #f7f5f3");
    expect(css).toContain("--text-primary: #1d2c34");
    expect(css).toContain("--text-secondary: #58676f");
    expect(css).toContain("--text-inverse: #ffffff");
    expect(css).toContain("--accent-primary: #003153");
    expect(css).toContain("--accent-hover: #002944");
    expect(css).toContain("--accent-active: #001f33");
    expect(css).toContain("--accent-soft: #eaf0f2");
    expect(css).toContain("--success: #3f6b5a");
    expect(css).toContain("--success-soft: #eef3f0");
    expect(css).toContain("--warning: #80663d");
    expect(css).toContain("--warning-soft: #f5f0e8");
    expect(css).toContain("--error: #98534e");
    expect(css).toContain("--error-soft: #f6ecea");
    expect(css).toContain("--asset-cash: #bbc6c8");
    expect(css).toContain("--asset-investment: #536b89");
    expect(css).toContain("--chart-net-worth: var(--accent-primary)");
    expect(css).toContain("--chart-cash: #7c9398");
    expect(css).toContain("--chart-investment: var(--asset-investment)");
    expect(css).toContain("--chart-income: var(--success)");
    expect(css).toContain("--chart-liability: var(--error)");
    expect(css).toContain("--radius-control: 8px");
    expect(css).toContain("--motion-normal: 180ms");
  });

  it("contains no legacy theme branches or glass tokens", () => {
    expect(css).not.toMatch(/:root\[data-theme=/);
    expect(css).not.toContain("--glass-surface");
    expect(css).not.toContain("--background-glow-primary");
  });

  it("provides reduced-motion handling", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).not.toMatch(
      /\*,\s*\*::before,\s*\*::after\s*\{[^}]*transform:\s*none\s*!important/,
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.trend-chart-hit-target:hover \+ \.trend-chart-point[\s\S]*?transform:\s*none\s*!important/,
    );
  });

  it("uses the shared motion tokens for component transitions", () => {
    expect(css).not.toContain("180ms ease");
  });

  it("keeps compact interactive controls at least 40px tall", () => {
    expect(css).toMatch(/\.danger-text-button\s*\{[^}]*min-height:\s*40px/);
    expect(css).toMatch(
      /\.trend-chart-toggle button\s*\{[^}]*min-height:\s*40px/,
    );
    expect(css).toMatch(
      /\.record-delete-actions \.secondary-button,[^}]*min-height:\s*40px/,
    );
    expect(css).toMatch(
      /\.restore-confirmation \.secondary-button,[^}]*min-height:\s*40px/,
    );
    expect(css).toMatch(/\.form-error-link\s*\{[^}]*min-height:\s*40px/);
  });

  it("clips each two-option trend switcher inside its own grid", () => {
    expect(css).toMatch(
      /\.trend-chart-toggle\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)[^}]*overflow:\s*hidden/,
    );
  });

  it("aligns the safety introduction with the cards below", () => {
    expect(css).toMatch(/\.data-safety-heading\s*\{[^}]*display:\s*block/);
    expect(css).toMatch(
      /\.data-safety-heading > p\s*\{[^}]*max-width:\s*42rem/,
    );
  });

  it("keeps the asset composition colors distinct and readable", () => {
    expect(css).toMatch(/\.asset-bar\s*\{[^}]*height:\s*8px/);
    expect(css).toMatch(
      /\.asset-bar-investment\s*\{[^}]*background:\s*var\(--asset-investment\)/,
    );
    expect(css).toMatch(
      /\.asset-legend-investment\s*\{[^}]*background:\s*var\(--asset-investment\)/,
    );
  });
});
