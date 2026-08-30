import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import DashboardError from "@/app/(dashboard)/error";
import DashboardLoading from "@/app/(dashboard)/loading";
import RootError from "@/app/error";

describe("route states", () => {
  it("leaves product identity to the shared layout while loading", () => {
    const markup = renderToStaticMarkup(createElement(DashboardLoading));

    expect(markup).toContain("正在载入");
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('class="dashboard-loading page-content"');
    expect(markup).not.toContain('class="app-shell"');
    expect(markup).not.toContain("Gold-Finger");
  });

  it("keeps recoverable dashboard errors inside the shared layout", () => {
    const markup = renderToStaticMarkup(
      createElement(DashboardError, {
        error: new Error("database unavailable"),
        retry: vi.fn(),
      }),
    );

    expect(markup).toContain("暂时无法读取财务记录");
    expect(markup).toContain("重新载入");
    expect(markup).not.toContain("Gold-Finger");
  });

  it("keeps the root error boundary minimal", () => {
    const markup = renderToStaticMarkup(
      createElement(RootError, {
        error: new Error("root failure"),
        retry: vi.fn(),
      }),
    );

    expect(markup).toContain("暂时无法载入应用");
    expect(markup).toContain("重新载入");
    expect(markup).not.toContain("app-sidebar");
  });
});
