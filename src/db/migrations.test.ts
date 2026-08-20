import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, describe, expect, it } from "vitest";

import { openDatabase } from "@/db/client";
import { INVESTMENT_CATEGORIES } from "@/db/schema";

const openConnections: Array<ReturnType<typeof openDatabase>["sqlite"]> = [];

afterEach(() => {
  for (const connection of openConnections.splice(0)) connection.close();
});

describe("database migrations", () => {
  it("migrates an empty database and enforces monthly snapshot constraints", () => {
    const { db, sqlite } = openDatabase(":memory:");
    openConnections.push(sqlite);

    migrate(db, { migrationsFolder: "./drizzle" });

    const tableNames = sqlite
      .prepare(
        "select name from sqlite_master where type = 'table' and name not like 'sqlite_%' and name not like '__drizzle_%' order by name",
      )
      .all()
      .map((row) => (row as { name: string }).name);

    expect(tableNames).toEqual([
      "cash_assets",
      "fund_assets",
      "liabilities",
      "monthly_snapshots",
    ]);

    const snapshot = sqlite
      .prepare(
        `insert into monthly_snapshots
          (month, income_cents, expense_cents, investment_contribution_cents)
         values (?, ?, ?, ?)
         returning id`,
      )
      .get("2026-08", 10_000, 4_000, 2_000) as { id: number };

    for (const category of INVESTMENT_CATEGORIES) {
      expect(() =>
        sqlite
          .prepare(
            `insert into fund_assets
              (snapshot_id, name, category, market_value_cents, cumulative_investment_cents)
             values (?, ?, ?, ?, ?)`,
          )
          .run(snapshot.id, category.label, category.id, 1, 1),
      ).not.toThrow();
    }

    expect(() =>
      sqlite
        .prepare(
          `insert into monthly_snapshots
            (month, income_cents, expense_cents, investment_contribution_cents)
           values (?, ?, ?, ?)`,
        )
        .run("2026-08", 0, 0, 0),
    ).toThrow(/UNIQUE constraint failed/);

    expect(() =>
      sqlite
        .prepare(
          `insert into monthly_snapshots
            (month, income_cents, expense_cents, investment_contribution_cents)
           values (?, ?, ?, ?)`,
        )
        .run("2026-09", -1, 0, 0),
    ).toThrow(/CHECK constraint failed/);

    expect(() =>
      sqlite
        .prepare(
          `insert into monthly_snapshots
            (month, income_cents, expense_cents, investment_contribution_cents)
           values (?, ?, ?, ?)`,
        )
        .run("2026-10", 1.5, 0, 0),
    ).toThrow(/CHECK constraint failed/);

    expect(() =>
      sqlite
        .prepare(
          `insert into monthly_snapshots
            (month, income_cents, expense_cents, investment_contribution_cents)
           values (?, ?, ?, ?)`,
        )
        .run("2026-11", "not-a-number", 0, 0),
    ).toThrow(/CHECK constraint failed/);

    for (const invalidMonth of ["2026-00", "2026-13"]) {
      expect(() =>
        sqlite
          .prepare(
            `insert into monthly_snapshots
              (month, income_cents, expense_cents, investment_contribution_cents)
             values (?, ?, ?, ?)`,
          )
          .run(invalidMonth, 0, 0, 0),
      ).toThrow(/CHECK constraint failed/);
    }

    expect(() =>
      sqlite
        .prepare(
          `insert into fund_assets
            (snapshot_id, name, category, market_value_cents, cumulative_investment_cents)
           values (?, ?, ?, ?, ?)`,
        )
        .run(snapshot.id, "未知基金", "unknown", 1, 1),
    ).toThrow(/CHECK constraint failed/);
  });
});
