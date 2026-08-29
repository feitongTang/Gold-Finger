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

const MONTHLY_READ_PATHS = ["/", "/records", "/portfolio", "/trends"] as const;

function revalidateMonthlyPages() {
  for (const path of MONTHLY_READ_PATHS) revalidatePath(path);
}

export async function saveMonthlySnapshotAction(
  _previousState: MonthlySnapshotFormState,
  formData: FormData,
): Promise<MonthlySnapshotFormState> {
  const state = saveMonthlySnapshot(
    () => createMonthlySnapshotRepository(getApplicationDatabase().db),
    formData,
  );

  if (state.status === "success") revalidateMonthlyPages();

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

  if (state.status === "success") revalidateMonthlyPages();

  return state;
}
