import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("fixed design system", () => {
  it("defines the approved Prussian blue and fog gray finance tokens", () => {
    expect(css).toContain("--background-primary: #f2f4f3");
    expect(css).toContain("--background-secondary: #e8ebeb");
    expect(css).toContain("--surface-primary: #f8faf9");
    expect(css).toContain("--text-primary: #202b31");
    expect(css).toContain("--accent-primary: #003153");
    expect(css).toContain("--accent-soft: #dfe7eb");
    expect(css).toContain("--asset-cash: #6f9399");
    expect(css).toContain("--asset-investment: #536b89");
    expect(css).toContain("--chart-net-worth: #003153");
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
