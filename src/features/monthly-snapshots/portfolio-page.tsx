import Link from "next/link";

import type { InvestmentCategoryId } from "@/db/schema";
import { AssetAllocation } from "@/features/monthly-snapshots/investment-allocation";
import { monthHref } from "@/features/monthly-snapshots/month-routing";
import { MonthSwitcher } from "@/features/monthly-snapshots/month-switcher";
import type { MonthlySnapshot } from "@/features/monthly-snapshots/repository";
import {
  calculateInvestmentAllocation,
  calculateMonthlyReview,
} from "@/features/monthly-snapshots/review-model";

export type PortfolioCategoryOption = {
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

function PortfolioToolbar({ month }: { month: string }) {
  return (
    <header className="review-page-heading">
      <div>
        <p className="review-eyebrow">{formatMonth(month)}</p>
        <h1 id="portfolio-title">投资组合</h1>
      </div>
      <MonthSwitcher month={month} pathname="/portfolio" />
    </header>
  );
}

export function PortfolioPageView({
  month,
  snapshot,
  categories,
}: {
  month: string;
  snapshot: MonthlySnapshot | null;
  categories: ReadonlyArray<PortfolioCategoryOption>;
}) {
  if (!snapshot) {
    return (
      <section
        aria-labelledby="portfolio-title"
        className="page-content portfolio-page"
      >
        <PortfolioToolbar month={month} />
        <div className="portfolio-empty-state surface-frosted">
          <h2>这个月份还没有投资组合数据</h2>
          <p>先录入现金、基金与负债，再回来查看只读的资产配置。</p>
          <Link
            className="primary-button review-entry-button"
            href={monthHref("/records", month)}
          >
            前往月度记录
          </Link>
        </div>
      </section>
    );
  }

  const review = calculateMonthlyReview(snapshot);
  const allocation = calculateInvestmentAllocation(
    {
      emergencyFundCents: BigInt(snapshot.cash.emergencyFundCents),
      goalFundCents: BigInt(snapshot.cash.goalFundCents),
      dailyCashCents: BigInt(snapshot.cash.dailyCashCents),
    },
    review.investmentCategories,
    categories,
  );
  const categoryLabels = new Map(
    categories.map((category) => [category.id, category.label]),
  );

  return (
    <section
      aria-labelledby="portfolio-title"
      className="page-content portfolio-page"
    >
      <PortfolioToolbar month={month} />

      <section
        aria-labelledby="portfolio-overview-title"
        className="portfolio-overview surface-frosted"
      >
        <div className="portfolio-overview-heading">
          <p className="review-eyebrow">组合概览</p>
          <h2 id="portfolio-overview-title">投资状态</h2>
          <Link href={monthHref("/records", month)}>更新月度记录</Link>
        </div>
        <dl className="portfolio-primary-metrics">
          <div>
            <dt>当前投资市值</dt>
            <dd>{formatMoney(review.assets.investmentCents)}</dd>
          </div>
          <div>
            <dt>本月净投入</dt>
            <dd>{formatDelta(review.cashFlow.investmentContributionCents)}</dd>
          </div>
        </dl>
        <dl className="portfolio-context-metrics">
          <div>
            <dt>现金</dt>
            <dd>{formatMoney(review.assets.cashCents)}</dd>
          </div>
          <div>
            <dt>投资</dt>
            <dd>{formatMoney(review.assets.investmentCents)}</dd>
          </div>
          <div className="portfolio-liability-metric">
            <dt>负债</dt>
            <dd>{formatMoney(review.assets.liabilityCents)}</dd>
          </div>
          <div
            className={
              review.cashFlow.investmentProfitLossCents < BigInt(0)
                ? "portfolio-negative-metric"
                : review.cashFlow.investmentProfitLossCents > BigInt(0)
                  ? "portfolio-positive-metric"
                  : undefined
            }
          >
            <dt>投资损益</dt>
            <dd>{formatDelta(review.cashFlow.investmentProfitLossCents)}</dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="portfolio-allocation-title"
        className="portfolio-allocation-panel surface-frosted"
      >
        <div className="portfolio-section-heading">
          <p className="review-eyebrow">资产结构</p>
          <h2 id="portfolio-allocation-title">资产配置</h2>
        </div>
        <AssetAllocation
          density="full"
          items={allocation.items}
          key={month}
          totalCents={allocation.totalCents}
        />
      </section>

      <section
        aria-labelledby="portfolio-holdings-title"
        className="portfolio-holdings-panel surface-base"
      >
        <div className="portfolio-section-heading">
          <p className="review-eyebrow">基金明细</p>
          <h2 id="portfolio-holdings-title">当前持仓</h2>
        </div>
        {snapshot.funds.length === 0 ? (
          <p className="portfolio-holdings-empty">本月没有基金持仓。</p>
        ) : (
          <div className="portfolio-holdings-table-wrap">
            <table className="portfolio-holdings-table">
              <thead>
                <tr>
                  <th scope="col">基金名称</th>
                  <th scope="col">固定分类</th>
                  <th scope="col">当前市值</th>
                  <th scope="col">本月净投入</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.funds.map((fund, index) => (
                  <tr key={`${fund.name}-${fund.category}-${index}`}>
                    <th scope="row">{fund.name}</th>
                    <td>
                      {categoryLabels.get(fund.category) ?? fund.category}
                    </td>
                    <td>{formatMoney(BigInt(fund.marketValueCents))}</td>
                    <td>{formatDelta(BigInt(fund.monthlyInvestmentCents))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
