import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { MonthSwitcher } from "@/features/monthly-snapshots/month-switcher";

it("links to the adjacent months on the current business page", () => {
  const markup = renderToStaticMarkup(
    createElement(MonthSwitcher, {
      month: "2026-08",
      pathname: "/portfolio",
    }),
  );

  expect(markup).toContain('href="/portfolio?month=2026-07"');
  expect(markup).toContain('href="/portfolio?month=2026-09"');
  expect(markup).toContain('<time dateTime="2026-08">2026-08</time>');
});
