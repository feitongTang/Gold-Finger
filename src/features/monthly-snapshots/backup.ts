import { INVESTMENT_CATEGORY_IDS } from "@/db/schema";
import { MAX_FUNDS } from "@/features/monthly-snapshots/form-model";
import type {
  MonthlySnapshot,
  MonthlySnapshotInput,
  createMonthlySnapshotRepository,
} from "@/features/monthly-snapshots/repository";

const BACKUP_VERSION = 1;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const categoryIds = new Set<string>(INVESTMENT_CATEGORY_IDS);

type BackupRepository = Pick<
  ReturnType<typeof createMonthlySnapshotRepository>,
  "replaceAll"
>;

type RestoreResult =
  { ok: true; snapshotCount: number } | { ok: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInteger(value: unknown, nonNegative = false): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    (!nonNegative || value >= 0)
  );
}

function parseSnapshot(value: unknown): MonthlySnapshotInput | null {
  if (!isRecord(value) || !MONTH_PATTERN.test(String(value.month))) return null;
  const cashFlow = value.cashFlow;
  const cash = value.cash;
  const liabilities = value.liabilities;
  const funds = value.funds;

  if (
    !isRecord(cashFlow) ||
    !isInteger(cashFlow.incomeCents, true) ||
    !isInteger(cashFlow.expenseCents, true) ||
    !isInteger(cashFlow.investmentProfitLossCents) ||
    !isInteger(cashFlow.investmentContributionCents) ||
    !isRecord(cash) ||
    !isInteger(cash.emergencyFundCents, true) ||
    !isInteger(cash.goalFundCents, true) ||
    !isInteger(cash.dailyCashCents, true) ||
    !isRecord(liabilities) ||
    !isInteger(liabilities.huabeiBalanceCents, true) ||
    !Array.isArray(funds) ||
    funds.length > MAX_FUNDS
  ) {
    return null;
  }

  const parsedFunds: MonthlySnapshotInput["funds"] = [];
  for (const fund of funds) {
    if (
      !isRecord(fund) ||
      typeof fund.name !== "string" ||
      fund.name.trim().length === 0 ||
      typeof fund.category !== "string" ||
      !categoryIds.has(fund.category) ||
      !isInteger(fund.marketValueCents, true) ||
      !isInteger(fund.monthlyInvestmentCents)
    ) {
      return null;
    }
    parsedFunds.push({
      name: fund.name.trim(),
      category:
        fund.category as MonthlySnapshotInput["funds"][number]["category"],
      marketValueCents: fund.marketValueCents,
      monthlyInvestmentCents: fund.monthlyInvestmentCents,
    });
  }

  return {
    month: String(value.month),
    cashFlow: {
      incomeCents: cashFlow.incomeCents,
      expenseCents: cashFlow.expenseCents,
      investmentProfitLossCents: cashFlow.investmentProfitLossCents,
      investmentContributionCents: cashFlow.investmentContributionCents,
    },
    cash: {
      emergencyFundCents: cash.emergencyFundCents,
      goalFundCents: cash.goalFundCents,
      dailyCashCents: cash.dailyCashCents,
    },
    funds: parsedFunds,
    liabilities: { huabeiBalanceCents: liabilities.huabeiBalanceCents },
  };
}

export function createMonthlySnapshotBackup(
  snapshots: ReadonlyArray<MonthlySnapshot>,
  exportedAt = new Date(),
) {
  return JSON.stringify(
    {
      version: BACKUP_VERSION,
      exportedAt: exportedAt.toISOString(),
      snapshots: snapshots.map(({ id, ...snapshot }) => {
        void id;
        return snapshot;
      }),
    },
    null,
    2,
  );
}

export function restoreMonthlySnapshotBackup(
  repository: BackupRepository,
  contents: string,
): RestoreResult {
  let backup: unknown;
  try {
    backup = JSON.parse(contents);
  } catch {
    return { ok: false, message: "无法读取备份文件。" };
  }

  if (!isRecord(backup) || backup.version !== BACKUP_VERSION)
    return { ok: false, message: "不支持这个备份文件版本。" };
  if (
    typeof backup.exportedAt !== "string" ||
    Number.isNaN(Date.parse(backup.exportedAt)) ||
    !Array.isArray(backup.snapshots)
  ) {
    return { ok: false, message: "备份文件结构不完整。" };
  }

  const snapshots: MonthlySnapshotInput[] = [];
  const months = new Set<string>();
  for (const value of backup.snapshots) {
    const snapshot = parseSnapshot(value);
    if (!snapshot) return { ok: false, message: "备份中包含无效的月度记录。" };
    if (months.has(snapshot.month))
      return { ok: false, message: `备份包含重复月份：${snapshot.month}。` };

    const fundInvestmentTotal = snapshot.funds.reduce(
      (total, fund) => total + fund.monthlyInvestmentCents,
      0,
    );
    if (fundInvestmentTotal !== snapshot.cashFlow.investmentContributionCents) {
      return {
        ok: false,
        message: `${snapshot.month} 的投资净投入与基金明细合计不一致。`,
      };
    }
    months.add(snapshot.month);
    snapshots.push(snapshot);
  }

  try {
    repository.replaceAll(snapshots);
    return { ok: true, snapshotCount: snapshots.length };
  } catch {
    return { ok: false, message: "恢复失败，当前数据未被修改。" };
  }
}
