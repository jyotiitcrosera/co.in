import { describe, expect, it } from "vitest";

describe("configured Google Sheets endpoint", () => {
  it.skipIf(process.env.RUN_FINAL_LIVE !== "1")("returns a structured 2030-32 session-sheet response", async () => {
    const baseUrl = process.env.GOOGLE_SHEETS_API_URL;
    expect(baseUrl).toBeTruthy();
    const url = new URL(baseUrl!);
    url.searchParams.set("action", "get_sheet_data");
    url.searchParams.set("sheet_name", "2030-32FITTER");
    let response: Response | undefined;
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(45_000) });
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          response = await fetch(location!, { signal: AbortSignal.timeout(45_000) });
        }
        if (response.ok) break;
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
    if (!response?.ok) throw lastError ?? new Error(`Apps Script endpoint returned ${response?.status ?? "no response"}`);
    const payload = await response.json();
    expect(Array.isArray(payload) || payload?.status === "error").toBe(true);
    if (Array.isArray(payload)) {
      expect(payload[0]).toEqual(expect.arrayContaining(["ROLL NO", "NAME", "TRADE", "UNIT"]));
    }
  }, 150_000);
});
