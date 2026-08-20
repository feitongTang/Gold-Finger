"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-shell">
      <section className="error-panel">
        <h1>暂时无法读取财务记录</h1>
        <p>本地数据库没有成功响应。请稍后重试，已保存的数据不会被清除。</p>
        <button className="retry-button" onClick={reset} type="button">
          重新载入
        </button>
      </section>
    </main>
  );
}
