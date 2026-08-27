import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { openDatabase } from "@/db/client";
import {
  createMonthlySnapshotBackup,
  restoreMonthlySnapshotBackup,
} from "@/features/monthly-snapshots/backup";
import {
  createMonthlySnapshotRepository,
  type MonthlySnapshotInput,
} from "@/features/monthly-snapshots/repository";

const snapshot: MonthlySnapshotInput = {
  month: "2026-08",
  cashFlow: {
    incomeCents: 25_000_00,
    expenseCents: 8_000_00,
    investmentProfitLossCents: -200_00,
    investmentContributionCents: 1_000_00,
  },
  cash: {
    emergencyFundCents: 50_000_00,
    goalFundCents: 20_000_00,
    dailyCashCents: 8_000_00,
  },
  funds: [
    {
      name: "黄金 ETF",
      category: "gold",
      marketValueCents: 10_000_00,
      monthlyInvestmentCents: 1_000_00,
    },
  ],
  liabilities: { huabeiBalanceCents: 1_200_00 },
};

let connection: ReturnType<typeof openDatabase>;

beforeEach(() => {
  connection = openDatabase(":memory:");
  migrate(connection.db, { migrationsFolder: "./drizzle" });
});

afterEach(() => {
  connection.sqlite.close();
});

describe("monthly snapshot backup", () => {
  it("exports a versioned backup and restores the complete dataset", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const created = repository.create(snapshot);
    const backup = createMonthlySnapshotBackup(
      repository.findAll(),
      new Date("2026-08-26T08:30:00.000Z"),
    );
    repository.deleteByMonth(snapshot.month);

    expect(JSON.parse(backup)).toEqual({
      version: 1,
      exportedAt: "2026-08-26T08:30:00.000Z",
      snapshots: [snapshot],
    });
    expect(restoreMonthlySnapshotBackup(repository, backup)).toEqual({
      ok: true,
      snapshotCount: 1,
    });
    expect(repository.findAll()).toEqual([
      { id: expect.any(Number), ...snapshot },
    ]);
    expect(repository.findByMonth(snapshot.month)?.id).not.toBe(created.id);
  });

  it("rejects duplicate months without changing the current data", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const current = repository.create(snapshot);
    const duplicateBackup = JSON.stringify({
      version: 1,
      exportedAt: "2026-08-26T08:30:00.000Z",
      snapshots: [snapshot, snapshot],
    });

    expect(restoreMonthlySnapshotBackup(repository, duplicateBackup)).toEqual({
      ok: false,
      message: "备份包含重复月份：2026-08。",
    });
    expect(repository.findAll()).toEqual([current]);
  });

  it("rejects malformed or inconsistent backup values without writing", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const current = repository.create(snapshot);
    const inconsistentBackup = JSON.stringify({
      version: 1,
      exportedAt: "2026-08-26T08:30:00.000Z",
      snapshots: [
        {
          ...snapshot,
          cashFlow: {
            ...snapshot.cashFlow,
            investmentContributionCents: 999,
          },
        },
      ],
    });

    expect(restoreMonthlySnapshotBackup(repository, "not valid json")).toEqual({
      ok: false,
      message: "无法读取备份文件。",
    });
    expect(
      restoreMonthlySnapshotBackup(repository, inconsistentBackup),
    ).toEqual({
      ok: false,
      message: "2026-08 的投资净投入与基金明细合计不一致。",
    });
    expect(repository.findAll()).toEqual([current]);
  });

  it("rejects unsupported backup versions", () => {
    const repository = createMonthlySnapshotRepository(connection.db);

    expect(
      restoreMonthlySnapshotBackup(
        repository,
        JSON.stringify({ version: 2, exportedAt: "now", snapshots: [] }),
      ),
    ).toEqual({ ok: false, message: "不支持这个备份文件版本。" });
  });
});
