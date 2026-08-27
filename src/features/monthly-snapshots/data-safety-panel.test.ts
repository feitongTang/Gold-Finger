import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

import { DataSafetyPanel } from "@/features/monthly-snapshots/data-safety-panel";

describe("DataSafetyPanel", () => {
  it("presents file selection as a compact labeled control", () => {
    const markup = renderToStaticMarkup(createElement(DataSafetyPanel));

    expect(markup).toContain('class="backup-file-picker"');
    expect(markup).toContain('class="backup-file-button"');
    expect(markup).toContain('class="backup-file-name"');
    expect(markup).toContain('class="sr-only"');
    expect(markup).toContain("未选择文件");
    expect(markup).toContain('for="backup-file"');
  });
});
