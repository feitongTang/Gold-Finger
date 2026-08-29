export default function Loading() {
  return (
    <div
      className="loading-page"
      aria-busy="true"
      aria-label="正在载入月度记录"
    >
      <p className="sr-only" role="status">
        正在载入月度记录，请稍候。
      </p>
      <header aria-hidden="true" className="app-header">
        <div className="app-header-inner">
          <p className="brand">Gold-Finger</p>
          <span aria-hidden="true" className="header-divider" />
          <p className="header-context">月度财务复盘</p>
        </div>
      </header>
      <main className="page-content" aria-hidden="true">
        <div className="review-panel review-loading">
          <div className="skeleton skeleton-review-title" />
          <div className="skeleton skeleton-line" />
          <div className="metric-grid">
            {[0, 1, 2].map((item) => (
              <div className="skeleton skeleton-review-card" key={item} />
            ))}
          </div>
        </div>
        <div className="history-panel review-loading">
          <div className="skeleton skeleton-review-title" />
          <div className="skeleton skeleton-review-card" />
        </div>
        <div className="entry-toggle-panel">
          <div className="skeleton skeleton-review-title" />
          <div className="skeleton skeleton-line" />
        </div>
      </main>
    </div>
  );
}
