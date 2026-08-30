// @vitest-environment jsdom

import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AssetAllocation } from "@/features/monthly-snapshots/investment-allocation";
import type { InvestmentAllocationItem } from "@/features/monthly-snapshots/review-model";

const allocationItems: InvestmentAllocationItem[] = [
  {
    id: "asset-class:stocks",
    label: "股票",
    amountCents: BigInt(5_200),
    totalPercentage: 52,
    parentPercentage: null,
    children: [
      {
        id: "market:美国市场",
        label: "美国市场",
        amountCents: BigInt(1_600),
        totalPercentage: 16,
        parentPercentage: 30.8,
        children: [
          {
            id: "category:us-nasdaq-100",
            label: "纳斯达克100",
            amountCents: BigInt(800),
            totalPercentage: 8,
            parentPercentage: 50,
            children: [],
          },
          {
            id: "category:us-sp-500",
            label: "标普500",
            amountCents: BigInt(800),
            totalPercentage: 8,
            parentPercentage: 50,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: "asset-class:bonds",
    label: "债券",
    amountCents: BigInt(1_800),
    totalPercentage: 18,
    parentPercentage: null,
    children: [],
  },
  {
    id: "asset-class:other",
    label: "其他",
    amountCents: BigInt(1_000),
    totalPercentage: 10,
    parentPercentage: null,
    children: [],
  },
  {
    id: "asset-class:cash",
    label: "现金",
    amountCents: BigInt(2_000),
    totalPercentage: 20,
    parentPercentage: null,
    children: [
      {
        id: "cash:emergencyFund",
        label: "应急储备",
        amountCents: BigInt(1_000),
        totalPercentage: 10,
        parentPercentage: 50,
        children: [],
      },
    ],
  },
];

afterEach(cleanup);

describe("AssetAllocation", () => {
  it("defaults stocks and the United States to expanded and toggles descendants from the whole row", () => {
    render(
      createElement(AssetAllocation, {
        items: allocationItems,
        totalCents: BigInt(10_000),
      }),
    );

    const stocksButton = screen.getByRole("button", { name: /股票/ });
    const unitedStatesButton = screen.getByRole("button", {
      name: /美国市场/,
    });

    expect(stocksButton.getAttribute("aria-expanded")).toBe("true");
    expect(unitedStatesButton.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("纳斯达克100")).toBeTruthy();

    fireEvent.click(stocksButton);

    expect(stocksButton.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("纳斯达克100")).toBeNull();

    fireEvent.keyDown(stocksButton, { key: "Enter" });

    expect(screen.getByText("纳斯达克100")).toBeTruthy();
  });

  it("resets collapsed state when the month key changes", () => {
    const { rerender } = render(
      createElement(AssetAllocation, {
        items: allocationItems,
        key: "2026-07",
        totalCents: BigInt(10_000),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /股票/ }));
    expect(screen.queryByText("纳斯达克100")).toBeNull();

    rerender(
      createElement(AssetAllocation, {
        items: allocationItems,
        key: "2026-08",
        totalCents: BigInt(10_000),
      }),
    );

    expect(screen.getByText("纳斯达克100")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /股票/ })
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("keeps only the allocation overview in summary density", () => {
    const { container } = render(
      createElement(AssetAllocation, {
        density: "summary",
        items: allocationItems,
        totalCents: BigInt(10_000),
      }),
    );

    expect(
      container.querySelector(".asset-allocation-overview-bar"),
    ).toBeTruthy();
    expect(screen.getByLabelText("资产配置图例")).toBeTruthy();
    expect(screen.getAllByText("股票").length).toBeGreaterThan(0);
    expect(screen.getAllByText("现金").length).toBeGreaterThan(0);
    expect(screen.getByRole("figure", { name: "资产配置" })).toBeTruthy();
    expect(screen.queryByText("全部可配置资产")).toBeNull();
    expect(screen.queryByText("纳斯达克100")).toBeNull();
    expect(container.querySelector(".asset-allocation-tree")).toBeNull();
    expect(container.querySelector(".allocation-row-button")).toBeNull();
  });

  it("keeps the overview bar unchanged when an allocation group is expanded", () => {
    const { container } = render(
      createElement(AssetAllocation, {
        items: allocationItems,
        totalCents: BigInt(10_000),
      }),
    );

    const stockButton = screen.getByRole("button", { name: /股票/ });
    fireEvent.click(stockButton);

    expect(container.querySelector(".allocation-segment-active")).toBeNull();
    expect(container.querySelector(".allocation-segment-dimmed")).toBeNull();
    expect(stockButton.getAttribute("aria-pressed")).toBeNull();
    expect(screen.queryByRole("button", { name: /债券/ })).toBeNull();
  });
});
