import { describe, expect, it } from "vitest";

import { canAddFund } from "@/features/monthly-snapshots/form-model";

describe("monthly snapshot form model", () => {
  it("allows adding funds below the limit and stops at the limit", () => {
    expect(canAddFund(49)).toBe(true);
    expect(canAddFund(50)).toBe(false);
  });
});
