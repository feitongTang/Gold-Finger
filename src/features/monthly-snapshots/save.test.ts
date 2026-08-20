import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { openDatabase } from "@/db/client";
import { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";
import { saveMonthlySnapshot } from "@/features/monthly-snapshots/save";

function snapshotFormData(expense = "8000") {
  const formData = new FormData();
  formData.set("month", "2026-08");
  formData.set("income", "25000");
  formData.set("expense", expense);
  formData.set("investmentContribution", "6000");
  formData.set("emergencyFund", "50000");
  formData.set("goalFund", "20000");
  formData.set("dailyCash", "8000");
  formData.set("huabeiBalance", "1200");
  formData.set("fundCount", "1");
  formData.set("funds.0.name", "纳斯达克指数基金");
  formData.set("funds.0.category", "us-nasdaq-100");
  formData.set("funds.0.marketValue", "30000");
  formData.set("funds.0.cumulativeInvestment", "24000");
  return formData;
}

let connection: ReturnType<typeof openDatabase>;

beforeEach(() => {
  connection = openDatabase(":memory:");
  migrate(connection.db, { migrationsFolder: "./drizzle" });
});

afterEach(() => {
  connection.sqlite.close();
});

describe("save monthly snapshot", () => {
  it("creates a month that does not exist", () => {
    const repository = createMonthlySnapshotRepository(connection.db);

    expect(saveMonthlySnapshot(repository, snapshotFormData())).toEqual({
      status: "success",
      message: "2026-08 已保存",
      fieldErrors: {},
    });
    expect(repository.findByMonth("2026-08")?.cashFlow.expenseCents).toBe(
      800_000,
    );
  });

  it("updates an existing month through the same save entry point", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const createdState = saveMonthlySnapshot(repository, snapshotFormData());

    const updatedState = saveMonthlySnapshot(
      repository,
      snapshotFormData("9500.25"),
    );

    expect(createdState.status).toBe("success");
    expect(updatedState.status).toBe("success");
    expect(repository.findByMonth("2026-08")?.cashFlow.expenseCents).toBe(
      950_025,
    );
  });

  it("returns field errors without changing saved data", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    saveMonthlySnapshot(repository, snapshotFormData());

    const state = saveMonthlySnapshot(repository, snapshotFormData("-1"));

    expect(state).toMatchObject({
      status: "error",
      message: "请检查标出的输入项。",
      values: {
        expense: "-1",
        "funds.0.name": "纳斯达克指数基金",
      },
      fieldErrors: {
        expense: "请输入不小于 0 的金额，最多保留两位小数",
      },
    });
    expect(repository.findByMonth("2026-08")?.cashFlow.expenseCents).toBe(
      800_000,
    );
  });

  it("turns persistence failures into a recoverable message", () => {
    const repository = {
      findByMonth() {
        throw new Error("SQLITE_CANTOPEN: /private/path");
      },
      create() {
        throw new Error("not reached");
      },
      update() {
        throw new Error("not reached");
      },
    };

    expect(saveMonthlySnapshot(repository, snapshotFormData())).toMatchObject({
      status: "error",
      message: "保存失败，请重试。",
      fieldErrors: {},
      values: { income: "25000", "funds.0.name": "纳斯达克指数基金" },
    });
  });
});
