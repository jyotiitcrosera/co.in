import { feeLookup, getNotices, getSheetData, getStaffList } from "../server/googleSheets";

const probes: Array<[string, () => Promise<unknown>]> = [
  ["roster", () => getSheetData("2025-27FITTER")],
  ["monthly", () => getSheetData("MONTHLY MARKS")],
  ["quarterly", () => getSheetData("QUARTERLY MARKS")],
  ["job", () => getSheetData("JOB EVOLUTION")],
  ["attendance", () => getSheetData("ATTENDANCE")],
  ["notices", () => getNotices()],
  ["staff", () => getStaffList()],
  ["fee", () => feeLookup({ registrationNo: "1", session: "2025-27", trade: "Fitter" })],
];

for (const [name, probe] of probes) {
  const started = Date.now();
  try {
    const result: any = await probe();
    console.log(JSON.stringify({ name, ms: Date.now() - started, ok: true, rows: Array.isArray(result) ? result.length : undefined, status: result?.totals?.status }));
  } catch (error) {
    console.log(JSON.stringify({ name, ms: Date.now() - started, ok: false, error: String(error) }));
  }
}
