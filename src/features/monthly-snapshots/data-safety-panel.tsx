"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";

const LAST_EXPORT_KEY = "gold-finger:last-successful-export:v1";
const MAX_BACKUP_SIZE = 2_000_000;
const lastExportListeners = new Set<() => void>();
let sessionLastExportAt: string | null = null;

type OperationState = {
  status: "idle" | "working" | "success" | "error";
  message: string;
};

const initialOperationState: OperationState = { status: "idle", message: "" };

function getLastExportSnapshot() {
  try {
    return window.localStorage.getItem(LAST_EXPORT_KEY) ?? sessionLastExportAt;
  } catch {
    return sessionLastExportAt;
  }
}

function subscribeToLastExport(listener: () => void) {
  lastExportListeners.add(listener);
  return () => lastExportListeners.delete(listener);
}

function recordSuccessfulExport(exportedAt: string) {
  sessionLastExportAt = exportedAt;
  try {
    window.localStorage.setItem(LAST_EXPORT_KEY, exportedAt);
  } catch {
    // The download still succeeded when browser storage is unavailable.
  }
  lastExportListeners.forEach((listener) => listener());
}

function formatExportTime(timestamp: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function DataSafetyPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastExportAt = useSyncExternalStore(
    subscribeToLastExport,
    getLastExportSnapshot,
    () => null,
  );
  const [operation, setOperation] = useState(initialOperationState);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [confirmingRestore, setConfirmingRestore] = useState(false);

  async function exportBackup() {
    setOperation({ status: "working", message: "正在生成本地数据备份…" });
    try {
      const response = await fetch("/api/backup", { cache: "no-store" });
      if (!response.ok) throw new Error("export failed");
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `gold-finger-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      const exportedAt = new Date().toISOString();
      recordSuccessfulExport(exportedAt);
      setOperation({
        status: "success",
        message: "备份已导出。请把文件保存到安全位置。",
      });
    } catch {
      setOperation({
        status: "error",
        message: "导出失败。请检查本地应用后重试。",
      });
    }
  }

  function prepareRestore() {
    if (!restoreFile) {
      setOperation({ status: "error", message: "请先选择 JSON 备份文件。" });
      fileInputRef.current?.focus();
      return;
    }
    if (restoreFile.size > MAX_BACKUP_SIZE) {
      setOperation({
        status: "error",
        message: "备份文件超过 2 MB，无法恢复。",
      });
      return;
    }
    setConfirmingRestore(true);
    setOperation(initialOperationState);
  }

  async function restoreBackup() {
    if (!restoreFile) return;
    setOperation({ status: "working", message: "正在校验并恢复备份…" });
    try {
      const response = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: await restoreFile.text(),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        snapshotCount?: number;
      };
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "恢复失败，当前数据未被修改。");
      }

      setOperation({
        status: "success",
        message: `已从备份恢复 ${result.snapshotCount ?? 0} 个月份。`,
      });
      setRestoreFile(null);
      setConfirmingRestore(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.replace("/");
      router.refresh();
    } catch (error) {
      setOperation({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "恢复失败，当前数据未被修改。",
      });
    }
  }

  const busy = operation.status === "working";

  return (
    <section aria-labelledby="data-safety-title" className="data-safety-panel">
      <div className="data-safety-heading">
        <div>
          <p className="data-safety-eyebrow">本地数据安全</p>
          <h2 id="data-safety-title">数据仅保存在这台电脑</h2>
        </div>
        <p>
          Gold-Finger
          不会上传或同步财务数据。请定期导出备份，并保存到项目目录之外。
        </p>
      </div>

      <div className="data-safety-grid">
        <section aria-labelledby="export-backup-title" className="safety-card">
          <h3 id="export-backup-title">导出备份</h3>
          <p>下载包含全部月份的版本化 JSON 文件，可用于完整恢复。</p>
          <p className="backup-status">
            {lastExportAt
              ? `最近成功导出：${formatExportTime(lastExportAt)}`
              : "尚无成功导出记录"}
          </p>
          <button
            className="primary-button"
            disabled={busy}
            onClick={exportBackup}
            type="button"
          >
            {busy ? "处理中…" : "导出全部数据"}
          </button>
        </section>

        <section aria-labelledby="restore-backup-title" className="safety-card">
          <h3 id="restore-backup-title">从备份恢复</h3>
          <p>仅接受 Gold-Finger 导出的 JSON；校验通过后才会替换当前数据。</p>
          <label className="backup-file-label" htmlFor="backup-file">
            选择备份文件
          </label>
          <input
            accept="application/json,.json"
            disabled={busy}
            id="backup-file"
            onChange={(event) => {
              setRestoreFile(event.target.files?.[0] ?? null);
              setConfirmingRestore(false);
              setOperation(initialOperationState);
            }}
            ref={fileInputRef}
            type="file"
          />

          {confirmingRestore ? (
            <div className="restore-confirmation" role="alert">
              <strong>这会永久替换当前全部月度记录，且无法撤销。</strong>
              <span>将使用：{restoreFile?.name}</span>
              <div>
                <button
                  className="secondary-button"
                  disabled={busy}
                  onClick={() => setConfirmingRestore(false)}
                  type="button"
                >
                  取消
                </button>
                <button
                  className="danger-button"
                  disabled={busy}
                  onClick={restoreBackup}
                  type="button"
                >
                  {busy ? "恢复中…" : "确认替换并恢复"}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="secondary-button restore-button"
              disabled={busy}
              onClick={prepareRestore}
              type="button"
            >
              恢复备份
            </button>
          )}
        </section>
      </div>

      {operation.message ? (
        <p
          aria-live="polite"
          className={`data-operation-message data-operation-message-${operation.status}`}
          role={operation.status === "error" ? "alert" : "status"}
        >
          {operation.message}
        </p>
      ) : null}
    </section>
  );
}
