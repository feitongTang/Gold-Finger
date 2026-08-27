import { afterEach, describe, expect, it, vi } from "vitest";

const originalMode = process.env.GOLD_FINGER_MODE;
const originalProjectId = process.env.GOLD_FINGER_PROJECT_ID;

afterEach(() => {
  if (originalMode === undefined) delete process.env.GOLD_FINGER_MODE;
  else process.env.GOLD_FINGER_MODE = originalMode;
  if (originalProjectId === undefined)
    delete process.env.GOLD_FINGER_PROJECT_ID;
  else process.env.GOLD_FINGER_PROJECT_ID = originalProjectId;
  vi.resetModules();
});

describe("launcher identity route", () => {
  it("identifies the project directory and runtime mode without caching", async () => {
    process.env.GOLD_FINGER_PROJECT_ID = "current-project";
    process.env.GOLD_FINGER_MODE = "demo";
    vi.resetModules();
    const { GET } = await import("@/app/api/launcher/route");

    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("gold-finger:current-project:demo");
  });
});
