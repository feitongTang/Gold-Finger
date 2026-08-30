import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  openDatabase,
  openMigratedDatabase,
  resolveApplicationDatabaseFile,
} from "@/db/client";

const openConnections: Array<ReturnType<typeof openDatabase>["sqlite"]> = [];
const temporaryDirectories: string[] = [];
const originalDatabaseFile = process.env.DATABASE_FILE;

afterEach(() => {
  for (const connection of openConnections.splice(0)) connection.close();
  for (const directory of temporaryDirectories.splice(0))
    rmSync(directory, { recursive: true, force: true });
  if (originalDatabaseFile === undefined) delete process.env.DATABASE_FILE;
  else process.env.DATABASE_FILE = originalDatabaseFile;
  vi.resetModules();
});

describe("openDatabase", () => {
  it("keeps demo mode isolated from the configured personal database", () => {
    expect(
      resolveApplicationDatabaseFile(
        {
          GOLD_FINGER_MODE: "demo",
          DATABASE_FILE: "/private/personal-assets.db",
        },
        "/public/gold-finger",
      ),
    ).toBe("/public/gold-finger/data/gold-finger-demo.db");
  });

  it("uses an explicitly shared database in demo mode", () => {
    expect(
      resolveApplicationDatabaseFile(
        {
          GOLD_FINGER_MODE: "demo",
          GOLD_FINGER_DEMO_DATABASE_FILE: "/shared/gold-finger-demo.db",
          DATABASE_FILE: "/private/personal-assets.db",
        },
        "/public/gold-finger-v2",
      ),
    ).toBe("/shared/gold-finger-demo.db");
  });

  it("uses the configured database outside demo mode", () => {
    expect(
      resolveApplicationDatabaseFile(
        { DATABASE_FILE: "/private/personal-assets.db" },
        "/public/gold-finger",
      ),
    ).toBe("/private/personal-assets.db");
  });

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

  it("opens the application singleton at DATABASE_FILE with migrations", async () => {
    const directory = mkdtempSync(join(tmpdir(), "gold-finger-db-"));
    temporaryDirectories.push(directory);
    const databaseFile = join(directory, "application.db");
    process.env.DATABASE_FILE = databaseFile;
    vi.resetModules();
    const { getApplicationDatabase } = await import("@/db/client");

    const { sqlite } = getApplicationDatabase();
    openConnections.push(sqlite);
    const table = sqlite
      .prepare(
        "select name from sqlite_master where type = 'table' and name = 'monthly_snapshots'",
      )
      .get() as { name: string } | undefined;

    expect(table?.name).toBe("monthly_snapshots");
    expect(existsSync(databaseFile)).toBe(true);
  });
});
