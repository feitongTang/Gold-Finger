import type { MonthlySnapshotInput } from "@/features/monthly-snapshots/repository";

type InvestmentCategorySummary = {
  category: MonthlySnapshotInput["funds"][number]["category"];
  marketValueCents: bigint;
  monthlyInvestmentCents: bigint;
  fundCount: number;
};

export type InvestmentAllocationItem = {
  id: string;
  label: string;
  percentage: number;
  children: InvestmentAllocationItem[];
};

type InvestmentCategoryDefinition = {
  id: InvestmentCategorySummary["category"];
  assetClass: string;
  market?: string;
  label: string;
};

type InvestmentAllocationNode = {
  id: string;
  label: string;
  marketValueCents: bigint;
  children: InvestmentAllocationNode[];
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

function findOrCreateAllocationNode(
  nodes: InvestmentAllocationNode[],
  id: string,
  label: string,
) {
  const existing = nodes.find((node) => node.id === id);
  if (existing) return existing;

  const node: InvestmentAllocationNode = {
    id,
    label,
    marketValueCents: BigInt(0),
    children: [],
  };
  nodes.push(node);
  return node;
}

function finalizeAllocationNodes(
  nodes: InvestmentAllocationNode[],
): InvestmentAllocationItem[] {
  const totalCents = nodes.reduce(
    (total, node) => total + node.marketValueCents,
    BigInt(0),
  );

  return nodes.map((node) => ({
    id: node.id,
    label: node.label,
    percentage:
      totalCents === BigInt(0)
        ? 0
        : roundedPercent(node.marketValueCents, totalCents),
    children: finalizeAllocationNodes(node.children),
  }));
}

export function calculateInvestmentAllocation(
  summaries: ReadonlyArray<InvestmentCategorySummary>,
  categories: ReadonlyArray<InvestmentCategoryDefinition>,
) {
  const summaryByCategory = new Map(
    summaries.map((summary) => [summary.category, summary]),
  );
  const assetClasses: InvestmentAllocationNode[] = [];

  for (const category of categories) {
    const summary = summaryByCategory.get(category.id);
    if (!summary) continue;

    const assetClass = findOrCreateAllocationNode(
      assetClasses,
      `asset-class:${category.assetClass}`,
      category.assetClass,
    );
    assetClass.marketValueCents += summary.marketValueCents;

    if (category.market && category.market !== category.label) {
      const market = findOrCreateAllocationNode(
        assetClass.children,
        `market:${category.market}`,
        category.market,
      );
      market.marketValueCents += summary.marketValueCents;
      const fixedCategory = findOrCreateAllocationNode(
        market.children,
        `category:${category.id}`,
        category.label,
      );
      fixedCategory.marketValueCents += summary.marketValueCents;
      continue;
    }

    const fixedCategory = findOrCreateAllocationNode(
      assetClass.children,
      `category:${category.id}`,
      category.label,
    );
    fixedCategory.marketValueCents += summary.marketValueCents;
  }

  return finalizeAllocationNodes(assetClasses);
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
  let investmentContributionCents = BigInt(0);

  for (const fund of snapshot.funds) {
    const marketValueCents = BigInt(fund.marketValueCents);
    const monthlyInvestmentCents = BigInt(fund.monthlyInvestmentCents);
    investmentCents += marketValueCents;
    investmentContributionCents += monthlyInvestmentCents;
    const existingIndex = categoryIndexes.get(fund.category);

    if (existingIndex === undefined) {
      categoryIndexes.set(fund.category, investmentCategories.length);
      investmentCategories.push({
        category: fund.category,
        marketValueCents,
        monthlyInvestmentCents,
        fundCount: 1,
      });
      continue;
    }

    const existing = investmentCategories[existingIndex];
    existing.marketValueCents += marketValueCents;
    existing.monthlyInvestmentCents += monthlyInvestmentCents;
    existing.fundCount += 1;
  }

  const incomeCents = BigInt(snapshot.cashFlow.incomeCents);
  const expenseCents = BigInt(snapshot.cashFlow.expenseCents);
  const investmentProfitLossCents = BigInt(
    snapshot.cashFlow.investmentProfitLossCents,
  );
  const liabilityCents = BigInt(snapshot.liabilities.huabeiBalanceCents);

  return {
    cashFlow: {
      incomeCents,
      expenseCents,
      investmentProfitLossCents,
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

export function calculateMonthlyConsistency(
  snapshot: MonthlySnapshotInput,
  previousSnapshot: MonthlySnapshotInput | null,
) {
  if (!previousSnapshot) return null;

  const current = calculateMonthlyReview(snapshot);
  const previous = calculateMonthlyReview(previousSnapshot);
  const netWorthChangeCents =
    current.assets.netWorthCents - previous.assets.netWorthCents;
  const explainedNetWorthChangeCents =
    current.cashFlow.incomeCents -
    current.cashFlow.expenseCents +
    current.cashFlow.investmentProfitLossCents;
  const investmentChangeCents =
    current.assets.investmentCents - previous.assets.investmentCents;
  const explainedInvestmentChangeCents =
    current.cashFlow.investmentContributionCents +
    current.cashFlow.investmentProfitLossCents;

  return {
    previousMonth: previousSnapshot.month,
    netWorthChangeCents,
    explainedNetWorthChangeCents,
    unexplainedNetWorthChangeCents:
      netWorthChangeCents - explainedNetWorthChangeCents,
    investmentChangeCents,
    explainedInvestmentChangeCents,
    unexplainedInvestmentChangeCents:
      investmentChangeCents - explainedInvestmentChangeCents,
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
        incomeCents: review.cashFlow.incomeCents,
        expenseCents: review.cashFlow.expenseCents,
        cashFlowBalanceCents: review.cashFlow.balanceCents,
        cashCents: review.assets.cashCents,
        investmentCents: review.assets.investmentCents,
        liabilityCents: review.assets.liabilityCents,
      };
    });
}
