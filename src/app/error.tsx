"use client";

import { useEffect } from "react";

export default function ErrorPage({
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
    <main className="error-shell">
      <section className="error-panel">
        <h1>暂时无法载入应用</h1>
        <p>应用遇到临时错误，已保存的本地数据不会被自动删除。</p>
        <button className="retry-button" onClick={retry} type="button">
          重新载入
        </button>
      </section>
    </main>
  );
}
