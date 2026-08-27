import { parseMonthlySnapshotFormData } from "@/features/monthly-snapshots/form-data";
import type { MonthlySnapshotFormState } from "@/features/monthly-snapshots/form-model";
import type { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";

type MonthlySnapshotRepository = Pick<
  ReturnType<typeof createMonthlySnapshotRepository>,
  "create" | "findByMonth" | "update"
>;

function isAllZeroSnapshot(
  snapshot: Parameters<MonthlySnapshotRepository["create"]>[0],
) {
  return (
    snapshot.funds.length === 0 &&
    Object.values(snapshot.cashFlow).every((amount) => amount === 0) &&
    Object.values(snapshot.cash).every((amount) => amount === 0) &&
    snapshot.liabilities.huabeiBalanceCents === 0
  );
}

function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [field, value] of formData.entries()) {
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

export function saveMonthlySnapshot(
  getRepository: () => MonthlySnapshotRepository,
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
    const repository = getRepository();
    const existing = repository.findByMonth(parsed.value.month);
    if (
      !existing &&
      isAllZeroSnapshot(parsed.value) &&
      formData.get("confirmZeroSnapshot") !== "yes"
    ) {
      return {
        status: "confirmation",
        message: "所有金额均为 0 且没有基金。确认后将创建一条全零记录。",
        fieldErrors: {},
        values,
      };
    }
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
      message: "保存失败，本次输入未写入。请检查本地数据库是否可写后重试。",
      fieldErrors: {},
      values,
    };
  }
}
