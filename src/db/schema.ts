import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const INVESTMENT_CATEGORY_IDS = [
  "us-nasdaq-100",
  "us-sp-500",
  "japan-market",
  "europe-market",
  "china-csi-500",
  "china-csi-300",
  "china-dividend-index",
  "satellite-strategy",
  "china-bonds",
  "gold",
] as const;

export type InvestmentCategoryId = (typeof INVESTMENT_CATEGORY_IDS)[number];

export const INVESTMENT_CATEGORIES: ReadonlyArray<{
  id: InvestmentCategoryId;
  assetClass: "权益类" | "固定收益类" | "其他资产";
  market?: "美国市场" | "日本市场" | "欧洲市场" | "中国市场";
  label: string;
}> = [
  {
    id: "us-nasdaq-100",
    assetClass: "权益类",
    market: "美国市场",
    label: "纳斯达克100",
  },
  {
    id: "us-sp-500",
    assetClass: "权益类",
    market: "美国市场",
    label: "标普500",
  },
  {
    id: "japan-market",
    assetClass: "权益类",
    market: "日本市场",
    label: "日本市场",
  },
  {
    id: "europe-market",
    assetClass: "权益类",
    market: "欧洲市场",
    label: "欧洲市场",
  },
  {
    id: "china-csi-500",
    assetClass: "权益类",
    market: "中国市场",
    label: "中证500",
  },
  {
    id: "china-csi-300",
    assetClass: "权益类",
    market: "中国市场",
    label: "沪深300",
  },
  {
    id: "china-dividend-index",
    assetClass: "权益类",
    market: "中国市场",
    label: "红利指数",
  },
  {
    id: "satellite-strategy",
    assetClass: "权益类",
    label: "卫星策略",
  },
  {
    id: "china-bonds",
    assetClass: "固定收益类",
    market: "中国市场",
    label: "中国债券",
  },
  { id: "gold", assetClass: "其他资产", label: "黄金" },
];

const allowedInvestmentCategories = sql.raw(
  INVESTMENT_CATEGORY_IDS.map((id) => `'${id}'`).join(", "),
);

export const monthlySnapshots = sqliteTable(
  "monthly_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    month: text("month").notNull().unique(),
    incomeCents: integer("income_cents").notNull(),
    expenseCents: integer("expense_cents").notNull(),
    investmentProfitLossCents: integer("investment_loss_cents")
      .notNull()
      .default(0),
    investmentContributionCents: integer(
      "investment_contribution_cents",
    ).notNull(),
  },
  (table) => [
    check(
      "monthly_snapshots_month_check",
      sql`length(${table.month}) = 7
        and ${table.month} glob '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
        and cast(substr(${table.month}, 6, 2) as integer) between 1 and 12`,
    ),
    check(
      "monthly_snapshots_income_non_negative",
      sql`typeof(${table.incomeCents}) = 'integer' and ${table.incomeCents} >= 0`,
    ),
    check(
      "monthly_snapshots_expense_non_negative",
      sql`typeof(${table.expenseCents}) = 'integer' and ${table.expenseCents} >= 0`,
    ),
    check(
      "monthly_snapshots_investment_profit_loss_integer",
      sql`typeof(${table.investmentProfitLossCents}) = 'integer'`,
    ),
    check(
      "monthly_snapshots_investment_contribution_integer",
      sql`typeof(${table.investmentContributionCents}) = 'integer'`,
    ),
  ],
);

export const cashAssets = sqliteTable(
  "cash_assets",
  {
    snapshotId: integer("snapshot_id")
      .primaryKey()
      .references(() => monthlySnapshots.id, { onDelete: "cascade" }),
    emergencyFundCents: integer("emergency_fund_cents").notNull(),
    goalFundCents: integer("goal_fund_cents").notNull(),
    dailyCashCents: integer("daily_cash_cents").notNull(),
  },
  (table) => [
    check(
      "cash_assets_emergency_fund_non_negative",
      sql`typeof(${table.emergencyFundCents}) = 'integer' and ${table.emergencyFundCents} >= 0`,
    ),
    check(
      "cash_assets_goal_fund_non_negative",
      sql`typeof(${table.goalFundCents}) = 'integer' and ${table.goalFundCents} >= 0`,
    ),
    check(
      "cash_assets_daily_cash_non_negative",
      sql`typeof(${table.dailyCashCents}) = 'integer' and ${table.dailyCashCents} >= 0`,
    ),
  ],
);

export const fundAssets = sqliteTable(
  "fund_assets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    snapshotId: integer("snapshot_id")
      .notNull()
      .references(() => monthlySnapshots.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category", { enum: INVESTMENT_CATEGORY_IDS }).notNull(),
    marketValueCents: integer("market_value_cents").notNull(),
    monthlyInvestmentCents: integer("cumulative_investment_cents").notNull(),
  },
  (table) => [
    check("fund_assets_name_not_empty", sql`length(trim(${table.name})) > 0`),
    check(
      "fund_assets_category_check",
      sql`${table.category} in (${allowedInvestmentCategories})`,
    ),
    check(
      "fund_assets_market_value_non_negative",
      sql`typeof(${table.marketValueCents}) = 'integer' and ${table.marketValueCents} >= 0`,
    ),
    check(
      "fund_assets_monthly_investment_integer",
      sql`typeof(${table.monthlyInvestmentCents}) = 'integer'`,
    ),
  ],
);

export const liabilities = sqliteTable(
  "liabilities",
  {
    snapshotId: integer("snapshot_id")
      .primaryKey()
      .references(() => monthlySnapshots.id, { onDelete: "cascade" }),
    huabeiBalanceCents: integer("huabei_balance_cents").notNull(),
  },
  (table) => [
    check(
      "liabilities_huabei_balance_non_negative",
      sql`typeof(${table.huabeiBalanceCents}) = 'integer' and ${table.huabeiBalanceCents} >= 0`,
    ),
  ],
);
