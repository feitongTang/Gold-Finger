import { DataSafetyPanel } from "@/features/monthly-snapshots/data-safety-panel";

export default function DataPage() {
  return (
    <section
      aria-labelledby="data-page-title"
      className="page-content data-safety-page"
    >
      <header className="review-page-heading">
        <div>
          <p className="review-eyebrow">本地数据管理</p>
          <h1 id="data-page-title">数据安全</h1>
        </div>
      </header>
      <DataSafetyPanel restoreSuccessHref="/" />
    </section>
  );
}
