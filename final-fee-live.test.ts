import { describe, expect, it } from "vitest";
import { feeLookup } from "./googleSheets";

describe("final Apps Script Fee Ledger deployment", () => {
  it.skipIf(process.env.RUN_FINAL_LIVE !== "1")("returns the populated 2025-27 Fitter fee record through the portal bridge", async () => {
    const result = await feeLookup({ registrationNo: "1", session: "2025-27", trade: "Fitter" });
    expect(result.student).toMatchObject({ registrationNo: "1", name: "NITISH KUMAR" });
    expect(result.totals.admissionFee).toBe(30000);
    expect(result.totals.paid + result.totals.balance).toBe(30000);
    expect(result.totals.paid).toBeGreaterThanOrEqual(2000);
    expect(result.payments.length).toBeGreaterThanOrEqual(1);
    expect(result.payments[0]).toMatchObject({
      2: "1",
      3: "NITISH KUMAR",
      4: "Fitter",
      5: "2025-27",
      6: 30000,
      7: 2000,
    });
    const last = result.payments[result.payments.length - 1];
    expect(Number(last[8])).toBe(result.totals.paid);
    expect(Number(last[9])).toBe(result.totals.balance);
    expect(String(last[10])).toBe(result.totals.status);
  }, 90_000);
});
