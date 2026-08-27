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
    expect(css).toContain("--border-interactive: #819096");
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

  it("maps each financial meaning to one approved color role", () => {
    expect(css).toMatch(/\.asset-bar\s*\{[^}]*background:\s*var\(--fog-gray\)/);
    expect(css).toMatch(
      /\.asset-bar-cash\s*\{[^}]*background:\s*var\(--asset-cash\)/,
    );
    expect(css).toMatch(
      /\.asset-bar-investment\s*\{[^}]*background:\s*var\(--asset-investment\)/,
    );
    expect(css).toMatch(
      /\.asset-legend-cash\s*\{[^}]*background:\s*var\(--asset-cash\)/,
    );
    expect(css).toMatch(
      /\.asset-legend-investment\s*\{[^}]*background:\s*var\(--asset-investment\)/,
    );
    expect(css).toMatch(
      /\.allocation-bar\s*\{[^}]*background:\s*var\(--fog-gray\)/,
    );
    expect(css).toMatch(
      /\.allocation-bar span\s*\{[^}]*background:\s*var\(--asset-investment\)/,
    );
    expect(css).toMatch(
      /\.allocation-row strong\s*\{[^}]*color:\s*var\(--asset-investment\)/,
    );
    expect(css).toMatch(
      /\.trend-series-income\s*\{[^}]*color:\s*var\(--chart-income\)/,
    );
  });

  it("keeps structural surfaces neutral and accent color action-oriented", () => {
    expect(css).toMatch(
      /\.page-intro h1\s*\{[^}]*color:\s*var\(--text-primary\)/,
    );
    expect(css).toMatch(
      /\.month-switcher-arrow\s*\{[^}]*background:\s*var\(--surface-primary\)/,
    );
    expect(css).toMatch(
      /\.secondary-button\s*\{[^}]*background:\s*var\(--surface-primary\)/,
    );
    expect(css).toMatch(
      /\.consistency-difference-warning\s*\{[^}]*color:\s*var\(--warning\)[^}]*background:\s*var\(--warning-soft\)/,
    );
    expect(css).toMatch(
      /\.data-safety-eyebrow\s*\{[^}]*color:\s*var\(--text-secondary\)/,
    );
  });

  it("gives form controls a dedicated interactive boundary and focus halo", () => {
    expect(css).toMatch(
      /input,\s*select\s*\{[^}]*border:\s*1px solid var\(--border-interactive\)/,
    );
    expect(css).toMatch(
      /input:focus,\s*select:focus\s*\{[^}]*border-color:\s*var\(--accent-primary\)[^}]*box-shadow:\s*0 0 0 3px var\(--focus-ring\)/,
    );
    expect(css).toMatch(
      /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-primary\)/,
    );
  });

  it("maps month navigation hover and keyboard focus to accent roles", () => {
    expect(css).toMatch(
      /\.month-switcher-arrow:hover,\s*\.month-switcher-arrow:focus-visible\s*\{[^}]*border-color:\s*var\(--accent-primary\)[^}]*color:\s*var\(--accent-hover\)[^}]*background:\s*var\(--accent-soft\)/,
    );
  });

  it("maps enabled primary and retry pressed states to the active accent", () => {
    expect(css).toMatch(
      /\.primary-button:active:not\(:disabled\),\s*\.retry-button:active:not\(:disabled\)\s*\{[^}]*border-color:\s*var\(--accent-active\)[^}]*background:\s*var\(--accent-active\)/,
    );
    expect(css).toMatch(
      /\.primary-button:active:not\(:disabled\),\s*\.secondary-button:active:not\(:disabled\),\s*\.danger-button:active:not\(:disabled\),\s*\.retry-button:active:not\(:disabled\)\s*\{[^}]*transform:\s*scale\(0\.99\)/,
    );
  });
});
