"use client";

import { useState } from "react";

import {
  calculateRecentAverageCents,
  createTrendChartLayout,
  TREND_CHART,
} from "@/features/monthly-snapshots/trend-chart-model";

export type SerializableMonthlyTrendPoint = {
  month: string;
  netWorthCents: string;
  cashCents: string;
  investmentCents: string;
  liabilityCents: string;
  incomeCents: string;
  expenseCents: string;
};

type ChartSeries = {
  id: string;
  label: string;
  values: ReadonlyArray<bigint>;
  className: string;
};

type ActiveChartPoint = {
  label: string;
  month: string;
  value: bigint;
  x: number;
  y: number;
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

function formatAxisMoney(cents: bigint) {
  const negative = cents < BigInt(0);
  const absoluteCents = negative ? -cents : cents;
  const sign = negative ? "−" : "";
  const hundredMillionCents = BigInt(10_000_000_000);
  const tenThousandCents = BigInt(1_000_000);

  if (absoluteCents >= hundredMillionCents) {
    const tenths = (absoluteCents * BigInt(10)) / hundredMillionCents;
    return `${sign}¥${tenths / BigInt(10)}.${tenths % BigInt(10)}亿`;
  }
  if (absoluteCents >= tenThousandCents) {
    const tenths = (absoluteCents * BigInt(10)) / tenThousandCents;
    return `${sign}¥${tenths / BigInt(10)}.${tenths % BigInt(10)}万`;
  }

  return `${sign}¥${absoluteCents / BigInt(100)}`;
}

function formatShortMonth(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${year.slice(2)}.${monthNumber}`;
}

function formatFullMonth(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${year} 年 ${Number(monthNumber)} 月`;
}

function LineChart({
  ariaLabel,
  months,
  referenceLine,
  series,
}: {
  ariaLabel: string;
  months: ReadonlyArray<string>;
  referenceLine?: { label: string; value: bigint };
  series: ReadonlyArray<ChartSeries>;
}) {
  const [activePoint, setActivePoint] = useState<ActiveChartPoint | null>(null);
  const layout = createTrendChartLayout(
    referenceLine ? [...series, { values: [referenceLine.value] }] : series,
  );
  const monthPoints = layout.series[0]?.points ?? [];
  const referenceY = referenceLine
    ? layout.series[series.length]?.points[0]?.y
    : undefined;
  const tooltipX = activePoint
    ? Math.min(
        TREND_CHART.right - 90,
        Math.max(TREND_CHART.left + 90, activePoint.x),
      )
    : 0;
  const tooltipY = activePoint
    ? activePoint.y < TREND_CHART.top + 54
      ? activePoint.y + 14
      : activePoint.y - 56
    : 0;

  return (
    <div className="trend-chart-canvas">
      <svg
        aria-label={ariaLabel}
        className="trend-chart-svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${TREND_CHART.width} ${TREND_CHART.height}`}
      >
        {layout.ticks.map((tick, index) => (
          <g key={`${tick.y}-${index}`}>
            <line
              className="trend-chart-gridline"
              x1={TREND_CHART.left}
              x2={TREND_CHART.right}
              y1={tick.y}
              y2={tick.y}
            />
            <text
              className="trend-chart-axis-label trend-chart-axis-value"
              x={TREND_CHART.left - 10}
              y={tick.y}
            >
              {formatAxisMoney(tick.value)}
            </text>
          </g>
        ))}

        {layout.zeroY === null ? null : (
          <line
            className="trend-chart-zero-line"
            x1={TREND_CHART.left}
            x2={TREND_CHART.right}
            y1={layout.zeroY}
            y2={layout.zeroY}
          />
        )}

        {referenceLine && referenceY !== undefined ? (
          <g className="trend-chart-reference">
            <line
              className="trend-chart-reference-line"
              x1={TREND_CHART.left}
              x2={TREND_CHART.right}
              y1={referenceY}
              y2={referenceY}
            />
            <text
              className="trend-chart-reference-label"
              x={TREND_CHART.right - 4}
              y={Math.max(TREND_CHART.top + 11, referenceY - 6)}
            >
              {referenceLine.label}
            </text>
          </g>
        ) : null}

        {months.map((month, index) => (
          <text
            className="trend-chart-axis-label trend-chart-month"
            key={month}
            x={monthPoints[index]?.x ?? TREND_CHART.left}
            y={TREND_CHART.height - 5}
          >
            {formatShortMonth(month)}
          </text>
        ))}

        {series.map((item, seriesIndex) => {
          const points = layout.series[seriesIndex]?.points ?? [];
          const path = points
            .map(
              (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
            )
            .join(" ");

          return (
            <g className={item.className} key={item.id}>
              <path className="trend-chart-line" d={path} />
              {points.map((point, index) => {
                const accessibleLabel = `${formatFullMonth(months[index])}${item.label}：${formatMoney(item.values[index])}`;

                return (
                  <circle
                    aria-label={accessibleLabel}
                    className="trend-chart-point"
                    cx={point.x}
                    cy={point.y}
                    key={months[index]}
                    onBlur={() => setActivePoint(null)}
                    onFocus={() =>
                      setActivePoint({
                        label: item.label,
                        month: months[index],
                        value: item.values[index],
                        x: point.x,
                        y: point.y,
                      })
                    }
                    onMouseEnter={() =>
                      setActivePoint({
                        label: item.label,
                        month: months[index],
                        value: item.values[index],
                        x: point.x,
                        y: point.y,
                      })
                    }
                    onMouseLeave={() => setActivePoint(null)}
                    r="4"
                    role="img"
                    tabIndex={0}
                  />
                );
              })}
            </g>
          );
        })}

        {activePoint ? (
          <g
            aria-hidden="true"
            className="trend-chart-tooltip"
            transform={`translate(${tooltipX} ${tooltipY})`}
          >
            <rect height="44" rx="8" width="180" x="-90" y="0" />
            <text
              className="trend-chart-tooltip-label"
              textAnchor="middle"
              y="16"
            >
              {formatFullMonth(activePoint.month)} · {activePoint.label}
            </text>
            <text
              className="trend-chart-tooltip-value"
              textAnchor="middle"
              y="34"
            >
              {formatMoney(activePoint.value)}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}

function ChartLegend({ series }: { series: ReadonlyArray<ChartSeries> }) {
  return (
    <ul aria-label="图表图例" className="trend-chart-legend">
      {series.map((item) => (
        <li className={item.className} key={item.id}>
          <span aria-hidden="true" className="trend-chart-legend-line" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function MonthlyTrendCharts({
  points,
}: {
  points: ReadonlyArray<SerializableMonthlyTrendPoint>;
}) {
  const [assetMetric, setAssetMetric] = useState<"assets" | "liability">(
    "assets",
  );
  const [cashFlowMetric, setCashFlowMetric] = useState<"income" | "expense">(
    "income",
  );
  const parsedPoints = points.map((point) => ({
    ...point,
    netWorthCents: BigInt(point.netWorthCents),
    cashCents: BigInt(point.cashCents),
    investmentCents: BigInt(point.investmentCents),
    liabilityCents: BigInt(point.liabilityCents),
    incomeCents: BigInt(point.incomeCents),
    expenseCents: BigInt(point.expenseCents),
  }));
  const months = parsedPoints.map((point) => point.month);
  const assetSeries: ChartSeries[] =
    assetMetric === "assets"
      ? [
          {
            id: "net-worth",
            label: "净资产",
            values: parsedPoints.map((point) => point.netWorthCents),
            className: "trend-series-net-worth",
          },
          {
            id: "cash",
            label: "现金",
            values: parsedPoints.map((point) => point.cashCents),
            className: "trend-series-cash",
          },
          {
            id: "investment",
            label: "投资",
            values: parsedPoints.map((point) => point.investmentCents),
            className: "trend-series-investment",
          },
        ]
      : [
          {
            id: "liability",
            label: "负债",
            values: parsedPoints.map((point) => point.liabilityCents),
            className: "trend-series-liability",
          },
        ];
  const cashFlowSeries: ChartSeries[] = [
    cashFlowMetric === "income"
      ? {
          id: "income",
          label: "收入",
          values: parsedPoints.map((point) => point.incomeCents),
          className: "trend-series-income",
        }
      : {
          id: "expense",
          label: "支出",
          values: parsedPoints.map((point) => point.expenseCents),
          className: "trend-series-expense",
        },
  ];
  const recentAverage = calculateRecentAverageCents(
    cashFlowSeries[0].values,
    6,
  );
  const averageMonthCount = Math.min(points.length, 6);

  return (
    <div className="trend-chart-grid">
      <figure className="trend-chart-card">
        <figcaption className="trend-chart-caption">
          <div>
            <h3>资产变化趋势</h3>
            <p>
              {assetMetric === "assets"
                ? "净资产、现金与投资的月末变化"
                : "单独查看月末负债变化，避免资产量级干扰"}
            </p>
          </div>
          <div className="trend-chart-caption-controls">
            {assetMetric === "assets" ? (
              <ChartLegend series={assetSeries} />
            ) : null}
            <div
              aria-label="选择资产趋势"
              className="trend-chart-toggle"
              role="group"
            >
              <button
                aria-pressed={assetMetric === "assets"}
                onClick={() => setAssetMetric("assets")}
                type="button"
              >
                资产
              </button>
              <button
                aria-pressed={assetMetric === "liability"}
                onClick={() => setAssetMetric("liability")}
                type="button"
              >
                负债
              </button>
            </div>
          </div>
        </figcaption>
        <LineChart
          ariaLabel={`${assetMetric === "assets" ? "资产" : "负债"}变化趋势，共 ${points.length} 个已保存月份。可悬浮或聚焦数据点查看精确金额。`}
          months={months}
          series={assetSeries}
        />
      </figure>

      <figure className="trend-chart-card">
        <figcaption className="trend-chart-caption">
          <div>
            <h3>收入与支出趋势</h3>
            <p>
              近 {averageMonthCount} 个记录月
              {cashFlowMetric === "income" ? "收入" : "支出"}平均：
              <strong>
                {recentAverage === null ? "—" : formatMoney(recentAverage)}
              </strong>
            </p>
          </div>
          <div
            aria-label="选择现金流趋势"
            className="trend-chart-toggle"
            role="group"
          >
            <button
              aria-pressed={cashFlowMetric === "income"}
              onClick={() => setCashFlowMetric("income")}
              type="button"
            >
              收入
            </button>
            <button
              aria-pressed={cashFlowMetric === "expense"}
              onClick={() => setCashFlowMetric("expense")}
              type="button"
            >
              支出
            </button>
          </div>
        </figcaption>
        <LineChart
          ariaLabel={`${cashFlowMetric === "income" ? "收入" : "支出"}趋势，共 ${points.length} 个已保存月份。可悬浮或聚焦数据点查看精确金额。`}
          months={months}
          referenceLine={
            recentAverage === null
              ? undefined
              : {
                  label: `近 ${averageMonthCount} 个记录月平均`,
                  value: recentAverage,
                }
          }
          series={cashFlowSeries}
        />
      </figure>
    </div>
  );
}
