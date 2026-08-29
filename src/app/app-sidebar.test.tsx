import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portfolio",
  useSearchParams: () => new URLSearchParams("month=2026-08"),
}));

import { AppSidebar } from "@/app/app-sidebar";

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("AppSidebar", () => {
  it("renders month-aware primary navigation and a month-free data link", () => {
    const markup = renderToStaticMarkup(createElement(AppSidebar));

    expect(markup).toContain("Gold-Finger");
    expect(markup).toContain("月度财务复盘");
    expect(markup).toContain('href="/?month=2026-08"');
    expect(markup).toContain('href="/portfolio?month=2026-08"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('href="/data"');
    expect(markup).not.toContain("资产管理");
    expect(markup).not.toContain("设置中心");
  });

  it("keeps the desktop text sidebar fixed, readable, and keyboard visible", () => {
    expect(css).toMatch(
      /\.app-shell\s*\{[^}]*grid-template-columns:\s*210px minmax\(0, 1fr\)/,
    );
    expect(css).toMatch(
      /\.app-sidebar\s*\{[^}]*position:\s*sticky[^}]*min-height:\s*100dvh/,
    );
    expect(css).toMatch(
      /\.app-sidebar nav a,[\s\S]*?\.sidebar-utilities a\s*\{[^}]*min-height:\s*40px/,
    );
    expect(css).toMatch(
      /\.app-sidebar a\[aria-current="page"\]\s*\{[^}]*color:\s*var\(--text-primary\)/,
    );
    expect(css).toMatch(
      /\.app-sidebar a:focus-visible\s*\{[^}]*outline:\s*2px solid/,
    );
    expect(css).toMatch(/\.sidebar-utilities\s*\{[^}]*margin-top:\s*auto/);
  });
});
