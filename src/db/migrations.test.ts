import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, describe, expect, it } from "vitest";

import { openDatabase } from "@/db/client";
import { INVESTMENT_CATEGORIES } from "@/db/schema";

const openConnections: Array<ReturnType<typeof openDatabase>["sqlite"]> = [];
const temporaryFolders: string[] = [];

afterEach(() => {
  for (const connection of openConnections.splice(0)) connection.close();
  for (const folder of temporaryFolders.splice(0))
    rmSync(folder, { recursive: true, force: true });
});

describe("database migrations", () => {
  it("preserves existing snapshots while enabling negative net fund contributions", () => {
    const { db, sqlite } = openDatabase(":memory:");
    openConnections.push(sqlite);

    const migrationFolder = mkdtempSync(
      join(tmpdir(), "gold-finger-migrations-"),
    );
    temporaryFolders.push(migrationFolder);
    mkdirSync(join(migrationFolder, "meta"));
    const journal = JSON.parse(
      readFileSync("./drizzle/meta/_journal.json", "utf8"),
    ) as { entries: Array<{ when: number }> };
    copyFileSync(
      "./drizzle/0000_wild_psylocke.sql",
      join(migrationFolder, "0000_wild_psylocke.sql"),
    );
    writeFileSync(
      join(migrationFolder, "meta/_journal.json"),
      JSON.stringify({ ...journal, entries: journal.entries.slice(0, 1) }),
    );
    migrate(db, { migrationsFolder: migrationFolder });
    const snapshot = sqlite
      .prepare(
        `insert into monthly_snapshots
          (month, income_cents, expense_cents, investment_contribution_cents)
         values (?, ?, ?, ?)
         returning id`,
      )
      .get("2026-07", 10_000, 4_000, 2_000) as { id: number };
    sqlite
      .prepare(
        `insert into cash_assets
          (snapshot_id, emergency_fund_cents, goal_fund_cents, daily_cash_cents)
         values (?, ?, ?, ?)`,
      )
      .run(snapshot.id, 3_000, 2_000, 1_000);
    sqlite
      .prepare(
        `insert into fund_assets
          (snapshot_id, name, category, market_value_cents, cumulative_investment_cents)
         values (?, ?, ?, ?, ?)`,
      )
      .run(snapshot.id, "黄金 ETF", "gold", 8_000, 2_000);
    sqlite
      .prepare(
        `insert into liabilities (snapshot_id, huabei_balance_cents)
         values (?, ?)`,
      )
      .run(snapshot.id, 500);

    copyFileSync(
      "./drizzle/0001_allow_net_fund_contributions.sql",
      join(migrationFolder, "0001_allow_net_fund_contributions.sql"),
    );
    writeFileSync(
      join(migrationFolder, "meta/_journal.json"),
      JSON.stringify({ ...journal, entries: journal.entries.slice(0, 2) }),
    );
    migrate(db, { migrationsFolder: migrationFolder });

    expect(
      sqlite
        .prepare(
          `select month, investment_contribution_cents
           from monthly_snapshots where id = ?`,
        )
        .get(snapshot.id),
    ).toEqual({
      month: "2026-07",
      investment_contribution_cents: 2_000,
    });
    expect(
      sqlite
        .prepare(
          `select name, cumulative_investment_cents
           from fund_assets where snapshot_id = ?`,
        )
        .get(snapshot.id),
    ).toEqual({ name: "黄金 ETF", cumulative_investment_cents: 2_000 });
    expect(
      sqlite
        .prepare(
          `select emergency_fund_cents, goal_fund_cents, daily_cash_cents
           from cash_assets where snapshot_id = ?`,
        )
        .get(snapshot.id),
    ).toEqual({
      emergency_fund_cents: 3_000,
      goal_fund_cents: 2_000,
      daily_cash_cents: 1_000,
    });
    expect(
      sqlite
        .prepare(
          `select huabei_balance_cents
           from liabilities where snapshot_id = ?`,
        )
        .get(snapshot.id),
    ).toEqual({ huabei_balance_cents: 500 });
    expect(sqlite.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(sqlite.pragma("foreign_key_check")).toEqual([]);

    expect(() =>
      sqlite
        .prepare(
          `insert into monthly_snapshots
            (month, income_cents, expense_cents, investment_contribution_cents)
           values (?, ?, ?, ?)`,
        )
        .run("2026-08", 0, 0, -2_000),
    ).not.toThrow();
    expect(() =>
      sqlite
        .prepare(
          `insert into fund_assets
            (snapshot_id, name, category, market_value_cents, cumulative_investment_cents)
           values (?, ?, ?, ?, ?)`,
        )
        .run(snapshot.id, "赎回基金", "gold", 0, -2_000),
    ).not.toThrow();

    sqlite
      .prepare("delete from __drizzle_migrations where created_at = ?")
      .run(journal.entries[1].when);
    migrate(db, { migrationsFolder: migrationFolder });

    expect(
      sqlite.prepare("select count(*) from monthly_snapshots").pluck().get(),
    ).toBe(2);
    expect(
      sqlite.prepare("select count(*) from fund_assets").pluck().get(),
    ).toBe(2);
    expect(
      sqlite
        .prepare(
          `select cumulative_investment_cents from fund_assets
           where name = ?`,
        )
        .pluck()
        .get("赎回基金"),
    ).toBe(-2_000);
    expect(
      sqlite.prepare("select count(*) from cash_assets").pluck().get(),
    ).toBe(1);
    expect(
      sqlite.prepare("select count(*) from liabilities").pluck().get(),
    ).toBe(1);
    expect(
      sqlite.prepare("select count(*) from __drizzle_migrations").pluck().get(),
    ).toBe(2);
    expect(sqlite.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(sqlite.pragma("foreign_key_check")).toEqual([]);

    copyFileSync(
      "./drizzle/0002_slimy_the_executioner.sql",
      join(migrationFolder, "0002_slimy_the_executioner.sql"),
    );
    writeFileSync(
      join(migrationFolder, "meta/_journal.json"),
      JSON.stringify({ ...journal, entries: journal.entries.slice(0, 3) }),
    );
    migrate(db, { migrationsFolder: migrationFolder });

    expect(
      sqlite
        .prepare(
          `select month, investment_loss_cents
           from monthly_snapshots order by month`,
        )
        .all(),
    ).toEqual([
      { month: "2026-07", investment_loss_cents: 0 },
      { month: "2026-08", investment_loss_cents: 0 },
    ]);
    expect(() =>
      sqlite
        .prepare(
          `update monthly_snapshots set investment_loss_cents = -1
           where month = '2026-08'`,
        )
        .run(),
    ).toThrow(/CHECK constraint failed/);

    copyFileSync(
      "./drizzle/0003_warm_celestials.sql",
      join(migrationFolder, "0003_warm_celestials.sql"),
    );
    writeFileSync(
      join(migrationFolder, "meta/_journal.json"),
      JSON.stringify({ ...journal, entries: journal.entries.slice(0, 4) }),
    );
    migrate(db, { migrationsFolder: migrationFolder });

    expect(() =>
      sqlite
        .prepare(
          `update monthly_snapshots set investment_loss_cents = -1
           where month = '2026-08'`,
        )
        .run(),
    ).not.toThrow();
    expect(
      sqlite.prepare("select count(*) from monthly_snapshots").pluck().get(),
    ).toBe(2);
    expect(
      sqlite.prepare("select count(*) from fund_assets").pluck().get(),
    ).toBe(2);
    expect(
      sqlite.prepare("select count(*) from cash_assets").pluck().get(),
    ).toBe(1);
    expect(
      sqlite.prepare("select count(*) from liabilities").pluck().get(),
    ).toBe(1);
    expect(sqlite.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(sqlite.pragma("foreign_key_check")).toEqual([]);
  });

  it("migrates an empty database and enforces monthly snapshot constraints", () => {
    const { db, sqlite } = openDatabase(":memory:");
    openConnections.push(sqlite);

    migrate(db, { migrationsFolder: "./drizzle" });

    expect(
      sqlite
        .prepare("pragma table_info(monthly_snapshots)")
        .all()
        .map((column) => (column as { name: string }).name),
    ).toContain("investment_loss_cents");

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
