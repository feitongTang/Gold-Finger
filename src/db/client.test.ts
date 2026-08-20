import { afterEach, describe, expect, it } from "vitest";

import { openDatabase, openMigratedDatabase } from "@/db/client";

const openConnections: Array<ReturnType<typeof openDatabase>["sqlite"]> = [];

afterEach(() => {
  for (const connection of openConnections.splice(0)) connection.close();
});

describe("openDatabase", () => {
  it("opens SQLite with foreign keys enabled", () => {
    const { sqlite } = openDatabase(":memory:");
    openConnections.push(sqlite);

    const row = sqlite.prepare("PRAGMA foreign_keys").get() as {
      foreign_keys: number;
    };

    expect(row.foreign_keys).toBe(1);
  });

  it("opens an application database with migrations applied", () => {
    const { sqlite } = openMigratedDatabase(":memory:");
    openConnections.push(sqlite);

    const table = sqlite
      .prepare(
        "select name from sqlite_master where type = 'table' and name = 'monthly_snapshots'",
      )
      .get() as { name: string } | undefined;

    expect(table?.name).toBe("monthly_snapshots");
  });
});
