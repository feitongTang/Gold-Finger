"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="error-page">
      <header className="app-header">
        <div className="app-header-inner">
          <p className="brand">Gold-Finger</p>
          <span aria-hidden="true" className="header-divider" />
          <p className="header-context">月度财务复盘</p>
        </div>
      </header>
      <main className="error-shell">
        <section className="error-panel">
          <h1>暂时无法读取财务记录</h1>
          <p>
            本地数据库没有成功响应。请确认 DATABASE_FILE
            指向可读写的数据库文件，然后重新载入；已保存的数据不会被自动删除。
          </p>
          <button className="primary-button" onClick={reset} type="button">
            重新载入
          </button>
        </section>
      </main>
    </div>
  );
}
