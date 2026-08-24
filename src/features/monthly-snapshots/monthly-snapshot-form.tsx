"use client";

import { useActionState, useRef, useState } from "react";

import { saveMonthlySnapshotAction } from "@/features/monthly-snapshots/actions";
import {
  canAddFund,
  formatCentsAsYuan,
  formatMonthlyInvestmentLabel,
  initialMonthlySnapshotFormState,
  MAX_FUNDS,
} from "@/features/monthly-snapshots/form-model";

type CategoryOption = {
  id: string;
  assetClass: string;
  market?: string;
  label: string;
};

type SnapshotValues = {
  cashFlow: {
    incomeCents: number;
    expenseCents: number;
    investmentProfitLossCents: number;
    investmentContributionCents: number;
  };
  cash: {
    emergencyFundCents: number;
    goalFundCents: number;
    dailyCashCents: number;
  };
  funds: Array<{
    name: string;
    category: string;
    marketValueCents: number;
    monthlyInvestmentCents: number;
  }>;
  liabilities: { huabeiBalanceCents: number };
};

type FundRow = {
  id: string;
  name: string;
  category: string;
  marketValue: string;
  monthlyInvestment: string;
};

type InitialFund = Omit<SnapshotValues["funds"][number], "marketValueCents"> & {
  marketValueCents: number | null;
};

type MoneyFieldProps = {
  name: string;
  label: string;
  defaultValue: string;
  error?: string;
  allowNegative?: boolean;
};

function MoneyField({
  name,
  label,
  defaultValue,
  error,
  allowNegative = false,
}: MoneyFieldProps) {
  const inputId = `field-${name.replaceAll(".", "-")}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="form-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="money-control">
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          defaultValue={defaultValue}
          id={inputId}
          inputMode="decimal"
          min={allowNegative ? undefined : "0"}
          name={name}
          required
          step="0.01"
          type="number"
        />
        <span aria-hidden="true">元</span>
      </div>
      {error ? (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function createFundRows(funds: ReadonlyArray<InitialFund>): FundRow[] {
  return funds.map((fund, index) => ({
    id: `saved-${index}`,
    name: fund.name,
    category: fund.category,
    marketValue:
      fund.marketValueCents === null
        ? ""
        : formatCentsAsYuan(fund.marketValueCents),
    monthlyInvestment: formatCentsAsYuan(fund.monthlyInvestmentCents),
  }));
}

export function MonthlySnapshotForm({
  month,
  snapshot,
  initialFunds,
  categories,
}: {
  month: string;
  snapshot: SnapshotValues | null;
  initialFunds: ReadonlyArray<InitialFund>;
  categories: ReadonlyArray<CategoryOption>;
}) {
  const [state, formAction, pending] = useActionState(
    saveMonthlySnapshotAction,
    initialMonthlySnapshotFormState,
  );
  const [isOpen, setIsOpen] = useState(false);
  const fundSource = JSON.stringify(initialFunds);
  const [fundState, setFundState] = useState(() => ({
    source: fundSource,
    rows: createFundRows(initialFunds),
  }));
  if (fundState.source !== fundSource) {
    setFundState({ source: fundSource, rows: createFundRows(initialFunds) });
  }
  const fundRows = fundState.rows;
  const nextFundId = useRef(fundRows.length);
  const errors = state.fieldErrors;
  const centsValue = (cents: number | undefined) =>
    formatCentsAsYuan(cents ?? 0);
  const fieldValue = (name: string, fallback: string) =>
    state.values?.[name] ?? fallback;
  const fundLimitReached = !canAddFund(fundRows.length);
  const monthlyInvestmentLabel = formatMonthlyInvestmentLabel(month);
  const fundError = errors.fundCount ?? errors.fundInvestmentTotal;
  const fundCountMessage = fundError
    ? fundError
    : fundLimitReached
      ? `每个月最多添加 ${MAX_FUNDS} 只基金。`
      : undefined;

  function addFund() {
    if (!canAddFund(fundRows.length)) return;

    const id = `new-${nextFundId.current}`;
    nextFundId.current += 1;
    setFundState((current) => ({
      ...current,
      rows: [
        ...current.rows,
        {
          id,
          name: "",
          category: categories[0]?.id ?? "",
          marketValue: "",
          monthlyInvestment: "0",
        },
      ],
    }));
  }

  function removeFund(id: string) {
    setFundState((current) => ({
      ...current,
      rows: current.rows.filter((row) => row.id !== id),
    }));
  }

  return (
    <>
      <section
        className="entry-toggle-panel"
        aria-labelledby="entry-title"
        id="monthly-entry"
      >
        <div>
          <h2 id="entry-title">月度记录</h2>
          <p>{snapshot ? "本月已有数据，可按需修改。" : "本月还没有数据。"}</p>
        </div>
        <button
          aria-controls="monthly-entry-form"
          aria-expanded={isOpen}
          className={`primary-button entry-toggle-button${isOpen ? " entry-toggle-button-open" : ""}`}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? "收起记录" : snapshot ? "更新数据" : "新建数据"}
        </button>
      </section>
      <form
        action={formAction}
        className="snapshot-form"
        hidden={!isOpen}
        id="monthly-entry-form"
      >
        <input name="month" type="hidden" value={month} />
        <input name="fundCount" type="hidden" value={fundRows.length} />

        <section className="entry-section" aria-labelledby="cash-flow-title">
          <div className="section-marker" aria-hidden="true">
            1
          </div>
          <div className="section-content">
            <h2 id="cash-flow-title">本月现金流</h2>
            <div className="field-grid field-grid-three">
              <MoneyField
                defaultValue={fieldValue(
                  "income",
                  centsValue(snapshot?.cashFlow.incomeCents),
                )}
                error={errors.income}
                label="收入"
                name="income"
              />
              <MoneyField
                defaultValue={fieldValue(
                  "expense",
                  centsValue(snapshot?.cashFlow.expenseCents),
                )}
                error={errors.expense}
                label="支出"
                name="expense"
              />
              <MoneyField
                allowNegative
                defaultValue={fieldValue(
                  "investmentProfitLoss",
                  centsValue(snapshot?.cashFlow.investmentProfitLossCents),
                )}
                error={errors.investmentProfitLoss}
                label="投资损益（收益为正、亏损为负）"
                name="investmentProfitLoss"
              />
            </div>
          </div>
        </section>

        <section className="entry-section" aria-labelledby="cash-assets-title">
          <div className="section-marker" aria-hidden="true">
            2
          </div>
          <div className="section-content">
            <h2 id="cash-assets-title">现金资产</h2>
            <div className="field-grid field-grid-three">
              <MoneyField
                defaultValue={fieldValue(
                  "emergencyFund",
                  centsValue(snapshot?.cash.emergencyFundCents),
                )}
                error={errors.emergencyFund}
                label="应急备用金"
                name="emergencyFund"
              />
              <MoneyField
                defaultValue={fieldValue(
                  "goalFund",
                  centsValue(snapshot?.cash.goalFundCents),
                )}
                error={errors.goalFund}
                label="目标准备金"
                name="goalFund"
              />
              <MoneyField
                defaultValue={fieldValue(
                  "dailyCash",
                  centsValue(snapshot?.cash.dailyCashCents),
                )}
                error={errors.dailyCash}
                label="日常现金"
                name="dailyCash"
              />
            </div>
          </div>
        </section>

        <section className="entry-section" aria-labelledby="fund-assets-title">
          <div className="section-marker" aria-hidden="true">
            3
          </div>
          <div className="section-content">
            <div className="section-heading-row">
              <div>
                <h2 id="fund-assets-title">基金资产</h2>
                <p>
                  按当前持有情况填写；{monthlyInvestmentLabel}
                  是当月申购减去赎回的现金净额，用于计算月度结余。
                </p>
              </div>
            </div>

            {fundCountMessage ? (
              <p
                className={`fund-count-message ${fundError ? "field-error" : ""}`}
                id="fund-count-message"
                role={fundError ? "alert" : "status"}
              >
                {fundCountMessage}
              </p>
            ) : null}

            {fundRows.length === 0 ? (
              <p className="empty-funds">还没有基金记录，按需添加即可。</p>
            ) : (
              <div className="fund-list">
                {fundRows.map((fund, index) => {
                  const prefix = `funds.${index}`;
                  const nameId = `field-${prefix.replaceAll(".", "-")}-name`;
                  const nameError = errors[`${prefix}.name`];
                  const categoryError = errors[`${prefix}.category`];

                  return (
                    <fieldset className="fund-row" key={fund.id}>
                      <legend>基金 {index + 1}</legend>
                      <div className="fund-row-grid">
                        <div className="form-field fund-name-field">
                          <label htmlFor={nameId}>基金名称</label>
                          <input
                            aria-describedby={
                              nameError ? `${nameId}-error` : undefined
                            }
                            aria-invalid={nameError ? true : undefined}
                            defaultValue={fieldValue(
                              `${prefix}.name`,
                              fund.name,
                            )}
                            id={nameId}
                            name={`${prefix}.name`}
                            required
                            type="text"
                          />
                          {nameError ? (
                            <p className="field-error" id={`${nameId}-error`}>
                              {nameError}
                            </p>
                          ) : null}
                        </div>
                        <div className="form-field fund-category-field">
                          <label htmlFor={`${nameId}-category`}>固定分类</label>
                          <select
                            aria-describedby={
                              categoryError
                                ? `${nameId}-category-error`
                                : undefined
                            }
                            aria-invalid={categoryError ? true : undefined}
                            defaultValue={fieldValue(
                              `${prefix}.category`,
                              fund.category,
                            )}
                            id={`${nameId}-category`}
                            name={`${prefix}.category`}
                            required
                          >
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.market &&
                                category.market !== category.label
                                  ? `${category.assetClass} · ${category.market} · ${category.label}`
                                  : `${category.assetClass} · ${category.label}`}
                              </option>
                            ))}
                          </select>
                          {categoryError ? (
                            <p
                              className="field-error"
                              id={`${nameId}-category-error`}
                            >
                              {categoryError}
                            </p>
                          ) : null}
                        </div>
                        <MoneyField
                          defaultValue={fieldValue(
                            `${prefix}.marketValue`,
                            fund.marketValue,
                          )}
                          error={errors[`${prefix}.marketValue`]}
                          label="当前市值"
                          name={`${prefix}.marketValue`}
                        />
                        <MoneyField
                          allowNegative
                          defaultValue={fieldValue(
                            `${prefix}.monthlyInvestment`,
                            fund.monthlyInvestment,
                          )}
                          error={errors[`${prefix}.monthlyInvestment`]}
                          label={monthlyInvestmentLabel}
                          name={`${prefix}.monthlyInvestment`}
                        />
                        <button
                          aria-label={`移除基金 ${index + 1}${fund.name ? `：${fund.name}` : ""}`}
                          className="remove-button"
                          onClick={() => removeFund(fund.id)}
                          type="button"
                        >
                          移除
                        </button>
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            )}

            <div className="fund-add-actions">
              <button
                aria-describedby={
                  fundCountMessage ? "fund-count-message" : undefined
                }
                className="secondary-button"
                disabled={fundLimitReached}
                onClick={addFund}
                type="button"
              >
                <span aria-hidden="true">＋</span>{" "}
                {fundLimitReached ? "已达基金上限" : "添加基金"}
              </button>
            </div>
          </div>
        </section>

        <section className="entry-section" aria-labelledby="liability-title">
          <div className="section-marker" aria-hidden="true">
            4
          </div>
          <div className="section-content">
            <h2 id="liability-title">负债</h2>
            <div className="liability-field">
              <MoneyField
                defaultValue={fieldValue(
                  "huabeiBalance",
                  centsValue(snapshot?.liabilities.huabeiBalanceCents),
                )}
                error={errors.huabeiBalance}
                label="花呗余额"
                name="huabeiBalance"
              />
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button className="primary-button" disabled={pending} type="submit">
            {pending ? "保存中…" : snapshot ? "更新月度记录" : "保存月度记录"}
          </button>
          <p
            className={`form-message form-message-${state.status}`}
            role={state.status === "error" ? "alert" : undefined}
            aria-live="polite"
          >
            {state.message}
          </p>
        </div>
      </form>
    </>
  );
}
