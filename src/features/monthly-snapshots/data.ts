import "server-only";

import { getApplicationDatabase } from "@/db/client";
import { INVESTMENT_CATEGORIES } from "@/db/schema";
import { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";

export function loadMonthlyEntry(month: string) {
  const repository = createMonthlySnapshotRepository(
    getApplicationDatabase().db,
  );
  const snapshots = repository.findAll();

  return {
    snapshot: snapshots.find((snapshot) => snapshot.month === month) ?? null,
    snapshots,
    categories: INVESTMENT_CATEGORIES,
  };
}
