import { describe, expect, it } from "vitest";
import { feeLookup, getNotices, getSheetData, getStaffList } from "./googleSheets";

describe("final Apps Script module connectivity", () => {
  it.skipIf(process.env.RUN_FINAL_LIVE !== "1")("fetches all major read modules without a timeout", async () => {
    const results = await Promise.all([
      getSheetData("2025-27FITTER"),
      getSheetData("MONTHLY MARKS"),
      getSheetData("QUARTERLY MARKS"),
      getSheetData("JOB EVOLUTION"),
      getSheetData("ATTENDANCE"),
      getNotices(),
      getStaffList(),
      feeLookup({ registrationNo: "1", session: "2025-27", trade: "Fitter" }),
    ]);
    expect(results[0][0]).toContain("ROLL NO");
    expect(results[1][0]).toContain("TOTAL");
    expect(results[2][0]).toContain("TOTAL");
    expect(Array.isArray(results[3])).toBe(true);
    expect(results[4][0]).toContain("STATUS");
    expect(Array.isArray(results[5])).toBe(true);
    expect(Array.isArray(results[6])).toBe(true);
    expect(results[7].student).toMatchObject({ registrationNo: "1", name: "NITISH KUMAR" });
  }, 180_000);
});
