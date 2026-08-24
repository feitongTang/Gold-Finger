import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, describe, expect, it } from "vitest";

import { openDatabase } from "@/db/client";
import {
  createDemoSnapshots,
  seedDemoDatabase,
} from "@/features/demo/demo-data";
import { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";

const openConnections: Array<ReturnType<typeof openDatabase>["sqlite"]> = [];

afterEach(() => {
  for (const sqlite of openConnections.splice(0)) sqlite.close();
});

describe("demo data", () => {
  it("creates six consecutive months ending in the selected month", () => {
    const snapshots = createDemoSnapshots("2026-08");

    expect(snapshots.map(({ month }) => month)).toEqual([
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
  });

  it("covers gains, losses, redemptions, liabilities, and varied investments", () => {
    const snapshots = createDemoSnapshots("2026-08");
    const categories = new Set(
      snapshots.flatMap(({ funds }) => funds.map(({ category }) => category)),
    );

    expect(
      snapshots.some(({ cashFlow }) => cashFlow.investmentProfitLossCents < 0),
    ).toBe(true);
    expect(
      snapshots.some(
        ({ cashFlow }) => cashFlow.investmentContributionCents < 0,
      ),
    ).toBe(true);
    expect(
      snapshots.every(({ liabilities }) => liabilities.huabeiBalanceCents >= 0),
    ).toBe(true);
    expect(categories).toEqual(
      new Set([
        "us-nasdaq-100",
        "china-csi-300",
        "china-dividend-index",
        "china-bonds",
        "gold",
      ]),
    );
  });

  it("seeds an empty migrated database once", () => {
    const connection = openDatabase(":memory:");
    openConnections.push(connection.sqlite);
    migrate(connection.db, { migrationsFolder: "./drizzle" });

    seedDemoDatabase(connection.db, "2026-08");
    seedDemoDatabase(connection.db, "2026-08");

    const snapshots = createMonthlySnapshotRepository(connection.db).findAll();
    expect(snapshots).toHaveLength(6);
    expect(snapshots.at(-1)).toMatchObject({
      month: "2026-08",
      cashFlow: { incomeCents: 31_800_00 },
    });
  });
});
