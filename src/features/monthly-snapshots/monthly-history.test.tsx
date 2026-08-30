import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MonthlyHistory } from "@/features/monthly-snapshots/monthly-history";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

function createSnapshot(month: string, id: number): MonthlySnapshot {
  return {
    id,
    month,
    cashFlow: {
      incomeCents: id * 100_000,
      expenseCents: id * 40_000,
      investmentProfitLossCents: id * 1_000,
      investmentContributionCents: 0,
    },
    cash: {
      emergencyFundCents: id * 50_000,
      goalFundCents: id * 20_000,
      dailyCashCents: id * 10_000,
    },
    funds: [],
    liabilities: { huabeiBalanceCents: id * 2_000 },
  };
}

describe("MonthlyHistory", () => {
  it("renders the full trends page and exact financial table columns", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyHistory, {
        month: "2026-08",
        snapshots: [createSnapshot("2026-07", 1), createSnapshot("2026-08", 2)],
      }),
    );

    expect(markup).toContain("历史趋势");
    expect(markup).toContain(">资产</button>");
    expect(markup).toContain(">收支</button>");
    expect(markup).not.toContain(">资产变化</button>");
    expect(markup).not.toContain(">收支变化</button>");
    expect(markup).toContain("2026 年 8 月");
    expect(markup).toContain("月度财务趋势数据表");
    expect(markup).toContain("月度结余");
    expect(markup).toContain("净资产");
    expect(markup).toContain("收入");
    expect(markup).toContain("支出");
    expect(markup).toContain("现金");
    expect(markup).toContain("投资");
    expect(markup).toContain("负债");
  });

  it("limits the selected end-month window to six saved months", () => {
    const snapshots = [
      createSnapshot("2026-01", 1),
      createSnapshot("2026-02", 2),
      createSnapshot("2026-03", 3),
      createSnapshot("2026-04", 4),
      createSnapshot("2026-05", 5),
      createSnapshot("2026-06", 6),
      createSnapshot("2026-07", 7),
      createSnapshot("2026-08", 8),
      createSnapshot("2026-09", 9),
    ];
    const markup = renderToStaticMarkup(
      createElement(MonthlyHistory, { month: "2026-08", snapshots }),
    );

    expect(markup).toContain("共 6 个已保存月份");
    expect(markup).toContain("2026 年 3 月");
    expect(markup).not.toContain("2026 年 2 月");
    expect(markup).not.toContain("2026 年 9 月");
  });

  it("links an empty history window to the selected record month", () => {
    const markup = renderToStaticMarkup(
      createElement(MonthlyHistory, {
        month: "2026-08",
        snapshots: [],
      }),
    );

    expect(markup).toContain("保存第一份月度记录后");
    expect(markup).toContain('href="/records?month=2026-08"');
  });
});
