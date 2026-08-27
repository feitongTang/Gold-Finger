import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppHeader } from "@/app/app-header";

describe("AppHeader", () => {
  it("renders one quiet product identity without appearance controls", () => {
    const markup = renderToStaticMarkup(createElement(AppHeader));

    expect(markup).toContain("Gold-Finger");
    expect(markup).toContain("月度财务复盘");
    expect(markup).not.toContain("外观设置");
    expect(markup).not.toContain("<button");
  });

  it("can be hidden from assistive technology in route skeletons", () => {
    const markup = renderToStaticMarkup(
      createElement(AppHeader, { ariaHidden: true }),
    );

    expect(markup).toContain('aria-hidden="true"');
  });
});
