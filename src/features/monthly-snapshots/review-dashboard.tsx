import Link from "next/link";

import type { InvestmentCategoryId } from "@/db/schema";
import { AssetAllocation } from "@/features/monthly-snapshots/investment-allocation";
import { monthHref } from "@/features/monthly-snapshots/month-routing";
import { MonthSwitcher } from "@/features/monthly-snapshots/month-switcher";
import {
  MonthlyTrendPreview,
  type SerializableMonthlyTrendPoint,
} from "@/features/monthly-snapshots/monthly-trend-charts";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";
import {
  calculateInvestmentAllocation,
  calculateMonthlyConsistency,
  calculateMonthlyReview,
  calculateMonthlyTrend,
} from "@/features/monthly-snapshots/review-model";

export type ReviewCategoryOption = {
  id: InvestmentCategoryId;
  assetClass: "权益类" | "固定收益类" | "其他资产";
  market?: string;
  label: string;
};

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
});

function formatMoney(cents: bigint) {
  const negative = cents < BigInt(0);
  const absoluteCents = negative ? -cents : cents;
  const yuan = absoluteCents / BigInt(100);
  const fraction = String(absoluteCents % BigInt(100)).padStart(2, "0");
  const formatted = currencyFormatter
    .formatToParts(yuan)
    .map((part) => (part.type === "fraction" ? fraction : part.value))
    .join("");

  return negative ? `-${formatted}` : formatted;
}

function formatDelta(cents: bigint) {
  return `${cents > BigInt(0) ? "+" : ""}${formatMoney(cents)}`;
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${year} 年 ${Number(monthNumber)} 月`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="monthly-flow-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ReviewToolbar({ month }: { month: string }) {
  return (
    <header className="review-toolbar">
      <div>
        <p className="review-eyebrow">{formatMonth(month)}</p>
        <h1 id="review-title" tabIndex={-1}>
          月度复盘
        </h1>
      </div>
      <div className="review-toolbar-actions">
        <MonthSwitcher month={month} pathname="/" />
        <Link
          className="primary-button review-entry-button"
          href={monthHref("/records", month)}
        >
          更新数据
        </Link>
      </div>
    </header>
  );
}

export function ReviewDashboard({
  month,
  snapshot,
  previousSnapshot,
  historySnapshots,
  categories,
}: {
  month: string;
  snapshot: MonthlySnapshot | null;
  previousSnapshot: MonthlySnapshot | null;
  historySnapshots: ReadonlyArray<MonthlySnapshot>;
  categories: ReadonlyArray<ReviewCategoryOption>;
}) {
  if (!snapshot) {
    return (
      <section aria-labelledby="review-title" className="review-dashboard">
        <ReviewToolbar month={month} />
        <div className="review-status-card review-status-card-empty surface-frosted">
          <div className="net-worth-summary">
            <span>当前净资产</span>
            <strong aria-label="当前净资产尚未记录">—</strong>
          </div>
          <div className="review-empty-message">
            <h2>暂无复盘结果</h2>
            <p>新建这个月份的财务记录后，这里会显示资金与资产变化。</p>
          </div>
          <Link
            className="primary-button review-entry-button"
            href={monthHref("/records", month)}
          >
            新建数据
          </Link>
        </div>
      </section>
    );
  }

  const review = calculateMonthlyReview(snapshot);
  const previousReview = previousSnapshot
    ? calculateMonthlyReview(previousSnapshot)
    : null;
  const netWorthChange = previousReview
    ? review.assets.netWorthCents - previousReview.assets.netWorthCents
    : null;
  const consistency = calculateMonthlyConsistency(snapshot, previousSnapshot);
  const allocation = calculateInvestmentAllocation(
    {
      emergencyFundCents: BigInt(snapshot.cash.emergencyFundCents),
      goalFundCents: BigInt(snapshot.cash.goalFundCents),
      dailyCashCents: BigInt(snapshot.cash.dailyCashCents),
    },
    review.investmentCategories,
    categories,
  );
  const trendPoints: SerializableMonthlyTrendPoint[] = calculateMonthlyTrend(
    historySnapshots,
  ).map((point) => ({
    month: point.month,
    netWorthCents: String(point.netWorthCents),
    cashCents: String(point.cashCents),
    investmentCents: String(point.investmentCents),
    liabilityCents: String(point.liabilityCents),
    incomeCents: String(point.incomeCents),
    expenseCents: String(point.expenseCents),
  }));

  return (
    <section aria-labelledby="review-title" className="review-dashboard">
      <ReviewToolbar month={month} />

      <div className="review-status-card surface-frosted">
        <div className="net-worth-summary">
          <span>当前净资产</span>
          <strong>{formatMoney(review.assets.netWorthCents)}</strong>
          <small>
            {netWorthChange === null
              ? "首条记录"
              : `较上月 ${formatDelta(netWorthChange)}`}
          </small>
        </div>
        <dl className="review-asset-summary">
          <div>
            <dt>现金</dt>
            <dd>{formatMoney(review.assets.cashCents)}</dd>
          </div>
          <div>
            <dt>投资</dt>
            <dd>{formatMoney(review.assets.investmentCents)}</dd>
          </div>
          <div className="review-asset-liability">
            <dt>负债</dt>
            <dd>{formatMoney(review.assets.liabilityCents)}</dd>
          </div>
        </dl>
        {consistency ? (
          <details className="review-consistency">
            <summary>跨月一致性</summary>
            <p>
              净资产可解释差额：
              {formatDelta(consistency.unexplainedNetWorthChangeCents)}
            </p>
            <p>
              投资市值解释差额：
              {formatDelta(consistency.unexplainedInvestmentChangeCents)}
            </p>
          </details>
        ) : null}
      </div>

      <dl className="monthly-flow-strip surface-frosted">
        <Metric label="收入" value={formatMoney(review.cashFlow.incomeCents)} />
        <Metric
          label="支出"
          value={formatMoney(review.cashFlow.expenseCents)}
        />
        <Metric
          label="投资净投入"
          value={formatMoney(review.cashFlow.investmentContributionCents)}
        />
        <Metric
          label="投资损益"
          value={formatDelta(review.cashFlow.investmentProfitLossCents)}
        />
        <Metric
          label="月度结余"
          value={formatDelta(review.cashFlow.balanceCents)}
        />
      </dl>

      <div className="review-analysis-grid">
        <section
          className="review-analysis-panel"
          aria-labelledby="trend-preview-title"
        >
          <div className="review-analysis-heading">
            <div>
              <p className="review-eyebrow">历史趋势</p>
              <h2 id="trend-preview-title">趋势摘要</h2>
            </div>
            <Link href={monthHref("/trends", month)}>查看完整趋势</Link>
          </div>
          {trendPoints.length === 0 ? (
            <p className="review-analysis-empty">
              保存第一份月度记录后，这里会显示趋势摘要。
            </p>
          ) : (
            <MonthlyTrendPreview points={trendPoints} />
          )}
        </section>

        <section
          className="review-analysis-panel surface-frosted"
          aria-labelledby="allocation-preview-title"
        >
          <div className="review-analysis-heading">
            <div>
              <p className="review-eyebrow">投资配置</p>
              <h2 id="allocation-preview-title">资产配置摘要</h2>
            </div>
            <Link href={monthHref("/portfolio", month)}>查看完整组合</Link>
          </div>
          <AssetAllocation
            density="summary"
            items={allocation.items}
            key={month}
            totalCents={allocation.totalCents}
          />
        </section>
      </div>
    </section>
  );
}
