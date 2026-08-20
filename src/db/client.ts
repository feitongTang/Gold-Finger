import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "@/db/schema";

const defaultDatabaseFile = "./data/gold-finger.db";

export function openDatabase(
  filename = process.env.DATABASE_FILE ?? defaultDatabaseFile,
) {
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true });

  const sqlite = new Database(filename);
  sqlite.pragma("foreign_keys = ON");

  return { sqlite, db: drizzle(sqlite, { schema }) };
}

export function openMigratedDatabase(
  filename = process.env.DATABASE_FILE ?? defaultDatabaseFile,
) {
  const connection = openDatabase(filename);
  migrate(connection.db, {
    migrationsFolder: resolve(process.cwd(), "drizzle"),
  });
  return connection;
}

let applicationDatabase: ReturnType<typeof openMigratedDatabase> | undefined;

export function getApplicationDatabase() {
  applicationDatabase ??= openMigratedDatabase();
  return applicationDatabase;
}
