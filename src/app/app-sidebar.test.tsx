import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portfolio",
  useSearchParams: () => new URLSearchParams("month=2026-08"),
}));

import { AppSidebar } from "@/app/app-sidebar";

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
});
