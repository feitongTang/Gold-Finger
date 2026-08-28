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
  amountCents: bigint;
  totalPercentage: number;
  parentPercentage: number | null;
  children: InvestmentAllocationItem[];
};

export type InvestmentAllocation = {
  totalCents: bigint;
  items: InvestmentAllocationItem[];
};

type InvestmentCategoryDefinition = {
  id: InvestmentCategorySummary["category"];
  assetClass: "权益类" | "固定收益类" | "其他资产";
  market?: string;
  label: string;
};

type InvestmentAllocationNode = {
  id: string;
  label: string;
  marketValueCents: bigint;
  children: InvestmentAllocationNode[];
};

type CashAllocation = {
  emergencyFundCents: bigint;
  goalFundCents: bigint;
  dailyCashCents: bigint;
};

const ASSET_CLASS_DEFINITIONS = [
  { id: "stocks", sourceLabel: "权益类", label: "股票" },
  { id: "bonds", sourceLabel: "固定收益类", label: "债券" },
  { id: "other", sourceLabel: "其他资产", label: "其他" },
] as const;

function roundedPercent(part: bigint, total: bigint) {
  return Number((part * BigInt(100) + total / BigInt(2)) / total);
}

export function calculateAssetSummaryRatios(
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

function roundedAllocationPercent(part: bigint, total: bigint) {
  if (total === BigInt(0)) return 0;

  return Number((part * BigInt(1_000) + total / BigInt(2)) / total) / 10;
}

function balancedTopLevelPercentages(
  nodes: ReadonlyArray<InvestmentAllocationNode>,
  totalCents: bigint,
) {
  if (totalCents === BigInt(0)) return nodes.map(() => 0);

  const shares = nodes.map((node, index) => {
    const scaled = node.marketValueCents * BigInt(1_000);
    return {
      index,
      tenths: Number(scaled / totalCents),
      remainder: scaled % totalCents,
    };
  });
  const allocatedTenths = shares.reduce(
    (total, share) => total + share.tenths,
    0,
  );
  const orderedRemainders = shares.toSorted((left, right) => {
    if (left.remainder === right.remainder) return left.index - right.index;
    return left.remainder > right.remainder ? -1 : 1;
  });

  for (let index = 0; index < 1_000 - allocatedTenths; index += 1) {
    orderedRemainders[index].tenths += 1;
  }

  return shares.map((share) => share.tenths / 10);
}

function finalizeAllocationNode(
  node: InvestmentAllocationNode,
  totalCents: bigint,
  parentCents: bigint | null,
): InvestmentAllocationItem[] {
  if (node.marketValueCents === BigInt(0) && parentCents !== null) return [];

  return [
    {
      id: node.id,
      label: node.label,
      amountCents: node.marketValueCents,
      totalPercentage: roundedAllocationPercent(
        node.marketValueCents,
        totalCents,
      ),
      parentPercentage:
        parentCents === null
          ? null
          : roundedAllocationPercent(node.marketValueCents, parentCents),
      children: node.children.flatMap((child) =>
        finalizeAllocationNode(child, totalCents, node.marketValueCents),
      ),
    },
  ];
}

export function calculateInvestmentAllocation(
  cash: CashAllocation,
  summaries: ReadonlyArray<InvestmentCategorySummary>,
  categories: ReadonlyArray<InvestmentCategoryDefinition>,
): InvestmentAllocation {
  const summaryByCategory = new Map(
    summaries.map((summary) => [summary.category, summary]),
  );
  const assetClasses = ASSET_CLASS_DEFINITIONS.map<InvestmentAllocationNode>(
    ({ id, label }) => ({
      id: `asset-class:${id}`,
      label,
      marketValueCents: BigInt(0),
      children: [],
    }),
  );
  const assetClassBySourceLabel = new Map(
    ASSET_CLASS_DEFINITIONS.map((definition, index) => [
      definition.sourceLabel,
      assetClasses[index],
    ]),
  );

  for (const category of categories) {
    const summary = summaryByCategory.get(category.id);
    if (!summary || summary.marketValueCents === BigInt(0)) continue;

    const assetClass = assetClassBySourceLabel.get(category.assetClass);
    if (!assetClass) continue;
    assetClass.marketValueCents += summary.marketValueCents;

    if (
      category.assetClass === "权益类" &&
      category.market &&
      category.market !== category.label
    ) {
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

  const cashNode: InvestmentAllocationNode = {
    id: "asset-class:cash",
    label: "现金",
    marketValueCents:
      cash.emergencyFundCents + cash.goalFundCents + cash.dailyCashCents,
    children: [
      {
        id: "cash:emergencyFund",
        label: "应急储备",
        marketValueCents: cash.emergencyFundCents,
        children: [],
      },
      {
        id: "cash:goalFund",
        label: "目标储备",
        marketValueCents: cash.goalFundCents,
        children: [],
      },
      {
        id: "cash:dailyCash",
        label: "流动资金",
        marketValueCents: cash.dailyCashCents,
        children: [],
      },
    ],
  };
  const nodes = [...assetClasses, cashNode];
  const totalCents = nodes.reduce(
    (total, node) => total + node.marketValueCents,
    BigInt(0),
  );
  const topLevelPercentages = balancedTopLevelPercentages(nodes, totalCents);
  const items = nodes.flatMap((node) =>
    finalizeAllocationNode(node, totalCents, null),
  );

  return {
    totalCents,
    items: items.map((item, index) => ({
      ...item,
      totalPercentage: topLevelPercentages[index],
    })),
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
