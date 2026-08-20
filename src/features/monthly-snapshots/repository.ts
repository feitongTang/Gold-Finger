import { asc, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import {
  cashAssets,
  fundAssets,
  liabilities,
  monthlySnapshots,
  type InvestmentCategoryId,
} from "@/db/schema";
import * as schema from "@/db/schema";

export type MonthlySnapshotInput = {
  month: string;
  cashFlow: {
    incomeCents: number;
    expenseCents: number;
    investmentContributionCents: number;
  };
  cash: {
    emergencyFundCents: number;
    goalFundCents: number;
    dailyCashCents: number;
  };
  funds: Array<{
    name: string;
    category: InvestmentCategoryId;
    marketValueCents: number;
    cumulativeInvestmentCents: number;
  }>;
  liabilities: {
    huabeiBalanceCents: number;
  };
};

export type MonthlySnapshot = MonthlySnapshotInput & { id: number };

type DatabaseClient = BetterSQLite3Database<typeof schema>;

export function createMonthlySnapshotRepository(db: DatabaseClient) {
  function findByMonth(month: string): MonthlySnapshot | null {
    const snapshot = db
      .select()
      .from(monthlySnapshots)
      .where(eq(monthlySnapshots.month, month))
      .get();

    if (!snapshot) return null;

    const cash = db
      .select()
      .from(cashAssets)
      .where(eq(cashAssets.snapshotId, snapshot.id))
      .get();
    const liability = db
      .select()
      .from(liabilities)
      .where(eq(liabilities.snapshotId, snapshot.id))
      .get();

    if (!cash || !liability)
      throw new Error(`Monthly snapshot ${month} is incomplete`);

    const funds = db
      .select()
      .from(fundAssets)
      .where(eq(fundAssets.snapshotId, snapshot.id))
      .orderBy(asc(fundAssets.id))
      .all();

    return {
      id: snapshot.id,
      month: snapshot.month,
      cashFlow: {
        incomeCents: snapshot.incomeCents,
        expenseCents: snapshot.expenseCents,
        investmentContributionCents: snapshot.investmentContributionCents,
      },
      cash: {
        emergencyFundCents: cash.emergencyFundCents,
        goalFundCents: cash.goalFundCents,
        dailyCashCents: cash.dailyCashCents,
      },
      funds: funds.map((fund) => ({
        name: fund.name,
        category: fund.category,
        marketValueCents: fund.marketValueCents,
        cumulativeInvestmentCents: fund.cumulativeInvestmentCents,
      })),
      liabilities: { huabeiBalanceCents: liability.huabeiBalanceCents },
    };
  }

  function findAll(): MonthlySnapshot[] {
    return db
      .select({ month: monthlySnapshots.month })
      .from(monthlySnapshots)
      .orderBy(asc(monthlySnapshots.month))
      .all()
      .map(({ month }) => findByMonth(month) as MonthlySnapshot);
  }

  function insertChildren(
    transaction: Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0],
    snapshotId: number,
    input: MonthlySnapshotInput,
  ) {
    transaction
      .insert(cashAssets)
      .values({ snapshotId, ...input.cash })
      .run();
    transaction
      .insert(liabilities)
      .values({ snapshotId, ...input.liabilities })
      .run();

    if (input.funds.length > 0) {
      transaction
        .insert(fundAssets)
        .values(input.funds.map((fund) => ({ snapshotId, ...fund })))
        .run();
    }
  }

  function create(input: MonthlySnapshotInput): MonthlySnapshot {
    db.transaction((transaction) => {
      const snapshot = transaction
        .insert(monthlySnapshots)
        .values({ month: input.month, ...input.cashFlow })
        .returning({ id: monthlySnapshots.id })
        .get();

      insertChildren(transaction, snapshot.id, input);
    });

    return findByMonth(input.month) as MonthlySnapshot;
  }

  function update(input: MonthlySnapshotInput): MonthlySnapshot | null {
    const wasUpdated = db.transaction((transaction) => {
      const snapshot = transaction
        .select({ id: monthlySnapshots.id })
        .from(monthlySnapshots)
        .where(eq(monthlySnapshots.month, input.month))
        .get();

      if (!snapshot) return false;

      transaction
        .update(monthlySnapshots)
        .set(input.cashFlow)
        .where(eq(monthlySnapshots.id, snapshot.id))
        .run();
      transaction
        .update(cashAssets)
        .set(input.cash)
        .where(eq(cashAssets.snapshotId, snapshot.id))
        .run();
      transaction
        .update(liabilities)
        .set(input.liabilities)
        .where(eq(liabilities.snapshotId, snapshot.id))
        .run();
      transaction
        .delete(fundAssets)
        .where(eq(fundAssets.snapshotId, snapshot.id))
        .run();

      if (input.funds.length > 0) {
        transaction
          .insert(fundAssets)
          .values(
            input.funds.map((fund) => ({ snapshotId: snapshot.id, ...fund })),
          )
          .run();
      }

      return true;
    });

    return wasUpdated ? findByMonth(input.month) : null;
  }

  return { create, update, findByMonth, findAll };
}
