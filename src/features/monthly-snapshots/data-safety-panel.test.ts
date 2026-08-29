// @vitest-environment jsdom

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}));

import DataPage from "@/app/(dashboard)/data/page";
import { DataSafetyPanel } from "@/features/monthly-snapshots/data-safety-panel";

beforeEach(() => {
  navigation.refresh.mockReset();
  navigation.replace.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DataSafetyPanel", () => {
  it("renders the dedicated local data safety route without a month context", () => {
    const markup = renderToStaticMarkup(createElement(DataPage));

    expect(markup).toContain("数据仅保存在这台电脑");
    expect(markup).toContain("导出全部数据");
    expect(markup).toContain("从备份恢复");
    expect(markup).not.toContain("month=");
  });

  it("presents file selection as a compact labeled control", () => {
    const markup = renderToStaticMarkup(createElement(DataSafetyPanel));

    expect(markup).toContain('class="backup-file-picker"');
    expect(markup).toContain('class="backup-file-button"');
    expect(markup).toContain('class="backup-file-name"');
    expect(markup).toContain('class="sr-only"');
    expect(markup).toContain("未选择文件");
    expect(markup).toContain('for="backup-file"');
  });

  it("returns to the review after confirming a successful restore", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: true, snapshotCount: 2 }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(DataSafetyPanel, { restoreSuccessHref: "/" }));

    const backup = new File(
      [JSON.stringify({ version: 1, snapshots: [] })],
      "gold-finger-backup.json",
      { type: "application/json" },
    );
    fireEvent.change(screen.getByLabelText("选择备份文件"), {
      target: { files: [backup] },
    });
    fireEvent.click(screen.getByRole("button", { name: "恢复备份" }));

    expect(screen.getByRole("alert").textContent).toContain(
      "这会永久替换当前全部月度记录",
    );

    fireEvent.click(screen.getByRole("button", { name: "确认替换并恢复" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/backup",
        expect.objectContaining({ method: "POST" }),
      );
      expect(navigation.replace).toHaveBeenCalledWith("/");
      expect(navigation.refresh).toHaveBeenCalledOnce();
    });
  });
});
