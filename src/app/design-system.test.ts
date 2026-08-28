import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("fixed design system", () => {
  it("defines the approved airy low-saturation blue semantic palette", () => {
    expect(css).toContain("--fog-gray: #dbe7ef");
    expect(css).toContain("--background-primary: #f1f7fb");
    expect(css).toContain("--background-secondary: #e7f0f7");
    expect(css).toContain("--surface-primary: #ffffff");
    expect(css).toContain("--surface-subtle: #f7fafc");
    expect(css).toContain("--text-primary: #1b2b3c");
    expect(css).toContain("--text-secondary: #5c7182");
    expect(css).toContain("--text-inverse: #ffffff");
    expect(css).toContain("--border-interactive: #718899");
    expect(css).toContain("--accent-primary: #426e8b");
    expect(css).toContain("--accent-hover: #355f7b");
    expect(css).toContain("--accent-active: #294f69");
    expect(css).toContain("--accent-soft: #e5eff6");
    expect(css).toContain("--success: #3f6b5a");
    expect(css).toContain("--success-soft: #eef3f0");
    expect(css).toContain("--warning: #80663d");
    expect(css).toContain("--warning-soft: #f5f0e8");
    expect(css).toContain("--error: #98534e");
    expect(css).toContain("--error-soft: #f6ecea");
    expect(css).toContain("--asset-cash: #bbc6c8");
    expect(css).toContain("--asset-investment: #536b89");
    expect(css).toContain("--asset-stocks: var(--asset-investment)");
    expect(css).toContain("--asset-bonds: #7c9398");
    expect(css).toContain("--asset-other: #a48658");
    expect(css).toContain("--chart-net-worth: var(--accent-primary)");
    expect(css).toContain("--chart-cash: #7c9398");
    expect(css).toContain("--chart-investment: var(--asset-investment)");
    expect(css).toContain("--chart-income: var(--success)");
    expect(css).toContain("--chart-liability: var(--error)");
    expect(css).toContain("--radius-control: 10px");
    expect(css).toContain("--motion-normal: 180ms");
  });

  it("contains no legacy theme branches or decorative background glow", () => {
    expect(css).not.toMatch(/:root\[data-theme=/);
    expect(css).not.toContain("--background-glow-primary");
  });

  it("keeps Liquid Glass flat with directional edge highlights", () => {
    expect(css).toContain("--glass-surface: rgb(255 255 255 / 44%)");
    expect(css).toContain("--glass-surface-tinted: rgb(125 164 193 / 18%)");
    expect(css).toContain("--glass-surface-hover: rgb(255 255 255 / 58%)");
    expect(css).toContain("--glass-surface-pressed: rgb(125 164 193 / 25%)");
    expect(css).toContain("--glass-highlight-primary: rgb(255 255 255 / 82%)");
    expect(css).toContain(
      "--glass-highlight-secondary: rgb(109 155 188 / 38%)",
    );
    expect(css).toContain("--shadow-glass: 0 1px 2px rgb(41 79 105 / 5%)");
    expect(css).toMatch(
      /\.primary-button,\s*\.retry-button\s*\{[^}]*border:\s*1px solid transparent[^}]*background:\s*var\(--glass-surface-tinted\)[^}]*backdrop-filter:\s*blur\(18px\) saturate\(112%\)[^}]*box-shadow:\s*var\(--shadow-glass\)/,
    );
    expect(css).toMatch(
      /\.month-switcher-arrow\s*\{[^}]*border:\s*1px solid transparent[^}]*background:\s*var\(--glass-surface\)[^}]*backdrop-filter:\s*blur\(18px\) saturate\(112%\)/,
    );
    expect(css).toMatch(
      /\.primary-button::before,[\s\S]*?\.month-switcher-arrow::before\s*\{[^}]*border-top:\s*1px solid var\(--glass-highlight-primary\)[^}]*border-left:\s*1px solid var\(--glass-highlight-primary\)/,
    );
    expect(css).toMatch(
      /\.primary-button::after,[\s\S]*?\.month-switcher-arrow::after\s*\{[^}]*border-right:\s*1px solid var\(--glass-highlight-secondary\)[^}]*border-bottom:\s*1px solid var\(--glass-highlight-secondary\)/,
    );
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
    expect(css).toMatch(
      /\.asset-allocation-overview-bar\s*\{[^}]*background:\s*var\(--fog-gray\)/,
    );
    expect(css).toMatch(
      /\.allocation-tone-stocks\s*\{[^}]*--allocation-color:\s*var\(--asset-stocks\)/,
    );
    expect(css).toMatch(
      /\.allocation-tone-bonds\s*\{[^}]*--allocation-color:\s*var\(--asset-bonds\)/,
    );
    expect(css).toMatch(
      /\.allocation-tone-other\s*\{[^}]*--allocation-color:\s*var\(--asset-other\)/,
    );
    expect(css).toMatch(
      /\.allocation-tone-cash\s*\{[^}]*--allocation-color:\s*var\(--asset-cash\)/,
    );
    expect(css).toMatch(
      /\.asset-allocation-segment\s*\{[^}]*background:\s*var\(--allocation-color\)/,
    );
    expect(css).toMatch(
      /\.allocation-bar\s*\{[^}]*background:\s*var\(--fog-gray\)/,
    );
    expect(css).toMatch(
      /\.allocation-bar span\s*\{[^}]*background:\s*var\(--allocation-color\)/,
    );
    expect(css).toMatch(
      /\.allocation-percentages strong\s*\{[^}]*color:\s*var\(--text-primary\)/,
    );
    expect(css).toMatch(
      /\.allocation-percentages span\s*\{[^}]*color:\s*var\(--text-secondary\)/,
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
      /\.month-switcher-arrow\s*\{[^}]*background:\s*var\(--glass-surface\)/,
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

  it("keeps month navigation translucent on hover and keyboard focus", () => {
    expect(css).toMatch(
      /\.month-switcher-arrow:hover,\s*\.month-switcher-arrow:focus-visible\s*\{[^}]*border-color:\s*transparent[^}]*color:\s*var\(--accent-hover\)[^}]*background:\s*var\(--glass-surface-hover\)/,
    );
  });

  it("deepens the glass tint without making pressed buttons look embossed", () => {
    expect(css).toMatch(
      /\.primary-button:active:not\(:disabled\),\s*\.retry-button:active:not\(:disabled\)\s*\{[^}]*border-color:\s*transparent[^}]*background:\s*var\(--glass-surface-pressed\)/,
    );
    expect(css).toMatch(
      /\.primary-button:active:not\(:disabled\),\s*\.secondary-button:active:not\(:disabled\),\s*\.danger-button:active:not\(:disabled\),\s*\.retry-button:active:not\(:disabled\)\s*\{[^}]*transform:\s*scale\(0\.99\)/,
    );
  });
});
