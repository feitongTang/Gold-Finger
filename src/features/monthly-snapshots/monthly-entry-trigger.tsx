"use client";

export const OPEN_MONTHLY_ENTRY_EVENT = "gold-finger:open-monthly-entry";

export function MonthlyEntryTrigger({ label }: { label: string }) {
  return (
    <button
      className="primary-button review-entry-button"
      onClick={() => window.dispatchEvent(new Event(OPEN_MONTHLY_ENTRY_EVENT))}
      type="button"
    >
      {label}
    </button>
  );
}
