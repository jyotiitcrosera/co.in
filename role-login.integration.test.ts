import { describe, expect, it } from "vitest";

async function getJson(url: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

describe.skipIf(process.env.RUN_LIVE_INTEGRATION !== "1")("deployed Apps Script login integration", () => {
  const baseUrl = process.env.GOOGLE_SHEETS_API_URL || "";

  it("returns the staff login contract with unit", async () => {
    expect(baseUrl).toContain("script.google.com/macros/s/");
    const body = await getJson(`${baseUrl}?action=staff_login&id=niket&pass=12345`);
    expect(body).toMatchObject({ status: "success", name: expect.any(String), trade: expect.stringMatching(/Fitter|Electrician/), unit: expect.any(String) });
  }, 60_000);

  it("returns the student dashboard contract for a verified roster row", async () => {
    expect(baseUrl).toContain("script.google.com/macros/s/");
    const roster = await getJson(`${baseUrl}?action=get_sheet_data&sheet_name=2026-28ELECTRICIAN`);
    const row = roster[1];
    expect(row).toBeTruthy();
    const roll = encodeURIComponent(String(row[0]));
    const [attendance, monthlyMarks, quarterlyMarks, jobEvolution] = await Promise.all([
      getJson(`${baseUrl}?action=get_sheet_data&sheet_name=ATTENDANCE`),
      getJson(`${baseUrl}?action=get_sheet_data&sheet_name=MONTHLY%20MARKS`),
      getJson(`${baseUrl}?action=get_sheet_data&sheet_name=QUARTERLY%20MARKS`),
      getJson(`${baseUrl}?action=get_sheet_data&sheet_name=JOB%20EVOLUTION`),
    ]);
    expect({ student: { roll: String(row[0]), name: String(row[1]), unit: String(row[3] ?? "") }, attendance, monthlyMarks, quarterlyMarks, jobEvolution }).toHaveProperty("student");
    expect(Array.isArray(attendance)).toBe(true);
    expect(Array.isArray(monthlyMarks)).toBe(true);
    expect(Array.isArray(quarterlyMarks)).toBe(true);
    expect(Array.isArray(jobEvolution)).toBe(true);
    expect(roll).toBe(encodeURIComponent(String(row[0])));
  }, 60_000);
});
