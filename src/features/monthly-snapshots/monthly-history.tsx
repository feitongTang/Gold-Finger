import Link from "next/link";

import {
  formatMonthLabel,
  monthHref,
} from "@/features/monthly-snapshots/month-routing";
import { MonthSwitcher } from "@/features/monthly-snapshots/month-switcher";
import { shiftMonth } from "@/features/monthly-snapshots/form-data";
import {
  MonthlyTrendCharts,
  type SerializableMonthlyTrendPoint,
} from "@/features/monthly-snapshots/monthly-trend-charts";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";
import { calculateMonthlyTrend } from "@/features/monthly-snapshots/review-model";

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

function amountDirection(cents: bigint, lowerIsBetter = false) {
  if (cents > BigInt(0)) return lowerIsBetter ? "negative" : "positive";
  if (cents < BigInt(0)) return lowerIsBetter ? "positive" : "negative";
  return "neutral";
}

export function MonthlyHistory({
  month,
  snapshots,
}: {
  month: string;
  snapshots: ReadonlyArray<MonthlySnapshot>;
}) {
  const startMonth = shiftMonth(month, -5);
  const windowSnapshots = snapshots.filter(
    (snapshot) => snapshot.month >= startMonth && snapshot.month <= month,
  );
  const trend = calculateMonthlyTrend(windowSnapshots);
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
    <section
      aria-labelledby="history-title"
      className="page-content history-page"
    >
      <header className="review-page-heading">
        <div>
          <p className="review-eyebrow">{formatMonthLabel(month)}</p>
          <h1 id="history-title">历史趋势</h1>
        </div>
        <MonthSwitcher month={month} pathname="/trends" />
      </header>

      {trend.length === 0 ? (
        <div className="history-empty-state surface-frosted">
          <h2>还没有可展示的历史记录</h2>
          <p>保存第一份月度记录后，这里会开始展示资产与现金流变化。</p>
          <Link
            className="primary-button review-entry-button"
            href={monthHref("/records", month)}
          >
            前往月度记录
          </Link>
        </div>
      ) : (
        <>
          <section
            aria-labelledby="history-chart-title"
            className="history-chart-panel surface-base"
          >
            <div className="history-section-heading">
              <p className="review-eyebrow">最近六个已保存月份</p>
              <h2 id="history-chart-title">月度变化</h2>
            </div>
            <MonthlyTrendCharts points={chartPoints} />
          </section>

          <section
            aria-labelledby="history-table-title"
            className="history-table-panel surface-base"
          >
            <div className="history-section-heading">
              <p className="review-eyebrow">明细数据</p>
              <h2 id="history-table-title">趋势数据</h2>
            </div>
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
                    <th scope="col">现金</th>
                    <th scope="col">投资</th>
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
                          <Link href={monthHref("/", point.month)}>
                            {formatMonthLabel(point.month)}
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
                                  className={`history-delta history-delta-${
                                    delta === null
                                      ? "neutral"
                                      : amountDirection(delta, lowerIsBetter)
                                  }`}
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
          </section>
        </>
      )}
    </section>
  );
}
