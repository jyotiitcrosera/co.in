import { describe, expect, it } from "vitest";
import { feeLookup } from "./googleSheets";

describe.runIf(process.env.RUN_LIVE_INTEGRATION === "1")("portal live fee adapter", () => {
  it("reads TEST-001 through the configured Google Sheets adapter", async () => {
    const result = await feeLookup({ registrationNo: "TEST-001" });
    expect(result.student?.registrationNo).toBe("TEST-001");
    expect(result.totals.admissionFee).toBe(10000);
    expect(result.totals.balance).toBe(10000);
    expect((result.totals as { mediatorPaid?: number }).mediatorPaid).toBe(0);
  }, 20000);
});
