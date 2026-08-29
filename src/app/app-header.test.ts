import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/app/app-shell";

describe("AppShell", () => {
  it("renders shared navigation beside route content", () => {
    const markup = renderToStaticMarkup(
      createElement(AppShell, null, createElement("section", null, "页面内容")),
    );

    expect(markup).toContain('class="app-shell"');
    expect(markup).toContain('class="app-main"');
    expect(markup).toContain("页面内容");
  });
});
