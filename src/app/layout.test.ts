import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("renders fixed product markup without theme bootstrap state", () => {
    const markup = renderToStaticMarkup(
      createElement(RootLayout, null, createElement("main", null, "内容")),
    );

    expect(markup).toContain('<html lang="zh-CN">');
    expect(markup).not.toContain("data-theme");
    expect(markup).not.toContain("gold-finger-theme-v1");
    expect(markup).not.toContain("localStorage");
  });

  it("defines all dashboard routes inside the shared route group", () => {
    const routes = [
      "src/app/(dashboard)/page.tsx",
      "src/app/(dashboard)/records/page.tsx",
      "src/app/(dashboard)/portfolio/page.tsx",
      "src/app/(dashboard)/trends/page.tsx",
      "src/app/(dashboard)/data/page.tsx",
    ];

    for (const route of routes) {
      expect(existsSync(route), `${route} should exist`).toBe(true);
    }
    expect(existsSync("src/app/page.tsx")).toBe(false);
  });
});
