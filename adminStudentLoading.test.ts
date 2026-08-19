import { describe, expect, it } from "vitest";
import { buildStudentRosterQuery, describeStudentLoad, shouldRenderLoadedRoster } from "@shared/adminStudentLoading";

describe("explicit Admin student loading", () => {
  it("builds a trimmed session/trade roster query and does not include roll search", () => {
    expect(buildStudentRosterQuery({ session: " 2026-28 ", trade: " Fitter ", unit: "2" })).toEqual({ session: "2026-28", trade: "Fitter" });
  });

  it("preserves any selected current or future session without injecting 2026-28", () => {
    expect(buildStudentRosterQuery({ session: "2025-27", trade: "Fitter", unit: "1" })).toEqual({ session: "2025-27", trade: "Fitter" });
    expect(buildStudentRosterQuery({ session: "2027-29", trade: "Electrician", unit: "2" })).toEqual({ session: "2027-29", trade: "Electrician" });
  });

  it("renders rows only after Load Students has completed", () => {
    expect(shouldRenderLoadedRoster(false, [["1", "A"]])).toBe(false);
    expect(shouldRenderLoadedRoster(true, [])).toBe(false);
    expect(shouldRenderLoadedRoster(true, [["1", "A"]])).toBe(true);
  });

  it("requires a real selected session in the load description", () => {
    expect(describeStudentLoad({ session: "2025-27", trade: "Fitter", unit: "1" }, 17)).toBe("17 students loaded for Session 2025-27, Fitter, Unit 1.");
  });

  it("describes the authoritative session/unit selection", () => {
    expect(describeStudentLoad({ session: "2026-28", trade: "Electrician", unit: "1" }, 20)).toContain("Session 2026-28, Electrician, Unit 1");
  });
});
