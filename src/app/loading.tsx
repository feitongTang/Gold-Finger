export default function Loading() {
  return (
    <div
      className="loading-page"
      aria-busy="true"
      aria-label="正在载入月度记录"
    >
      <header className="app-header">
        <div className="app-header-inner">
          <p className="brand">Gold-Finger</p>
          <span className="header-divider" aria-hidden="true" />
          <p className="header-context">月度财务记录</p>
        </div>
      </header>
      <main className="page-content">
        <div className="month-panel">
          <div className="skeleton skeleton-line" />
        </div>
        <div className="snapshot-form">
          {["本月现金流", "现金资产", "基金资产", "负债"].map(
            (title, index) => (
              <section className="entry-section" key={title}>
                <div className="section-marker" aria-hidden="true">
                  {index + 1}
                </div>
                <div className="section-content">
                  <h2>{title}</h2>
                  <div className="field-grid field-grid-three">
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line" />
                  </div>
                </div>
              </section>
            ),
          )}
        </div>
      </main>
    </div>
  );
}
