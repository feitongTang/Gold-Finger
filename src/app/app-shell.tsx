import { Suspense, type ReactNode } from "react";

import { AppSidebar } from "@/app/app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Suspense fallback={<aside aria-hidden="true" className="app-sidebar" />}>
        <AppSidebar />
      </Suspense>
      <main className="app-main">{children}</main>
    </div>
  );
}
