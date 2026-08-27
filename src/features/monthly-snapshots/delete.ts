import type { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

type DeleteRepository = Pick<
  ReturnType<typeof createMonthlySnapshotRepository>,
  "deleteByMonth"
>;

export type DeleteMonthlySnapshotState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialDeleteMonthlySnapshotState: DeleteMonthlySnapshotState = {
  status: "idle",
  message: "",
};

export function deleteMonthlySnapshot(
  getRepository: () => DeleteRepository,
  month: string,
): DeleteMonthlySnapshotState {
  if (!MONTH_PATTERN.test(month))
    return { status: "error", message: "删除请求中的月份无效。" };

  try {
    const wasDeleted = getRepository().deleteByMonth(month);
    return wasDeleted
      ? { status: "success", message: `${month} 的记录已永久删除。` }
      : {
          status: "error",
          message: `${month} 的记录不存在或已删除。`,
        };
  } catch {
    return {
      status: "error",
      message: "删除失败，记录仍然保留。请检查本地数据库后重试。",
    };
  }
}
