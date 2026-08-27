import Link from "next/link";

import type { InvestmentCategoryId } from "@/db/schema";
import { shiftMonth } from "@/features/monthly-snapshots/form-data";
import { InvestmentAllocation } from "@/features/monthly-snapshots/investment-allocation";
import { MonthlyEntryTrigger } from "@/features/monthly-snapshots/monthly-entry-trigger";
import { MonthlyRecordActions } from "@/features/monthly-snapshots/monthly-record-actions";
import {
  MonthlyTrendCharts,
  type SerializableMonthlyTrendPoint,
} from "@/features/monthly-snapshots/monthly-trend-charts";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";
import {
  calculateAssetAllocation,
  calculateInvestmentAllocation,
  calculateMonthlyConsistency,
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

function amountDirection(cents: bigint, lowerIsBetter = false) {
  if (cents > BigInt(0)) return lowerIsBetter ? "negative" : "positive";
  if (cents < BigInt(0)) return lowerIsBetter ? "positive" : "negative";
  return "neutral";
}

function MonthSwitcher({ month }: { month: string }) {
  const previousMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);

  return (
    <nav aria-label="切换记录月份" className="month-switcher">
      <Link
        aria-label={`查看 ${previousMonth}`}
        className="month-switcher-arrow"
        href={`/?month=${previousMonth}`}
      >
        ‹
      </Link>
      <time dateTime={month}>{month}</time>
      <Link
        aria-label={`查看 ${nextMonth}`}
        className="month-switcher-arrow"
        href={`/?month=${nextMonth}`}
      >
        ›
      </Link>
    </nav>
  );
}

export function MonthlyReview({
  month,
  snapshot,
  previousSnapshot = null,
  categories,
}: {
  month: string;
  snapshot: MonthlySnapshot | null;
  previousSnapshot?: MonthlySnapshot | null;
  categories: ReadonlyArray<CategoryOption>;
}) {
  if (!snapshot) {
    return (
      <section
        aria-labelledby="review-title"
        className="review-panel review-panel-empty"
      >
        <header className="review-page-heading">
          <div>
            <p className="review-eyebrow">{formatMonth(month)}</p>
            <h1 id="review-title" tabIndex={-1}>
              月度复盘
            </h1>
          </div>
          <MonthSwitcher month={month} />
        </header>
        <div className="review-summary review-summary-empty">
          <div>
            <span>当前净资产</span>
            <strong aria-label="当前净资产尚未记录">—</strong>
          </div>
          <div className="review-empty-message">
            <h3>暂无复盘结果</h3>
            <p>新建这个月份的财务记录后，资金分配与资产结构会显示在这里。</p>
          </div>
          <MonthlyEntryTrigger label="新建数据" />
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
  const consistency = calculateMonthlyConsistency(snapshot, previousSnapshot);
  return (
    <section className="review-panel" aria-labelledby="review-title">
      <header className="review-page-heading">
        <div>
          <p className="review-eyebrow">{formatMonth(month)}</p>
          <h1 id="review-title" tabIndex={-1}>
            月度复盘
          </h1>
        </div>
        <MonthSwitcher month={month} />
      </header>

      <div
        className={`review-summary${consistency ? " review-summary-with-consistency" : ""}`}
      >
        <div className="net-worth-summary">
          <span>当前净资产</span>
          <strong>{formatMoney(review.assets.netWorthCents)}</strong>
        </div>
        <div className="review-record-actions">
          <MonthlyEntryTrigger label="更新数据" />
          <MonthlyRecordActions month={month} />
        </div>
      </div>

      {consistency ? (
        <details className="consistency-review">
          <summary className="consistency-review-summary">
            <span>
              <strong id="consistency-review-title">跨月一致性</strong>
              <span>{`与 ${formatMonth(consistency.previousMonth)}的最近一条前序记录比较`}</span>
            </span>
            <span className="consistency-review-meta">
              仅作复核提示，不影响保存
            </span>
            <span aria-hidden="true" className="consistency-review-chevron">
              ⌄
            </span>
          </summary>
          <div className="consistency-review-content">
            <dl className="consistency-list">
              <div className="consistency-item">
                <dt>净资产变化</dt>
                <dd>{formatDelta(consistency.netWorthChangeCents)}</dd>
                <dd className="consistency-explanation">
                  收入 − 支出 + 投资损益可解释：
                  {formatDelta(consistency.explainedNetWorthChangeCents)}
                  ；投资净投入视为资产内部转移
                </dd>
                <dd
                  className={`consistency-difference consistency-difference-${consistency.unexplainedNetWorthChangeCents === BigInt(0) ? "matched" : "warning"}`}
                >
                  净资产可解释差额：
                  {formatDelta(consistency.unexplainedNetWorthChangeCents)}
                </dd>
              </div>
              <div className="consistency-item">
                <dt>投资市值变化</dt>
                <dd>{formatDelta(consistency.investmentChangeCents)}</dd>
                <dd className="consistency-explanation">
                  本月净投入 + 投资损益可解释：
                  {formatDelta(consistency.explainedInvestmentChangeCents)}
                </dd>
                <dd
                  className={`consistency-difference consistency-difference-${consistency.unexplainedInvestmentChangeCents === BigInt(0) ? "matched" : "warning"}`}
                >
                  投资市值解释差额：
                  {formatDelta(consistency.unexplainedInvestmentChangeCents)}
                </dd>
              </div>
            </dl>
          </div>
        </details>
      ) : null}

      <div className="review-overview-grid">
        <div
          className="review-section"
          aria-labelledby="cash-flow-review-title"
        >
          <div className="review-section-heading">
            <h3 id="cash-flow-review-title">资金分配</h3>
            <p>月度结余已扣除基金明细中的投资净投入</p>
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
              <dt>月度结余</dt>
              <dd
                className={`metric-card-${amountDirection(review.cashFlow.balanceCents)}`}
              >
                {formatDelta(review.cashFlow.balanceCents)}
              </dd>
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
              <dd className="asset-ratio">
                占总资产 {allocation.cashPercent}%
              </dd>
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
            <div
              className={`asset-summary-card ${
                review.cashFlow.investmentProfitLossCents > BigInt(0)
                  ? "asset-summary-profit"
                  : review.cashFlow.investmentProfitLossCents < BigInt(0)
                    ? "asset-summary-loss"
                    : ""
              }`}
            >
              <dt>投资损益</dt>
              <dd>{formatDelta(review.cashFlow.investmentProfitLossCents)}</dd>
              <dd className="asset-ratio">
                {review.cashFlow.investmentProfitLossCents > BigInt(0)
                  ? "本月投资收益"
                  : review.cashFlow.investmentProfitLossCents < BigInt(0)
                    ? "本月投资亏损"
                    : "本月投资持平"}
              </dd>
            </div>
          </dl>
          <figure className="asset-composition">
            <figcaption>
              <strong>总资产构成</strong>
              <span>按现金与投资的当前市值计算</span>
            </figcaption>
            <div
              aria-label={`总资产中现金占 ${allocation.cashPercent}%，投资占 ${allocation.investmentPercent}%`}
              className="asset-bar"
              role="img"
            >
              <span
                className="asset-bar-cash"
                style={{ width: `${allocation.cashPercent}%` }}
              />
              <span
                className="asset-bar-investment"
                style={{ width: `${allocation.investmentPercent}%` }}
              />
            </div>
            <ul className="asset-legend" aria-label="总资产构成图例">
              <li>
                <span className="asset-legend-swatch asset-legend-cash" />
                现金 <strong>{allocation.cashPercent}%</strong>
              </li>
              <li>
                <span className="asset-legend-swatch asset-legend-investment" />
                投资 <strong>{allocation.investmentPercent}%</strong>
              </li>
            </ul>
          </figure>
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
  const chartPoints: SerializableMonthlyTrendPoint[] = trend.map((point) => ({
    month: point.month,
    netWorthCents: String(point.netWorthCents),
    cashCents: String(point.cashCents),
    investmentCents: String(point.investmentCents),
    liabilityCents: String(point.liabilityCents),
    incomeCents: String(point.incomeCents),
    expenseCents: String(point.expenseCents),
  }));

  return (
    <section className="history-panel" aria-labelledby="history-title">
      <div className="history-heading">
        <div>
          <p className="review-eyebrow">历史趋势</p>
          <h2 id="history-title">月度变化</h2>
        </div>
      </div>
      {trend.length === 0 ? (
        <p className="history-empty">
          保存第一份月度记录后，这里会开始展示资产与现金流变化。
        </p>
      ) : (
        <>
          <MonthlyTrendCharts points={chartPoints} />
          <details className="history-table-details">
            <summary>查看趋势数据</summary>
            <div
              aria-label="月度财务趋势数据表，可横向滚动"
              className="history-table-scroll"
              role="region"
              tabIndex={0}
            >
              <table className="history-table">
                <thead>
                  <tr>
                    <th scope="col">月份</th>
                    <th scope="col">净资产</th>
                    <th scope="col">收入</th>
                    <th scope="col">支出</th>
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
                      [point.netWorthCents, previous?.netWorthCents, false],
                      [point.incomeCents, previous?.incomeCents, false],
                      [point.expenseCents, previous?.expenseCents, true],
                      [
                        point.cashFlowBalanceCents,
                        previous?.cashFlowBalanceCents,
                        false,
                      ],
                      [point.cashCents, previous?.cashCents, false],
                      [point.investmentCents, previous?.investmentCents, false],
                      [point.liabilityCents, previous?.liabilityCents, true],
                    ] as const;

                    return (
                      <tr key={point.month}>
                        <th scope="row">
                          <Link href={`/?month=${point.month}`}>
                            {formatMonth(point.month)}
                          </Link>
                        </th>
                        {metrics.map(
                          (
                            [value, previousValue, lowerIsBetter],
                            metricIndex,
                          ) => {
                            const delta =
                              previousValue === undefined
                                ? null
                                : value - previousValue;

                            return (
                              <td key={metricIndex}>
                                <strong>{formatMoney(value)}</strong>
                                <span
                                  className={`history-delta history-delta-${delta === null ? "neutral" : amountDirection(delta, lowerIsBetter)}`}
                                >
                                  {delta === null
                                    ? "起始记录"
                                    : formatDelta(delta)}
                                </span>
                              </td>
                            );
                          },
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
