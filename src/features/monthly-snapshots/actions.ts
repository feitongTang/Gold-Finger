"use server";

import { revalidatePath } from "next/cache";

import { getApplicationDatabase } from "@/db/client";
import type { MonthlySnapshotFormState } from "@/features/monthly-snapshots/form-model";
import { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";
import { saveMonthlySnapshot } from "@/features/monthly-snapshots/save";

export async function saveMonthlySnapshotAction(
  _previousState: MonthlySnapshotFormState,
  formData: FormData,
): Promise<MonthlySnapshotFormState> {
  const state = saveMonthlySnapshot(
    () => createMonthlySnapshotRepository(getApplicationDatabase().db),
    formData,
  );

  if (state.status === "success") revalidatePath("/");

  return state;
}
