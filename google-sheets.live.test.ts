import { describe, expect, it } from "vitest";

describe.skipIf(process.env.RUN_LIVE_INTEGRATION !== "1")("new deployed Google Sheets endpoint", () => {
  it("returns a JSON response for get_notices", async () => {
    const baseUrl = process.env.GOOGLE_SHEETS_API_URL;
    expect(baseUrl).toContain("script.google.com/macros/s/");
    const response = await fetch(`${baseUrl}?action=get_notices`);
    expect(response.ok).toBe(true);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  }, 15_000);
});
