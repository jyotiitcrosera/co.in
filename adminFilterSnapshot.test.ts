import { describe, expect, it } from "vitest";
import { buildAdminFilterSnapshot, isAdminFilterReady } from "@shared/adminFilterSnapshot";

describe("Admin selected filter snapshot", () => {
  it("preserves the visible selected session, trade, and unit", () => {
    const snapshot = buildAdminFilterSnapshot({ session: " 2025-27 ", trade: "Fitter", unit: "1" });
    expect(snapshot).toEqual({ session: "2025-27", trade: "Fitter", unit: "1" });
    expect(isAdminFilterReady(snapshot)).toBe(true);
  });

  it("does not treat an incomplete visible selection as ready", () => {
    expect(isAdminFilterReady(buildAdminFilterSnapshot({ session: "2025-27", trade: "Fitter", unit: "" }))).toBe(false);
  });
});
