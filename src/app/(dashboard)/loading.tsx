export default function DashboardLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="正在载入页面内容"
      className="dashboard-loading page-content"
    >
      <p className="sr-only" role="status">
        正在载入，请稍候。
      </p>
      <div aria-hidden="true" className="dashboard-loading-heading">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
      </div>
      <div aria-hidden="true" className="dashboard-loading-content">
        <div className="skeleton dashboard-loading-card" />
        <div className="skeleton dashboard-loading-card" />
      </div>
    </section>
  );
}
