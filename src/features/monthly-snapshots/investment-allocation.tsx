"use client";

import { useState } from "react";

import type { InvestmentAllocationItem } from "@/features/monthly-snapshots/review-model";

function AllocationRow({
  item,
  onSelect,
}: {
  item: InvestmentAllocationItem;
  onSelect?: () => void;
}) {
  const content = (
    <>
      <span className="allocation-name">{item.label}</span>
      <span className="allocation-bar" aria-hidden="true">
        <span style={{ width: `${item.percentage}%` }} />
      </span>
      <strong>{item.percentage}%</strong>
      {onSelect ? (
        <span className="allocation-chevron" aria-hidden="true">
          ›
        </span>
      ) : null}
    </>
  );

  return onSelect ? (
    <button
      aria-label={`查看${item.label}的下一级分类`}
      className="allocation-row allocation-row-button"
      onClick={onSelect}
      type="button"
    >
      {content}
    </button>
  ) : (
    <div className="allocation-row">{content}</div>
  );
}

export function InvestmentAllocation({
  items,
}: {
  items: InvestmentAllocationItem[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedItems: InvestmentAllocationItem[] = [];
  let visibleItems = items;

  for (const selectedId of selectedIds) {
    const selectedItem = visibleItems.find((item) => item.id === selectedId);
    if (!selectedItem) break;
    selectedItems.push(selectedItem);
    visibleItems = selectedItem.children;
  }

  const pathLabel = [
    "全部投资",
    ...selectedItems.map((item) => item.label),
  ].join(" / ");

  return (
    <div className="allocation-drilldown">
      <div className="allocation-navigation">
        <p aria-live="polite" className="allocation-path">
          {pathLabel}
        </p>
        {selectedItems.length > 0 ? (
          <button
            className="allocation-back"
            onClick={() => setSelectedIds((current) => current.slice(0, -1))}
            type="button"
          >
            <span aria-hidden="true">←</span> 返回上一级
          </button>
        ) : null}
      </div>
      <ul className="allocation-list">
        {visibleItems.map((item) => (
          <li key={item.id}>
            <AllocationRow
              item={item}
              onSelect={
                item.children.length > 0
                  ? () => setSelectedIds((current) => [...current, item.id])
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
