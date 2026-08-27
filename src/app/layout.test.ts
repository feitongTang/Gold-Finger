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
});
