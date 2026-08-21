import Link from "next/link";

import type { InvestmentCategoryId } from "@/db/schema";
import { InvestmentAllocation } from "@/features/monthly-snapshots/investment-allocation";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";
import {
  calculateAssetAllocation,
  calculateInvestmentAllocation,
  calculateMonthlyReview,
  calculateMonthlyTrend,
} from "@/features/monthly-snapshots/review-model";

type CategoryOption = {
  id: InvestmentCategoryId;
  assetClass: string;
  market?: string;
  label: string;
};

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
});

function formatMoney(cents: bigint) {
  const zero = BigInt(0);
  const negative = cents < zero;
  const absoluteCents = negative ? -cents : cents;
  const hundred = BigInt(100);
  const yuan = absoluteCents / hundred;
  const fraction = String(absoluteCents % hundred).padStart(2, "0");
  const formatted = currencyFormatter
    .formatToParts(yuan)
    .map((part) => (part.type === "fraction" ? fraction : part.value))
    .join("");

  return negative ? `-${formatted}` : formatted;
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${year} 年 ${Number(monthNumber)} 月`;
}

function formatDelta(cents: bigint) {
  const prefix = cents > BigInt(0) ? "+" : "";
  return `${prefix}${formatMoney(cents)}`;
}

export function MonthlyReview({
  month,
  snapshot,
  categories,
}: {
  month: string;
  snapshot: MonthlySnapshot | null;
  categories: ReadonlyArray<CategoryOption>;
}) {
  if (!snapshot) {
    return (
      <section className="review-empty" aria-labelledby="review-title">
        <div>
          <p className="review-eyebrow">月度复盘</p>
          <h2 id="review-title">{formatMonth(month)}暂无复盘结果</h2>
          <p>保存这个月份的财务记录后，资金分配与资产结构会显示在这里。</p>
        </div>
      </section>
    );
  }

  const review = calculateMonthlyReview(snapshot);
  const allocation = calculateAssetAllocation(
    review.assets.cashCents,
    review.assets.investmentCents,
    review.assets.liabilityCents,
  );
  const investmentAllocation = calculateInvestmentAllocation(
    review.investmentCategories,
    categories,
  );

  return (
    <section className="review-panel" aria-labelledby="review-title">
      <div className="review-heading">
        <div>
          <p className="review-eyebrow">{formatMonth(month)}月度复盘</p>
          <h2 id="review-title">本月结果</h2>
        </div>
        <div className="net-worth-summary">
          <span>当前净资产</span>
          <strong>{formatMoney(review.assets.netWorthCents)}</strong>
        </div>
      </div>

      <div className="review-section" aria-labelledby="cash-flow-review-title">
        <div className="review-section-heading">
          <h3 id="cash-flow-review-title">资金分配</h3>
          <p>月度结余 = 收入 − 支出 − 投资投入</p>
        </div>
        <dl className="metric-grid">
          <div className="metric-card">
            <dt>收入</dt>
            <dd>{formatMoney(review.cashFlow.incomeCents)}</dd>
          </div>
          <div className="metric-card">
            <dt>支出</dt>
            <dd>{formatMoney(review.cashFlow.expenseCents)}</dd>
          </div>
          <div className="metric-card">
            <dt>投资投入</dt>
            <dd>{formatMoney(review.cashFlow.investmentContributionCents)}</dd>
          </div>
          <div
            className={`metric-card metric-card-emphasis ${review.cashFlow.balanceCents < BigInt(0) ? "metric-card-negative" : ""}`}
          >
            <dt>月度结余</dt>
            <dd>{formatMoney(review.cashFlow.balanceCents)}</dd>
          </div>
        </dl>
      </div>

      <div className="review-section" aria-labelledby="asset-review-title">
        <div className="review-section-heading">
          <h3 id="asset-review-title">资产结构</h3>
          <p>净资产 = 现金 + 投资 − 负债</p>
        </div>
        <dl className="asset-summary-grid">
          <div className="asset-summary-card">
            <dt>现金</dt>
            <dd>{formatMoney(review.assets.cashCents)}</dd>
            <dd className="asset-ratio">占总资产 {allocation.cashPercent}%</dd>
          </div>
          <div className="asset-summary-card">
            <dt>投资</dt>
            <dd>{formatMoney(review.assets.investmentCents)}</dd>
            <dd className="asset-ratio">
              占总资产 {allocation.investmentPercent}%
            </dd>
          </div>
          <div className="asset-summary-card asset-summary-liability">
            <dt>负债</dt>
            <dd>{formatMoney(review.assets.liabilityCents)}</dd>
            <dd className="asset-ratio">
              {allocation.liabilityPercent === null
                ? "无资产基数"
                : `相当于总资产的 ${allocation.liabilityPercent}%`}
            </dd>
          </div>
        </dl>
        <div className="asset-bar" aria-hidden="true">
          <span
            className="asset-bar-cash"
            style={{ width: `${allocation.cashPercent}%` }}
          />
          <span
            className="asset-bar-investment"
            style={{ width: `${allocation.investmentPercent}%` }}
          />
        </div>
      </div>

      <div
        className="review-section review-section-last"
        aria-labelledby="portfolio-review-title"
      >
        <div className="review-section-heading">
          <h3 id="portfolio-review-title">投资组合分类</h3>
          <p>点击资产类型可查看下一级分类</p>
        </div>
        {review.investmentCategories.length === 0 ? (
          <p className="review-no-investments">这个月份没有基金资产。</p>
        ) : (
          <InvestmentAllocation items={investmentAllocation} key={month} />
        )}
      </div>
    </section>
  );
}

export function MonthlyHistory({
  snapshots,
}: {
  snapshots: ReadonlyArray<MonthlySnapshot>;
}) {
  const trend = calculateMonthlyTrend(snapshots);

  return (
    <section className="history-panel" aria-labelledby="history-title">
      <div className="history-heading">
        <div>
          <p className="review-eyebrow">历史趋势</p>
          <h2 id="history-title">月度变化</h2>
        </div>
        <p>每行仅代表已保存月份；相邻记录可能跨月，不补齐缺失月份。</p>
      </div>
      {trend.length === 0 ? (
        <p className="history-empty">
          保存第一份月度记录后，这里会开始展示资产与现金流变化。
        </p>
      ) : (
        <div
          aria-label="月度财务趋势表，可横向滚动"
          className="history-table-scroll"
          role="region"
          tabIndex={0}
        >
          <table className="history-table">
            <thead>
              <tr>
                <th scope="col">月份</th>
                <th scope="col">净资产</th>
                <th scope="col">月度结余</th>
                <th scope="col">现金资产</th>
                <th scope="col">投资资产</th>
                <th scope="col">负债</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((point, index) => {
                const previous = trend[index - 1];
                const metrics = [
                  [point.netWorthCents, previous?.netWorthCents],
                  [point.cashFlowBalanceCents, previous?.cashFlowBalanceCents],
                  [point.cashCents, previous?.cashCents],
                  [point.investmentCents, previous?.investmentCents],
                  [point.liabilityCents, previous?.liabilityCents],
                ] as const;

                return (
                  <tr key={point.month}>
                    <th scope="row">
                      <Link href={`/?month=${point.month}`}>
                        {formatMonth(point.month)}
                      </Link>
                    </th>
                    {metrics.map(([value, previousValue], metricIndex) => (
                      <td key={metricIndex}>
                        <strong>{formatMoney(value)}</strong>
                        <span>
                          {previousValue === undefined
                            ? "起始记录"
                            : `较上次 ${formatDelta(value - previousValue)}`}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
