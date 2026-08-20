import { parseMonthlySnapshotFormData } from "@/features/monthly-snapshots/form-data";
import type { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";

export type MonthlySnapshotFormState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: Record<string, string>;
  values?: Record<string, string>;
};

export const initialMonthlySnapshotFormState: MonthlySnapshotFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

type MonthlySnapshotRepository = Pick<
  ReturnType<typeof createMonthlySnapshotRepository>,
  "create" | "findByMonth" | "update"
>;

function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [field, value] of formData.entries()) {
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

export function saveMonthlySnapshot(
  repository: MonthlySnapshotRepository,
  formData: FormData,
): MonthlySnapshotFormState {
  const values = formValues(formData);
  const parsed = parseMonthlySnapshotFormData(formData);

  if (!parsed.ok) {
    return {
      status: "error",
      message: "请检查标出的输入项。",
      fieldErrors: parsed.errors,
      values,
    };
  }

  try {
    const existing = repository.findByMonth(parsed.value.month);
    if (existing) repository.update(parsed.value);
    else repository.create(parsed.value);

    return {
      status: "success",
      message: `${parsed.value.month} 已保存`,
      fieldErrors: {},
    };
  } catch {
    return {
      status: "error",
      message: "保存失败，请重试。",
      fieldErrors: {},
      values,
    };
  }
}
