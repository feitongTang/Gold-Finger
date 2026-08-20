"use server";

import { revalidatePath } from "next/cache";

import { getApplicationDatabase } from "@/db/client";
import { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";
import {
  saveMonthlySnapshot,
  type MonthlySnapshotFormState,
} from "@/features/monthly-snapshots/save";

export async function saveMonthlySnapshotAction(
  _previousState: MonthlySnapshotFormState,
  formData: FormData,
): Promise<MonthlySnapshotFormState> {
  const repository = createMonthlySnapshotRepository(
    getApplicationDatabase().db,
  );
  const state = saveMonthlySnapshot(repository, formData);

  if (state.status === "success") revalidatePath("/");

  return state;
}
