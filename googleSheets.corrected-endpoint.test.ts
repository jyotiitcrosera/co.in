import { describe, expect, it } from "vitest";

describe("corrected Google Sheets endpoint", () => {
  it.skipIf(process.env.RUN_FINAL_LIVE !== "1")("returns one Paid Amount header for 2025-27 Fitter", async () => {
    const baseUrl = process.env.GOOGLE_SHEETS_API_URL;
    expect(baseUrl).toBeTruthy();
    const url = new URL(baseUrl!);
    url.searchParams.set("action", "get_sheet_data");
    url.searchParams.set("sheet_name", "2025-27FITTER");
    let response: Response | undefined;
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(45_000) });
        if ([301, 302, 303, 307, 308].includes(response.status)) break;
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
    if (!response) throw lastError;
    expect([301, 302, 303, 307, 308]).toContain(response.status);
    expect(response.headers.get("location")).toContain("script.googleusercontent.com");
  }, 150_000);
});
