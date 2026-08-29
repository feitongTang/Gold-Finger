"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";

import type { InvestmentAllocationItem } from "@/features/monthly-snapshots/review-model";

const DEFAULT_EXPANDED_IDS = ["asset-class:stocks", "market:美国市场"] as const;

function formatPercentage(percentage: number) {
  return Number.isInteger(percentage)
    ? String(percentage)
    : percentage.toFixed(1);
}

function assetTone(item: InvestmentAllocationItem) {
  if (item.id === "asset-class:stocks") return "stocks";
  if (item.id === "asset-class:bonds") return "bonds";
  if (item.id === "asset-class:other") return "other";
  if (item.id === "asset-class:cash") return "cash";
  return null;
}

function AllocationRow({
  item,
  depth,
  isExpanded,
  onToggle,
  parentLabel,
}: {
  item: InvestmentAllocationItem;
  depth: number;
  isExpanded: boolean;
  onToggle?: () => void;
  parentLabel: string | null;
}) {
  const childrenId = `allocation-children-${item.id}`;
  const style = { "--allocation-depth": depth } as CSSProperties;
  const content = (
    <>
      <span className="allocation-name-group">
        {onToggle ? (
          <span aria-hidden="true" className="allocation-chevron">
            {isExpanded ? "⌄" : "›"}
          </span>
        ) : (
          <span aria-hidden="true" className="allocation-chevron-spacer" />
        )}
        <span className="allocation-name">{item.label}</span>
      </span>
      <span className="allocation-bar" aria-hidden="true">
        <span style={{ width: `${item.totalPercentage}%` }} />
      </span>
      <span className="allocation-percentages">
        <strong>总体 {formatPercentage(item.totalPercentage)}%</strong>
        {parentLabel && item.parentPercentage !== null ? (
          <span>
            占{parentLabel} {formatPercentage(item.parentPercentage)}%
          </span>
        ) : null}
      </span>
    </>
  );
  const handleToggleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onToggle?.();
  };

  return onToggle ? (
    <button
      aria-controls={childrenId}
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? "收起" : "展开"}${item.label}`}
      className="allocation-row allocation-row-button"
      onClick={onToggle}
      onKeyDown={handleToggleKeyDown}
      style={style}
      type="button"
    >
      {content}
    </button>
  ) : (
    <div className="allocation-row" style={style}>
      {content}
    </div>
  );
}

function AllocationTree({
  items,
  depth,
  expandedIds,
  onToggle,
  parentLabel,
}: {
  items: InvestmentAllocationItem[];
  depth: number;
  expandedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  parentLabel: string | null;
}) {
  return (
    <ul className="allocation-list">
      {items.map((item) => {
        const tone = depth === 0 ? assetTone(item) : null;
        const hasChildren = item.children.length > 0;
        const isExpanded = hasChildren && expandedIds.has(item.id);
        const childrenId = `allocation-children-${item.id}`;

        return (
          <li
            className={tone ? `allocation-tone-${tone}` : undefined}
            key={item.id}
          >
            <AllocationRow
              depth={depth}
              isExpanded={isExpanded}
              item={item}
              onToggle={hasChildren ? () => onToggle(item.id) : undefined}
              parentLabel={parentLabel}
            />
            {isExpanded ? (
              <div id={childrenId}>
                <AllocationTree
                  depth={depth + 1}
                  expandedIds={expandedIds}
                  items={item.children}
                  onToggle={onToggle}
                  parentLabel={item.label}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function AssetAllocation({
  density = "full",
  items,
  totalCents,
}: {
  density?: "summary" | "full";
  items: InvestmentAllocationItem[];
  totalCents: bigint;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(DEFAULT_EXPANDED_IDS),
  );

  if (totalCents === BigInt(0)) {
    return (
      <p className="asset-allocation-empty">
        这个月份还没有可用于计算资产配置的数据。
      </p>
    );
  }

  const toggle = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="asset-allocation">
      <figure className="asset-allocation-overview">
        <figcaption>全部可配置资产</figcaption>
        <div
          aria-label={items
            .map(
              (item) =>
                `${item.label} ${formatPercentage(item.totalPercentage)}%`,
            )
            .join("，")}
          className="asset-allocation-overview-bar"
          role="img"
        >
          {items.map((item) => (
            <span
              className={`asset-allocation-segment allocation-tone-${assetTone(item)}`}
              key={item.id}
              style={{ width: `${item.totalPercentage}%` }}
            />
          ))}
        </div>
        <ul className="asset-allocation-legend" aria-label="资产配置图例">
          {items.map((item) => (
            <li className={`allocation-tone-${assetTone(item)}`} key={item.id}>
              <span aria-hidden="true" className="asset-allocation-swatch" />
              <span>{item.label}</span>
              <strong>{formatPercentage(item.totalPercentage)}%</strong>
            </li>
          ))}
        </ul>
      </figure>
      <div className="asset-allocation-tree">
        {density === "summary" ? (
          <ul className="allocation-list allocation-list-summary">
            {items.map((item) => {
              const tone = assetTone(item);

              return (
                <li
                  className={tone ? `allocation-tone-${tone}` : undefined}
                  key={item.id}
                >
                  <AllocationRow
                    depth={0}
                    isExpanded={false}
                    item={item}
                    parentLabel={null}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <AllocationTree
            depth={0}
            expandedIds={expandedIds}
            items={items}
            onToggle={toggle}
            parentLabel={null}
          />
        )}
      </div>
    </div>
  );
}
