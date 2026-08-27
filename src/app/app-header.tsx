export function AppHeader({ ariaHidden }: { ariaHidden?: true }) {
  return (
    <header aria-hidden={ariaHidden} className="app-header">
      <div className="app-header-inner">
        <p className="brand">Gold-Finger</p>
        <span aria-hidden="true" className="header-divider" />
        <p className="header-context">月度财务复盘</p>
      </div>
    </header>
  );
}
