import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { openDatabase } from "@/db/client";
import {
  createMonthlySnapshotRepository,
  type MonthlySnapshotInput,
} from "@/features/monthly-snapshots/repository";

const augustSnapshot: MonthlySnapshotInput = {
  month: "2026-08",
  cashFlow: {
    incomeCents: 25_000_00,
    expenseCents: 8_000_00,
    investmentContributionCents: 6_000_00,
  },
  cash: {
    emergencyFundCents: 50_000_00,
    goalFundCents: 20_000_00,
    dailyCashCents: 8_000_00,
  },
  funds: [
    {
      name: "纳斯达克指数基金",
      category: "us-nasdaq-100",
      marketValueCents: 30_000_00,
      monthlyInvestmentCents: 24_000_00,
    },
    {
      name: "黄金 ETF",
      category: "gold",
      marketValueCents: 10_000_00,
      monthlyInvestmentCents: 9_000_00,
    },
  ],
  liabilities: { huabeiBalanceCents: 1_200_00 },
};

const septemberSnapshot: MonthlySnapshotInput = {
  month: "2026-09",
  cashFlow: {
    incomeCents: 26_000_00,
    expenseCents: 9_000_00,
    investmentContributionCents: 7_000_00,
  },
  cash: {
    emergencyFundCents: 52_000_00,
    goalFundCents: 21_000_00,
    dailyCashCents: 7_500_00,
  },
  funds: [
    {
      name: "沪深300指数基金",
      category: "china-csi-300",
      marketValueCents: 18_000_00,
      monthlyInvestmentCents: 17_000_00,
    },
  ],
  liabilities: { huabeiBalanceCents: 800_00 },
};

const openConnections: Array<ReturnType<typeof openDatabase>["sqlite"]> = [];
let connection: ReturnType<typeof openDatabase>;

beforeEach(() => {
  connection = openDatabase(":memory:");
  openConnections.push(connection.sqlite);
  migrate(connection.db, { migrationsFolder: "./drizzle" });
});

afterEach(() => {
  for (const sqlite of openConnections.splice(0)) sqlite.close();
});

describe("monthly snapshot repository", () => {
  it("creates and reads a complete monthly snapshot", () => {
    const repository = createMonthlySnapshotRepository(connection.db);

    const created = repository.create(augustSnapshot);

    expect(created).toEqual({ id: expect.any(Number), ...augustSnapshot });
    expect(repository.findByMonth("2026-08")).toEqual(created);
    expect(repository.findByMonth("2026-07")).toBeNull();
  });

  it("updates the selected month and replaces its fund rows", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const created = repository.create(augustSnapshot);
    const updatedInput: MonthlySnapshotInput = {
      ...augustSnapshot,
      cashFlow: { ...augustSnapshot.cashFlow, expenseCents: 9_500_00 },
      funds: [
        {
          name: "中国债券基金",
          category: "china-bonds",
          marketValueCents: 12_000_00,
          monthlyInvestmentCents: 12_000_00,
        },
      ],
    };

    const updated = repository.update(updatedInput);

    expect(updated).toEqual({ id: created.id, ...updatedInput });
    expect(repository.findByMonth("2026-08")).toEqual(updated);
  });

  it("retains snapshots from other months when one month is updated", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    repository.create(augustSnapshot);
    const september = repository.create(septemberSnapshot);

    repository.update({
      ...augustSnapshot,
      liabilities: { huabeiBalanceCents: 0 },
    });

    expect(repository.findByMonth("2026-09")).toEqual(september);
  });

  it("lists only saved snapshots in chronological month order", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const september = repository.create(septemberSnapshot);
    const august = repository.create(augustSnapshot);

    expect(repository.findAll()).toEqual([august, september]);
  });

  it("rolls back the complete create when a child amount is invalid", () => {
    const repository = createMonthlySnapshotRepository(connection.db);

    expect(() =>
      repository.create({
        ...augustSnapshot,
        cash: { ...augustSnapshot.cash, dailyCashCents: -1 },
      }),
    ).toThrow(/CHECK constraint failed/);
    expect(repository.findByMonth("2026-08")).toBeNull();
  });

  it("keeps the previous snapshot when an update is invalid", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const original = repository.create(augustSnapshot);

    expect(() =>
      repository.update({
        ...augustSnapshot,
        funds: [
          {
            ...augustSnapshot.funds[0],
            marketValueCents: -1,
          },
        ],
      }),
    ).toThrow(/CHECK constraint failed/);
    expect(repository.findByMonth("2026-08")).toEqual(original);
  });
});
