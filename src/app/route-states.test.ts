import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";
import Loading from "@/app/loading";

describe("route states", () => {
  it("keeps loading inside the product shell", () => {
    const markup = renderToStaticMarkup(createElement(Loading));

    expect(markup).toContain("Gold-Finger");
    expect(markup).toContain("正在载入月度记录");
    expect(markup).toContain("page-content");
  });

  it("keeps recoverable errors inside the product shell", () => {
    const markup = renderToStaticMarkup(
      createElement(ErrorPage, { reset: vi.fn() }),
    );

    expect(markup).toContain("Gold-Finger");
    expect(markup).toContain("暂时无法读取财务记录");
    expect(markup).toContain("重新载入");
  });
});
