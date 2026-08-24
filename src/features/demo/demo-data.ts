import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema";
import {
  createMonthlySnapshotRepository,
  type MonthlySnapshotInput,
} from "@/features/monthly-snapshots/repository";

type DatabaseClient = BetterSQLite3Database<typeof schema>;

function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function createDemoSnapshots(
  latestMonth: string,
): MonthlySnapshotInput[] {
  const months = Array.from({ length: 6 }, (_, index) =>
    shiftMonth(latestMonth, index - 5),
  );

  return [
    {
      month: months[0],
      cashFlow: {
        incomeCents: 29_500_00,
        expenseCents: 12_600_00,
        investmentProfitLossCents: 2_180_00,
        investmentContributionCents: 10_000_00,
      },
      cash: {
        emergencyFundCents: 62_000_00,
        goalFundCents: 31_000_00,
        dailyCashCents: 12_500_00,
      },
      funds: [
        {
          name: "全球科技指数",
          category: "us-nasdaq-100",
          marketValueCents: 74_200_00,
          monthlyInvestmentCents: 4_000_00,
        },
        {
          name: "中国核心宽基",
          category: "china-csi-300",
          marketValueCents: 43_500_00,
          monthlyInvestmentCents: 2_500_00,
        },
        {
          name: "红利价值组合",
          category: "china-dividend-index",
          marketValueCents: 25_800_00,
          monthlyInvestmentCents: 1_000_00,
        },
        {
          name: "稳健债券组合",
          category: "china-bonds",
          marketValueCents: 36_600_00,
          monthlyInvestmentCents: 1_500_00,
        },
        {
          name: "黄金配置",
          category: "gold",
          marketValueCents: 20_400_00,
          monthlyInvestmentCents: 1_000_00,
        },
      ],
      liabilities: { huabeiBalanceCents: 3_600_00 },
    },
    {
      month: months[1],
      cashFlow: {
        incomeCents: 30_200_00,
        expenseCents: 13_100_00,
        investmentProfitLossCents: 1_460_00,
        investmentContributionCents: 10_500_00,
      },
      cash: {
        emergencyFundCents: 64_000_00,
        goalFundCents: 32_500_00,
        dailyCashCents: 12_100_00,
      },
      funds: [
        {
          name: "全球科技指数",
          category: "us-nasdaq-100",
          marketValueCents: 79_900_00,
          monthlyInvestmentCents: 4_500_00,
        },
        {
          name: "中国核心宽基",
          category: "china-csi-300",
          marketValueCents: 46_300_00,
          monthlyInvestmentCents: 2_500_00,
        },
        {
          name: "红利价值组合",
          category: "china-dividend-index",
          marketValueCents: 27_200_00,
          monthlyInvestmentCents: 1_000_00,
        },
        {
          name: "稳健债券组合",
          category: "china-bonds",
          marketValueCents: 38_300_00,
          monthlyInvestmentCents: 1_500_00,
        },
        {
          name: "黄金配置",
          category: "gold",
          marketValueCents: 21_600_00,
          monthlyInvestmentCents: 1_000_00,
        },
      ],
      liabilities: { huabeiBalanceCents: 3_200_00 },
    },
    {
      month: months[2],
      cashFlow: {
        incomeCents: 29_800_00,
        expenseCents: 14_400_00,
        investmentProfitLossCents: -2_300_00,
        investmentContributionCents: 10_000_00,
      },
      cash: {
        emergencyFundCents: 65_000_00,
        goalFundCents: 33_000_00,
        dailyCashCents: 10_900_00,
      },
      funds: [
        {
          name: "全球科技指数",
          category: "us-nasdaq-100",
          marketValueCents: 80_100_00,
          monthlyInvestmentCents: 4_000_00,
        },
        {
          name: "中国核心宽基",
          category: "china-csi-300",
          marketValueCents: 46_700_00,
          monthlyInvestmentCents: 2_000_00,
        },
        {
          name: "红利价值组合",
          category: "china-dividend-index",
          marketValueCents: 27_500_00,
          monthlyInvestmentCents: 1_000_00,
        },
        {
          name: "稳健债券组合",
          category: "china-bonds",
          marketValueCents: 40_500_00,
          monthlyInvestmentCents: 2_000_00,
        },
        {
          name: "黄金配置",
          category: "gold",
          marketValueCents: 22_100_00,
          monthlyInvestmentCents: 1_000_00,
        },
      ],
      liabilities: { huabeiBalanceCents: 4_100_00 },
    },
    {
      month: months[3],
      cashFlow: {
        incomeCents: 30_600_00,
        expenseCents: 12_900_00,
        investmentProfitLossCents: 3_260_00,
        investmentContributionCents: 10_500_00,
      },
      cash: {
        emergencyFundCents: 67_000_00,
        goalFundCents: 34_500_00,
        dailyCashCents: 11_800_00,
      },
      funds: [
        {
          name: "全球科技指数",
          category: "us-nasdaq-100",
          marketValueCents: 87_300_00,
          monthlyInvestmentCents: 4_500_00,
        },
        {
          name: "中国核心宽基",
          category: "china-csi-300",
          marketValueCents: 50_100_00,
          monthlyInvestmentCents: 2_500_00,
        },
        {
          name: "红利价值组合",
          category: "china-dividend-index",
          marketValueCents: 29_100_00,
          monthlyInvestmentCents: 1_000_00,
        },
        {
          name: "稳健债券组合",
          category: "china-bonds",
          marketValueCents: 42_200_00,
          monthlyInvestmentCents: 1_500_00,
        },
        {
          name: "黄金配置",
          category: "gold",
          marketValueCents: 23_400_00,
          monthlyInvestmentCents: 1_000_00,
        },
      ],
      liabilities: { huabeiBalanceCents: 2_900_00 },
    },
    {
      month: months[4],
      cashFlow: {
        incomeCents: 31_200_00,
        expenseCents: 15_800_00,
        investmentProfitLossCents: 860_00,
        investmentContributionCents: -3_000_00,
      },
      cash: {
        emergencyFundCents: 70_000_00,
        goalFundCents: 38_000_00,
        dailyCashCents: 15_600_00,
      },
      funds: [
        {
          name: "全球科技指数",
          category: "us-nasdaq-100",
          marketValueCents: 83_900_00,
          monthlyInvestmentCents: -5_000_00,
        },
        {
          name: "中国核心宽基",
          category: "china-csi-300",
          marketValueCents: 50_600_00,
          monthlyInvestmentCents: 0,
        },
        {
          name: "红利价值组合",
          category: "china-dividend-index",
          marketValueCents: 29_500_00,
          monthlyInvestmentCents: 0,
        },
        {
          name: "稳健债券组合",
          category: "china-bonds",
          marketValueCents: 43_400_00,
          monthlyInvestmentCents: 1_000_00,
        },
        {
          name: "黄金配置",
          category: "gold",
          marketValueCents: 24_300_00,
          monthlyInvestmentCents: 1_000_00,
        },
      ],
      liabilities: { huabeiBalanceCents: 5_200_00 },
    },
    {
      month: months[5],
      cashFlow: {
        incomeCents: 31_800_00,
        expenseCents: 13_700_00,
        investmentProfitLossCents: 4_120_00,
        investmentContributionCents: 12_000_00,
      },
      cash: {
        emergencyFundCents: 72_000_00,
        goalFundCents: 39_500_00,
        dailyCashCents: 14_900_00,
      },
      funds: [
        {
          name: "全球科技指数",
          category: "us-nasdaq-100",
          marketValueCents: 92_700_00,
          monthlyInvestmentCents: 4_500_00,
        },
        {
          name: "中国核心宽基",
          category: "china-csi-300",
          marketValueCents: 54_500_00,
          monthlyInvestmentCents: 3_000_00,
        },
        {
          name: "红利价值组合",
          category: "china-dividend-index",
          marketValueCents: 31_400_00,
          monthlyInvestmentCents: 1_500_00,
        },
        {
          name: "稳健债券组合",
          category: "china-bonds",
          marketValueCents: 45_700_00,
          monthlyInvestmentCents: 2_000_00,
        },
        {
          name: "黄金配置",
          category: "gold",
          marketValueCents: 26_000_00,
          monthlyInvestmentCents: 1_000_00,
        },
      ],
      liabilities: { huabeiBalanceCents: 3_100_00 },
    },
  ];
}

export function seedDemoDatabase(
  db: DatabaseClient,
  latestMonth = currentMonth(),
) {
  const repository = createMonthlySnapshotRepository(db);
  if (repository.findAll().length > 0) return;

  for (const snapshot of createDemoSnapshots(latestMonth))
    repository.create(snapshot);
}
