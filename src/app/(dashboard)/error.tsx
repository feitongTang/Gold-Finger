"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="dashboard-error-shell">
      <section className="error-panel surface-frosted">
        <h1>暂时无法读取财务记录</h1>
        <p>
          本地数据库没有成功响应。请确认 DATABASE_FILE
          指向可读写的数据库文件，然后重新载入；已保存的数据不会被自动删除。
        </p>
        <button className="retry-button" onClick={retry} type="button">
          重新载入
        </button>
      </section>
    </main>
  );
}
