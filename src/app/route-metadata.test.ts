import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/monthly-snapshots/data", () => ({
  loadMonthlyEntry: vi.fn(),
}));

import { metadata as dataMetadata } from "@/app/(dashboard)/data/page";
import { metadata as reviewMetadata } from "@/app/(dashboard)/page";
import { metadata as portfolioMetadata } from "@/app/(dashboard)/portfolio/page";
import { metadata as recordsMetadata } from "@/app/(dashboard)/records/page";
import { metadata as trendsMetadata } from "@/app/(dashboard)/trends/page";
import { metadata as rootMetadata } from "@/app/layout";

describe("route metadata", () => {
  it("gives every dashboard route a unique descriptive page title", () => {
    expect(rootMetadata.title).toEqual({
      default: "Gold-Finger",
      template: "%s | Gold-Finger",
    });
    expect(reviewMetadata.title).toBe("月度复盘");
    expect(recordsMetadata.title).toBe("月度记录");
    expect(portfolioMetadata.title).toBe("投资组合");
    expect(trendsMetadata.title).toBe("历史趋势");
    expect(dataMetadata.title).toBe("数据安全");
  });
});
