import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

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
