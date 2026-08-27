"use client";

import { useActionState, useState } from "react";

import { deleteMonthlySnapshotAction } from "@/features/monthly-snapshots/actions";
import { initialDeleteMonthlySnapshotState } from "@/features/monthly-snapshots/delete";

export function MonthlyRecordActions({ month }: { month: string }) {
  const deleteAction = deleteMonthlySnapshotAction.bind(null, month);
  const [state, formAction, pending] = useActionState(
    deleteAction,
    initialDeleteMonthlySnapshotState,
  );
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className="record-delete-control">
        <button
          className="danger-text-button"
          onClick={() => setConfirming(true)}
          type="button"
        >
          删除本月
        </button>
        {state.message ? (
          <p
            aria-live="polite"
            className={`record-action-message record-action-message-${state.status}`}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="record-delete-confirmation">
      <p>
        永久删除 {month}{" "}
        的月度记录？相关现金、基金和负债数据都会删除，且无法撤销。
      </p>
      <div className="record-delete-actions">
        <button
          className="secondary-button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          type="button"
        >
          取消
        </button>
        <button className="danger-button" disabled={pending} type="submit">
          {pending ? "删除中…" : "确认永久删除"}
        </button>
      </div>
      {state.message ? (
        <p
          aria-live="assertive"
          className={`record-action-message record-action-message-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
