import { describe, expect, it } from "vitest";

describe("configured Google Sheets endpoint", () => {
  it.skipIf(process.env.RUN_FINAL_LIVE !== "1")("returns a structured JSON response from the configured Apps Script URL", async () => {
    const baseUrl = process.env.GOOGLE_SHEETS_API_URL;
    expect(baseUrl).toMatch(/\/exec$/);
    const url = new URL(baseUrl!);
    url.searchParams.set("action", "get_sheet_data");
    url.searchParams.set("sheet_name", "2025-27FITTER");

    let response: Response | undefined;
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(45_000) });
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          expect(location).toContain("script.googleusercontent.com");
          response = await fetch(location!, { signal: AbortSignal.timeout(45_000) });
        }
        if (response.ok) break;
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
    if (!response?.ok) throw lastError ?? new Error(`Apps Script endpoint returned ${response?.status ?? "no response"}`);
    const body = await response.json();
    expect(Array.isArray(body) || typeof body === "object").toBe(true);
    expect(body[0]).toContain("Paid Amount");
  }, 150_000);
});
