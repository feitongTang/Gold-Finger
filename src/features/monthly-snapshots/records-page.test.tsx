// @vitest-environment jsdom

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
}));
const mockedActionState = vi.hoisted(() => ({
  current: {
    status: "idle",
    message: "",
    fieldErrors: {},
  } as {
    status: "idle" | "success";
    message: string;
    fieldErrors: Record<string, string>;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: () => [mockedActionState.current, vi.fn(), false],
  };
});

import { INVESTMENT_CATEGORIES } from "@/db/schema";
import { MonthlyRecordActions } from "@/features/monthly-snapshots/monthly-record-actions";
import { MonthlySnapshotForm } from "@/features/monthly-snapshots/monthly-snapshot-form";
import { RecordsPageView } from "@/features/monthly-snapshots/records-page";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";

const snapshot: MonthlySnapshot = {
  id: 1,
  month: "2026-08",
  cashFlow: {
    incomeCents: 2_500_000,
    expenseCents: 800_000,
    investmentProfitLossCents: 35_842,
    investmentContributionCents: 240_000,
  },
  cash: {
    emergencyFundCents: 5_000_000,
    goalFundCents: 2_000_000,
    dailyCashCents: 800_000,
  },
  funds: [
    {
      name: "纳斯达克指数基金",
      category: "us-nasdaq-100",
      marketValueCents: 3_000_000,
      monthlyInvestmentCents: 240_000,
    },
  ],
  liabilities: { huabeiBalanceCents: 120_000 },
};

beforeEach(() => {
  mockedActionState.current = {
    status: "idle",
    message: "",
    fieldErrors: {},
  };
  navigation.refresh.mockReset();
  navigation.replace.mockReset();
});

afterEach(cleanup);

describe("RecordsPageView", () => {
  it("renders the complete monthly editor with the form visible", () => {
    const markup = renderToStaticMarkup(
      createElement(RecordsPageView, {
        categories: INVESTMENT_CATEGORIES,
        initialFunds: snapshot.funds,
        month: "2026-08",
        snapshot,
      }),
    );

    expect(markup).toContain("月度记录");
    expect(markup).toContain("本月现金流");
    expect(markup).toContain("现金资产");
    expect(markup).toContain("基金资产");
    expect(markup).toContain("负债");
    expect(markup).toContain('id="monthly-entry-form"');
    expect(markup).toContain('class="snapshot-form"');
    expect(markup.match(/class="entry-section"/g)).toHaveLength(4);
    expect(markup.match(/class="section-marker"/g)).toHaveLength(4);
    expect(markup).toContain('class="fund-row"');
    expect(markup).toContain('class="primary-button"');
    expect(markup).not.toContain('hidden=""');
    expect(markup).not.toContain(
      ["gold-finger", "open-monthly-entry"].join(":"),
    );
  });
});

describe("monthly record mutation navigation", () => {
  it("returns to the selected review after a successful save", async () => {
    mockedActionState.current = {
      status: "success",
      message: "2026-08 已保存",
      fieldErrors: {},
    };

    render(
      createElement(MonthlySnapshotForm, {
        categories: INVESTMENT_CATEGORIES,
        initialFunds: snapshot.funds,
        month: "2026-08",
        snapshot,
        successHref: "/?month=2026-08",
      }),
    );

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith("/?month=2026-08");
      expect(navigation.refresh).toHaveBeenCalledOnce();
    });
  });

  it("returns to the selected empty review after a successful deletion", async () => {
    mockedActionState.current = {
      status: "success",
      message: "2026-08 的记录已永久删除。",
      fieldErrors: {},
    };

    render(
      createElement(MonthlyRecordActions, {
        month: "2026-08",
        successHref: "/?month=2026-08",
      }),
    );

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith("/?month=2026-08");
      expect(navigation.refresh).toHaveBeenCalledOnce();
    });
  });
});
