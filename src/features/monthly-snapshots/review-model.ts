import type { MonthlySnapshotInput } from "@/features/monthly-snapshots/repository";

type InvestmentCategorySummary = {
  category: MonthlySnapshotInput["funds"][number]["category"];
  marketValueCents: bigint;
  cumulativeInvestmentCents: bigint;
  fundCount: number;
};

function roundedPercent(part: bigint, total: bigint) {
  return Number((part * BigInt(100) + total / BigInt(2)) / total);
}

export function calculateAssetAllocation(
  cashCents: bigint,
  investmentCents: bigint,
  liabilityCents: bigint,
) {
  const grossAssetsCents = cashCents + investmentCents;

  if (grossAssetsCents === BigInt(0)) {
    return {
      cashPercent: 0,
      investmentPercent: 0,
      liabilityPercent: null,
    };
  }

  const cashPercent = roundedPercent(cashCents, grossAssetsCents);

  return {
    cashPercent,
    investmentPercent: 100 - cashPercent,
    liabilityPercent: roundedPercent(liabilityCents, grossAssetsCents),
  };
}

export function calculateMonthlyReview(snapshot: MonthlySnapshotInput) {
  const cashCents =
    BigInt(snapshot.cash.emergencyFundCents) +
    BigInt(snapshot.cash.goalFundCents) +
    BigInt(snapshot.cash.dailyCashCents);
  const investmentCategories: InvestmentCategorySummary[] = [];
  const categoryIndexes = new Map<
    InvestmentCategorySummary["category"],
    number
  >();
  let investmentCents = BigInt(0);

  for (const fund of snapshot.funds) {
    const marketValueCents = BigInt(fund.marketValueCents);
    const cumulativeInvestmentCents = BigInt(fund.cumulativeInvestmentCents);
    investmentCents += marketValueCents;
    const existingIndex = categoryIndexes.get(fund.category);

    if (existingIndex === undefined) {
      categoryIndexes.set(fund.category, investmentCategories.length);
      investmentCategories.push({
        category: fund.category,
        marketValueCents,
        cumulativeInvestmentCents,
        fundCount: 1,
      });
      continue;
    }

    const existing = investmentCategories[existingIndex];
    existing.marketValueCents += marketValueCents;
    existing.cumulativeInvestmentCents += cumulativeInvestmentCents;
    existing.fundCount += 1;
  }

  const incomeCents = BigInt(snapshot.cashFlow.incomeCents);
  const expenseCents = BigInt(snapshot.cashFlow.expenseCents);
  const investmentContributionCents = BigInt(
    snapshot.cashFlow.investmentContributionCents,
  );
  const liabilityCents = BigInt(snapshot.liabilities.huabeiBalanceCents);

  return {
    cashFlow: {
      incomeCents,
      expenseCents,
      investmentContributionCents,
      balanceCents: incomeCents - expenseCents - investmentContributionCents,
    },
    assets: {
      cashCents,
      investmentCents,
      liabilityCents,
      netWorthCents: cashCents + investmentCents - liabilityCents,
    },
    investmentCategories,
  };
}

export function calculateMonthlyTrend(
  snapshots: ReadonlyArray<MonthlySnapshotInput>,
) {
  return snapshots
    .toSorted((left, right) => left.month.localeCompare(right.month))
    .map((snapshot) => {
      const review = calculateMonthlyReview(snapshot);

      return {
        month: snapshot.month,
        netWorthCents: review.assets.netWorthCents,
        cashFlowBalanceCents: review.cashFlow.balanceCents,
        cashCents: review.assets.cashCents,
        investmentCents: review.assets.investmentCents,
        liabilityCents: review.assets.liabilityCents,
      };
    });
}
