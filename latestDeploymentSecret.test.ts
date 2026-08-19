import { describe, expect, it } from "vitest";

describe("latest Google Sheets deployment secret", () => {
  it("returns JSON from the configured roster endpoint", async () => {
    const base = process.env.GOOGLE_SHEETS_API_URL;
    expect(base).toBeTruthy();
    const response = await fetch(`${base}?action=get_sheet_data&sheet_name=2025-27FITTER`, { redirect: "follow", signal: AbortSignal.timeout(60_000) });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type") || "").toContain("application/json");
    const payload = await response.json();
    expect(payload).toBeTruthy();
    expect(typeof payload).toBe("object");

    const quarterly = await fetch(`${base}?action=get_sheet_data&sheet_name=QUARTERLY%20MARKS`, { redirect: "follow", signal: AbortSignal.timeout(60_000) });
    expect(quarterly.status).toBe(200);
    expect(quarterly.headers.get("content-type") || "").toContain("application/json");
    expect(typeof await quarterly.json()).toBe("object");
  }, 75_000);
});
