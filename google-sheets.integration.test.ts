import { describe, expect, it } from "vitest";

describe.skipIf(process.env.RUN_LIVE_INTEGRATION !== "1")("Google Sheets legacy integration", () => {
  it("responds to the lightweight notices action", async () => {
    const baseUrl = process.env.GOOGLE_SHEETS_API_URL;
    expect(baseUrl).toBeTruthy();

    const response = await fetch(`${baseUrl}?action=get_notices`);
    expect(response.ok).toBe(true);

    const payload = await response.json();
    expect(Array.isArray(payload)).toBe(true);
    if (payload.length > 0) {
      expect(payload[0]).toEqual(expect.objectContaining({
        date: expect.anything(),
        type: expect.anything(),
        content: expect.anything(),
      }));
    }
  }, 15_000);
});
