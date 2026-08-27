import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { MonthlySnapshotInput } from "@/features/monthly-snapshots/repository";

const snapshot: MonthlySnapshotInput = {
  month: "2026-08",
  cashFlow: {
    incomeCents: 25_000_00,
    expenseCents: 8_000_00,
    investmentProfitLossCents: 200_00,
    investmentContributionCents: 0,
  },
  cash: {
    emergencyFundCents: 50_000_00,
    goalFundCents: 20_000_00,
    dailyCashCents: 8_000_00,
  },
  funds: [],
  liabilities: { huabeiBalanceCents: 1_200_00 },
};

const temporaryDirectories: string[] = [];
const originalDatabaseFile = process.env.DATABASE_FILE;

afterEach(async () => {
  const { getApplicationDatabase } = await import("@/db/client");
  getApplicationDatabase().sqlite.close();
  for (const directory of temporaryDirectories.splice(0))
    rmSync(directory, { recursive: true, force: true });
  if (originalDatabaseFile === undefined) delete process.env.DATABASE_FILE;
  else process.env.DATABASE_FILE = originalDatabaseFile;
  vi.resetModules();
});

async function setupApplicationDatabase() {
  const directory = mkdtempSync(join(tmpdir(), "gold-finger-backup-route-"));
  temporaryDirectories.push(directory);
  process.env.DATABASE_FILE = join(directory, "application.db");
  vi.resetModules();
  const { getApplicationDatabase } = await import("@/db/client");
  const { createMonthlySnapshotRepository } =
    await import("@/features/monthly-snapshots/repository");
  return createMonthlySnapshotRepository(getApplicationDatabase().db);
}

describe("backup route", () => {
  it("downloads a complete JSON backup", async () => {
    const repository = await setupApplicationDatabase();
    repository.create(snapshot);
    const { GET } = await import("@/app/api/backup/route");

    const response = await GET();
    const backup = JSON.parse(await response.text());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toMatch(
      /^attachment; filename="gold-finger-backup-\d{4}-\d{2}-\d{2}\.json"$/,
    );
    expect(backup).toMatchObject({ version: 1, snapshots: [snapshot] });
  });

  it("restores a valid backup and rejects invalid content without data loss", async () => {
    const repository = await setupApplicationDatabase();
    repository.create(snapshot);
    const { POST } = await import("@/app/api/backup/route");

    const clearResponse = await POST(
      new Request("http://localhost/api/backup", {
        method: "POST",
        body: JSON.stringify({
          version: 1,
          exportedAt: "2026-08-26T08:30:00.000Z",
          snapshots: [],
        }),
      }),
    );
    expect(clearResponse.status).toBe(200);
    expect(await clearResponse.json()).toEqual({
      ok: true,
      snapshotCount: 0,
    });
    expect(repository.findAll()).toEqual([]);

    repository.create(snapshot);
    const invalidResponse = await POST(
      new Request("http://localhost/api/backup", {
        method: "POST",
        body: "not json",
      }),
    );
    expect(invalidResponse.status).toBe(400);
    expect(repository.findAll()).toHaveLength(1);
  });
});
