import { describe, expect, it } from "vitest";
import { buildBulkMarkEntries, validateBulkMarkScores, clampBulkMarkValue } from "@shared/bulkMarks";

const students = [
  { roll: "1", name: "Ankit", unit: "1" },
  { roll: "2", name: "Riya", unit: "1" },
];
const details = { trade: "Fitter", session: "2026-28", year: "1st Year", date: "2026-08-15", label: "August" };

describe("workbook-format fixed Admin bulk marks payloads", () => {
  it("creates one Monthly Marks row per selected student with all four components and total", () => {
    expect(buildBulkMarkEntries("monthly_marks", students, {
      "1": { "Practical 50": "50", "Theory 20": "20", "WCS 10": "10", "Drawing 20": "20" },
      "2": { "Practical 50": "40", "Theory 20": "18", "WCS 10": "9", "Drawing 20": "19" },
    }, details)).toEqual([
      ["2026-08-15", "1", "Ankit", "2026-28", "Fitter", "1", "1st Year", "August", 50, 20, 10, 20, 100],
      ["2026-08-15", "2", "Riya", "2026-28", "Fitter", "1", "1st Year", "August", 40, 18, 9, 19, 86],
    ]);
  });

  it("rejects Monthly values above each heading maximum, including Practical 50", () => {
    const invalid = validateBulkMarkScores("monthly_marks", { "1": { "Practical 50": "51", "Theory 20": "21", "WCS 10": "11", "Drawing 20": "21" } });
    expect(invalid.map((item) => item.field)).toEqual(["Practical 50", "Theory 20", "WCS 10", "Drawing 20"]);
    expect(clampBulkMarkValue("monthly_marks", "Practical 50", "51")).toBe("50");
  });

  it("keeps Quarterly Marks on its own four-component column format", () => {
    expect(buildBulkMarkEntries("quarterly_marks", students, {
      "1": { "Practical 50": "50", "Theory 20": "20", "WCS 10": "10", "Drawing 20": "20" },
    }, { ...details, label: "Quarterly 12" })).toEqual([
      ["2026-08-15", "1", "Ankit", "2026-28", "Fitter", "1", "1st Year", "Quarterly 12", 50, 20, 10, 20, 100],
    ]);
  });

  it("uses the separate Job Evolution five-component payload shape", () => {
    expect(buildBulkMarkEntries("job_marks", students, {
      "2": { "A (10)": "10", "B (15)": "15", "C (7)": "7", "D (8)": "8", "E (10)": "10" },
    }, { ...details, label: "Week 2" })).toEqual([
      ["2", "Riya", "2026-28", "Fitter", "1", "1st Year", "Week 2", 10, 15, 7, 8, 10, 50],
    ]);
  });
});
