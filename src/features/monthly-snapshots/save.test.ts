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
  formData.set("investmentProfitLoss", "358.42");
  formData.set("emergencyFund", "50000");
  formData.set("goalFund", "20000");
  formData.set("dailyCash", "8000");
  formData.set("huabeiBalance", "1200");
  formData.set("fundCount", "1");
  formData.set("funds.0.name", "纳斯达克指数基金");
  formData.set("funds.0.category", "us-nasdaq-100");
  formData.set("funds.0.marketValue", "30000");
  formData.set("funds.0.monthlyInvestment", "24000");
  return formData;
}

function emptySnapshotFormData() {
  const formData = new FormData();
  formData.set("month", "2026-08");
  formData.set("income", "0");
  formData.set("expense", "0");
  formData.set("investmentProfitLoss", "0");
  formData.set("emergencyFund", "0");
  formData.set("goalFund", "0");
  formData.set("dailyCash", "0");
  formData.set("huabeiBalance", "0");
  formData.set("fundCount", "0");
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
  it("requires explicit confirmation before creating an all-zero month", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const formData = emptySnapshotFormData();

    expect(saveMonthlySnapshot(() => repository, formData)).toMatchObject({
      status: "confirmation",
      message: "所有金额均为 0 且没有基金。确认后将创建一条全零记录。",
      fieldErrors: {},
      values: { month: "2026-08", income: "0", fundCount: "0" },
    });
    expect(repository.findByMonth("2026-08")).toBeNull();

    formData.set("confirmZeroSnapshot", "yes");

    expect(saveMonthlySnapshot(() => repository, formData)).toMatchObject({
      status: "success",
      message: "2026-08 已保存",
    });
    expect(repository.findByMonth("2026-08")).not.toBeNull();
  });

  it("does not require confirmation when updating an existing all-zero month", () => {
    const repository = createMonthlySnapshotRepository(connection.db);
    const formData = emptySnapshotFormData();
    formData.set("confirmZeroSnapshot", "yes");
    saveMonthlySnapshot(() => repository, formData);
    formData.delete("confirmZeroSnapshot");

    expect(saveMonthlySnapshot(() => repository, formData).status).toBe(
      "success",
    );
  });

  it("creates a month that does not exist", () => {
    const repository = createMonthlySnapshotRepository(connection.db);

    expect(saveMonthlySnapshot(() => repository, snapshotFormData())).toEqual({
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
    const createdState = saveMonthlySnapshot(
      () => repository,
      snapshotFormData(),
    );

    const updatedState = saveMonthlySnapshot(
      () => repository,
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
    saveMonthlySnapshot(() => repository, snapshotFormData());

    let repositoryAccessed = false;
    const state = saveMonthlySnapshot(() => {
      repositoryAccessed = true;
      return repository;
    }, snapshotFormData("-1"));

    expect(state).toMatchObject({
      status: "error",
      message: "请检查标出的输入项。",
      values: {
        expense: "-1",
        "funds.0.name": "纳斯达克指数基金",
      },
      fieldErrors: {
        expense: "请输入金额或加减算式，结果须不小于 0，每项最多保留两位小数",
      },
    });
    expect(repository.findByMonth("2026-08")?.cashFlow.expenseCents).toBe(
      800_000,
    );
    expect(repositoryAccessed).toBe(false);
  });

  it("turns persistence failures into a recoverable message", () => {
    expect(
      saveMonthlySnapshot(() => {
        throw new Error("SQLITE_CANTOPEN: /private/path");
      }, snapshotFormData()),
    ).toMatchObject({
      status: "error",
      message: "保存失败，本次输入未写入。请检查本地数据库是否可写后重试。",
      fieldErrors: {},
      values: { income: "25000", "funds.0.name": "纳斯达克指数基金" },
    });
  });
});
