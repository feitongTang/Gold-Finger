"use server";

import { revalidatePath } from "next/cache";

import { getApplicationDatabase } from "@/db/client";
import {
  deleteMonthlySnapshot,
  type DeleteMonthlySnapshotState,
} from "@/features/monthly-snapshots/delete";
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

export async function deleteMonthlySnapshotAction(
  month: string,
  _previousState: DeleteMonthlySnapshotState,
  _formData: FormData,
): Promise<DeleteMonthlySnapshotState> {
  void _previousState;
  void _formData;
  const state = deleteMonthlySnapshot(
    () => createMonthlySnapshotRepository(getApplicationDatabase().db),
    month,
  );

  if (state.status === "success") revalidatePath("/");

  return state;
}
