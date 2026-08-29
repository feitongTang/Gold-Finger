import { describe, expect, it } from "vitest";

import {
  currentMonth,
  monthHref,
  resolveMonthQuery,
} from "@/features/monthly-snapshots/month-routing";

describe("month routing", () => {
  it("resolves one string month and rejects array input", () => {
    expect(resolveMonthQuery({ month: "2026-08" }, "2026-07")).toBe("2026-08");
    expect(resolveMonthQuery({ month: ["2026-08"] }, "2026-07")).toBe(
      "2026-07",
    );
  });

  it("builds month-aware business links", () => {
    expect(monthHref("/portfolio", "2026-08")).toBe("/portfolio?month=2026-08");
  });

  it("derives the natural month from an injected date", () => {
    expect(currentMonth(new Date(2026, 7, 28))).toBe("2026-08");
  });
});
