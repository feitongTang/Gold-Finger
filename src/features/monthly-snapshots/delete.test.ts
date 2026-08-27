import { describe, expect, it } from "vitest";

import { deleteMonthlySnapshot } from "@/features/monthly-snapshots/delete";

describe("delete monthly snapshot", () => {
  it("rejects an invalid month before accessing persistence", () => {
    let repositoryAccessed = false;

    expect(
      deleteMonthlySnapshot(() => {
        repositoryAccessed = true;
        return { deleteByMonth: () => true };
      }, "../../data"),
    ).toEqual({ status: "error", message: "删除请求中的月份无效。" });
    expect(repositoryAccessed).toBe(false);
  });

  it("reports when the selected month no longer exists", () => {
    expect(
      deleteMonthlySnapshot(() => ({ deleteByMonth: () => false }), "2026-08"),
    ).toEqual({ status: "error", message: "2026-08 的记录不存在或已删除。" });
  });

  it("deletes the selected month", () => {
    let deletedMonth = "";

    expect(
      deleteMonthlySnapshot(
        () => ({
          deleteByMonth(month) {
            deletedMonth = month;
            return true;
          },
        }),
        "2026-08",
      ),
    ).toEqual({ status: "success", message: "2026-08 的记录已永久删除。" });
    expect(deletedMonth).toBe("2026-08");
  });

  it("turns persistence failures into a recoverable error", () => {
    expect(
      deleteMonthlySnapshot(
        () => ({
          deleteByMonth() {
            throw new Error("database unavailable");
          },
        }),
        "2026-08",
      ),
    ).toEqual({
      status: "error",
      message: "删除失败，记录仍然保留。请检查本地数据库后重试。",
    });
  });
});
